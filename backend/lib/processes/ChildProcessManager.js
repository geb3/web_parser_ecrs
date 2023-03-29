'use strict';
const EventEmitter = require('node:events');
const path = require('path');
const process = require('node:process');
const {setTimeout: sleep} = require('node:timers/promises');
const fs = require('fs');
const ChildProcess = require('./ChildProcess');
const {Error, TypeError} = require('../errors');

/**
 * Manager for creating child processes
 */
class ChildProcessManager extends EventEmitter {
	/**
	 * @param {string} file File to start child process in
	 * @param {Array} options Options to the child processes
	 */
	constructor(file, options = []) {
		super();
		if (process.env.SHARDING_MANAGER) throw new Error('CHILD_PROCESS_WITH_SHARDING');
		if (process.channel) throw new Error('CHILD_PROCESS_EXIST');
		this.totalChildProcesses = options.length;
		this.file = file;
		if (!file)throw new Error('FILE_NOT_FOUND', file);
		if (!path.isAbsolute(file)) this.file = path.resolve(process.cwd(), file);
		const stats = fs.statSync(this.file);
		if (!stats.isFile())throw new TypeError('INVALID_OPTION', 'file', 'JavaScript file');
		this.childProcesses = new Map();
		this.tokens = new Map();
		let id = 0;
		this.botArgs = new Map();
		for (const option of options){
			this.tokens.set(id, option.token);
			this.botArgs.set(id, option);
			id ++;
		}
		Object.assign(options, {
			respawn: true,
			childProcessArgs: [],
			execArgv: [],
		});
		this.childProcessArgs = options.childProcessArgs;
		this.execArgv = options.execArgv;
		this.respawn = options.respawn;
		process.env.CHILDPROCESS_MANAGER = true;

	}

	/**
	 * Creates an Object of single child process, but not spawning it
	 * @param {number} id Id of this child process
	 * @returns {Process}
	 */
	createChildProcess(id = this.childProcesses.size) {
		const childProcess = new ChildProcess(this, id);
		this.childProcesses.set(id, childProcess);
		this.emit('childProcessCreate', childProcess);
		return childProcess;
	}

	/**
	 * Options used to spawn multiple child processes.
	 * @typedef {Object} MultipleChildSpawnOptions
	 * @property {number|string} [amount=this.totalChildProcesses] Number of processes to spawn
	 * @property {number} [delay=5500] Delay before spawning
	 * @property {number} [timeout=30000] How much time to wait until child process will be online
	 */

	/**
	 * Spawning child processes
	 * @param {MultipleChildSpawnOptions} [options] Options to spawn child processes
	 * @returns {Promise<Map<number, ChildProcess>>}
	 */
	async spawn({amount = this.totalChildProcesses, delay = 5500, timeout = 30_000} = {}){
		if (this.childProcesses.size >= amount) throw new Error('CHILD_PROCESS_MANAGER', 'already created');
		this.childProcessesList = [...Array(amount).keys()];

		// Spawning
		for (const childProcessId of this.childProcessesList){
			const promises = [];
			const childProcess = this.createChildProcess(childProcessId);
			promises.push(childProcess.spawn(timeout));
			if (delay > 0 && this.childProcesses.size !== this.childProcessesList.length) promises.push(sleep(delay));
			await Promise.all(promises);
		}
		return this.childProcesses;
	}

	/**
	 * Sends message for all processes
	 * @param {*} message
	 * @returns {Promise<Awaited<ChildProcess>[]>}
	 */
	broadcast(message) {
		const promises = [];
		for (const child of this.childProcesses.values()) promises.push(child.send(message));
		return Promise.all(promises);
	}

	/**
	 * Options for {@link ChildProcessManager#broadcastEval} and {@link ChildProcessUtils#broadcastEval}
	 * @typedef {Object} BroadcastEvalOptions
	 * @property {number} [child] Child process to run script on, all if undefined
	 * @property {*} [context] The JSON-serializable values to call the script with
	 */

	/**
	 * Evaluates a script on all processes, or a given process, in the context of the {@link Client}
	 * @param {Function} script JavaScript to run on each child
	 * @param {BroadcastEvalOptions} [options={}]
	 * @returns {Promise<*|Array<*>>}
	 */
	broadcastEval(script, options = {}) {
		if (typeof script !== 'function') return Promise.reject(new TypeError('CHILD_PROCESS_INVALID_EVAL_BROADCAST'));
		return this._performInChildProcess('eval', [`(${script})(this, ${JSON.stringify(options.context)}`], options.childProcess);
	}

	/**
	 * Runs a method with given arguments on each child, or given child process
	 * @param {string} method Method name to run on each shard
	 * @param {Array<*>} args Arguments to pass through
	 * @param {number} [child] The child process to run in, all in undefined
	 * @returns {Promise<*|Array<*>>} Results of the method execution
	 * @private
	 */
	_performInChildProcess(method, args, child) {
		if (this.childProcesses.size === 0) return Promise.reject(new Error('CHILD_PROCESS_NO_CHILD_PROCESS'));

		if (typeof child === 'number') {
			if (this.childProcesses.has(child)) return this.childProcesses.get(child)[method](...args);
			return Promise.reject(new Error('CHILD_PROCESS_MANAGER', 'not found'));
		}

		if (this.childProcesses.size !== this.childProcessesList.length) return Promise.reject(new Error('CHILD_PROCESS_MANAGER', 'spawning in progress'));

		const promises = [];
		for (const ch of this.childProcesses.values()) promises.push(ch[method](...args));
		return Promise.all(promises);
	}

	/**
	 * Options used to respawn all child processes
	 * @typedef {Object} MultipleChildProcessRespawnOptions
	 * @property {number} [childProcessDelay] How much time wait between (ms)
	 * @property {number} [respawnDelay] How long to wait between killing process and restarting it (ms)
	 * @property {number} [timeout] Amount of time to wait for process to be ready (ms) before
	 * continuing to another ('-1' or 'Infinity' for no wait)
	 */
	/**
	 * Kills all processes and respawning them.
	 * @param {MultipleChildSpawnOptions} [options] Options for respawning processes
	 * @returns {Promise<Map<ChildProcess, number>>}
	 */
	async respawnAll({childProcessDelay = 5_000,  respawnDelay = 500, timeout = 30_000} = {}) {
		let c = 0;
		for (const child of this.childProcesses.values()){
			const promises = [child.respawn({delay: childProcessDelay, timeout})];
			if (++c < this.childProcesses.size && childProcessDelay > 0) promises.push(sleep(respawnDelay));
			await Promise.all(promises);
		}
		return this.childProcesses;
	}
}
module.exports = ChildProcessManager;