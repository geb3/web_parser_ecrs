'use strict';
const process = require('node:process');
const EventEmitter = require('node:events');
const childProcess = require('node:child_process');
const path = require('path');
const {Error} = require('../errors');
const {setTimeout: sleep} = require('node:timers/promises');
const Util = require('../util/Util');
//TODO доделать документацию
class Process extends EventEmitter{
	constructor(manager, id) {
		super();
		this.manager = manager;
		this.id = id;
		this.args = manager.childProcessArgs ?? [];
		this.execArgv = manager.execArgv;
		if (!this.manager.file) throw new Error('FILE_NOT_FOUND', this.manager.file);
		this.botOptions = this.manager.botArgs.get(id);
		this.env = Object.assign({}, {
			TOKEN: manager.tokens.get(id),
			NAME: this.botOptions.name,
			GUILDID: this.botOptions.guildId,
			SLASH_COMMANDS_DIR: this.botOptions.slashCommandsDir,
			MESSAGE_COMMANDS_DIR: this.botOptions.messageCommandsDir,
			EVENTS_DIR: this.botOptions.eventDir,
			CHILDPROCESS_MANAGER: process.env.CHILDPROCESS_MANAGER
		});
		this.ready = false;
		this._evals = new Map();
		this.process = null;
		this._exitListener = null;
	}
	spawn(timeout = 30_000) {
		this._exitListener = this._handleExit.bind(this, undefined, timeout);
		this.process = childProcess.fork(path.resolve(this.manager.file), this.args, {
			env: this.env, execArgv: this.execArgv
		})
			.on('message', this._handleMessage.bind(this))
			.on('exit', this._exitListener)
			.on('error', this._exitListener);
		this._evals.clear();
		const child = this.process;
		this.emit('spawn', child);
		if (timeout === -1 || timeout === Infinity)return Promise.resolve(child);
		return new Promise((resolve, reject) => {
			const cleanup = () => {
				clearTimeout(spawnTimeoutTimer);
				this.off('ready', onReady);
				this.off('disconnect', onDisconnect);
				this.off('death', onDeath);
				this.off('err', onErr);
			};
			const onReady = () => {
				cleanup();
				resolve(child);
			};
			const onDisconnect = () => {
				cleanup();
				reject(new Error(`CHILD_PROCESS#${this.id} DISCONNECTED`));
			};
			const onDeath = () => {
				cleanup();
				reject(new Error('CHILD_PROCESS_ERROR', 'DEAD before was ready', `${this.id}`));
			};
			const onErr = (err) => {
				cleanup();
				reject(new Error('CHILD_PROCESS_ERROR', err, `${this.id}`));
			};
			const onTimeout = () => {
				cleanup();
				reject(new Error('CHILD_PROCESS_ERROR','DEAD before was ready', `${this.id}` ));
			};
			const spawnTimeoutTimer = setTimeout(onTimeout,timeout );
			this.once('ready', onReady);
			this.once('err', (err) => {onErr(err);});
			this.once('disconnect', onDisconnect);
			this.once('death', onDeath);
		});
	}
	kill() {
		if (this.process) {
			this.process.removeListener('exit', this._exitListener);
			this.process.kill();
		}
	}
	async respawn({delay = 500, timeout = 30_000} = {}){
		this.kill();
		if (delay > 0) await sleep(delay);
		return this.spawn(timeout);
	}
	send(message) {
		return new Promise((resolve, reject) => {
			if (this.process) {
				this.process.send(message, err => {
					if (err) reject(err);
					else resolve(this);
				});
			}
		});
	}
	eval(script, context) {
		const _eval = typeof script === 'function' ? `(${script})(this, ${JSON.stringify(context)})` : script;
		if (!this.process) return Promise.reject(new Error('CHILD_PROCESS_ERROR', 'does not exist, maybe respawning', `${this.id}`));
		//cash searcher
		if (this._evals.has(_eval)) return this._evals.get(_eval);

		const promise = new Promise((resolve, reject) => {
			const listener = message => {
				if (message?._eval !== _eval) return;
				process.removeListener('message', listener);
				this.decrementMaxListeners(process);
				this._evals.delete(_eval);
				if (!message._error) resolve(message._result);
				else reject(Util.makeSimpleError(message._error));
			};

			this.incrementMaxListeners(process);
			process.on('message', listener);

			this.send({_eval}).catch(err => {
				process.removeListener('message', listener);
				this.decrementMaxListeners(process);
				this._evals.delete(_eval);
				reject(err);
			});
		});
		this._evals.set(_eval, promise);
		return promise;
	}
	_handleMessage(message) {
		if (message) {
			if (message._ready) {
				this.ready = true;
				this.emit('ready');
				return;
			}
			if (message._error) {
				this.ready = false;
				this.emit('err', message.value);
				return;
			}
			if (message._disconnect) {
				this.ready = false;
				this.emit('disconnect');
				return;
			}
			if (message._cEval) {
				const resp = {_cEval: message._cEval, _eChildProcess: message._eChildProcess};
				this.manager._performInChildProcess('eval', [message._cEval], message._eChildProcess).then(
					results => this.send({...resp, _result: results}),
					err => this.send({...resp, _error: Util.makeSimpleError(err)})
				);
				return;
			}
			if (message._cRespawnAll) {
				const {childProcessDelay, respawnDelay, timeout} = message._cRespawnAll;
				this.manager.respawnAll({childProcessDelay, respawnDelay, timeout}).catch(() => {
					//do nothing
				});
				return;
			}
		}
		this.emit('message', message);
	}
	_handleExit(respawn = this.manager.respawn, timeout) {
		this.emit('death', this.process);
		this.process = null;
		this.ready = false;
		this._evals.clear();
		if (respawn){
			console.log('\x1b[33m%s\x1b[0m', `respawning ChildProcess #${this.id} ...`);
			this.spawn(timeout).catch((err) => this.emit('error', err));
		}
	}
	incrementMaxListeners(emitter) {
		const maxListeners = emitter.getMaxListeners();
		if(maxListeners !== 0) {
			emitter.setMaxListeners(maxListeners + 1);
		}
	}
	decrementMaxListeners(emitter) {
		const maxListeners = emitter.getMaxListeners();
		if(maxListeners !== 0) {
			emitter.setMaxListeners(maxListeners - 1);
		}
	}
}
module.exports = Process;