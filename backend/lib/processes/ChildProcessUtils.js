'use strict';
const process = require('node:process');
const {Error, TypeError} = require('../errors');
const {Events} = require('../util/Constants');
const Util = require('../util/Util');
//TODO доделать документацию
class ChildProcessUtils{
	constructor(client) {
		this.client = client;
		process.on('message', this._handleMessage.bind(this));
		client.on('ready', () => {
			process.env.APPLICATION_ID = `${client.application.id}`;
			process.send({_ready: true});
		});
		client.on('disconnect', () => {
			process.send({_disconnect: true});
		});
		client.on('reconnecting', () => {
			process.send({_reconnecting: true});
		});
	}
	broadcastEval(script, options = {}) {
		return new Promise((resolve, reject) => {
			if (typeof script !== 'function') {
				reject(new TypeError('CHILD_PROCESS_INVALID_EVAL_BROADCAST'));
				return;
			}
			script = `(${script})(this, ${JSON.stringify(options.context)})`;

			const listener = message => {
				if (message._cEval !== script || message._eChildProcess !== options.childProcess) return;
				process.removeListener('message', listener);
				this.decrementMaxListeners(process);
				if(!message._error) resolve(message._result);
				else reject(Util.makeSimpleError(message._error));
			};
			this.incrementMaxListeners(process);
			process.on('message', listener);
			this.send({_cEval: script, _eChildProcess: options.childProcess}).catch(err => {
				process.removeListener('message', listener);
				this.decrementMaxListeners(process);
				reject(err);
			});
		});
	}
	respawnAll({ childProcessDelay = 5_000, respawnDelay = 500, timeout = 30_000} = {}) {
		return this.send({_cRespawnAll: {childProcessDelay, respawnDelay, timeout}});
	}
	async _handleMessage(message) {
		if(!message) return;
		if(message._fetchProp) {
			try {
				const props = message._fetchProp.split('.');
				let value = this.client;
				for (const prop of props) value = value[prop];
				this._respond('fetchProp', {_fetchProp: message._fetchProp, _result: value});
			} catch (err) {
				this._respond('fetchProp', {_fetchProp: message._fetchProp, _error: Util.makeSimpleError(err)});
			}
		}
		else if(message._eval) {
			try {
				this._respond('eval', {_eval: message._eval, result: await this.client._eval(message._eval)});
			} catch (err) {
				this._respond('eval', {_eval: message._eval, result: Util.makeSimpleError(err)});
			}
		}


	}
	static singleton(client){
		if(!this._itself) {
			this._itself = process.env.CHILDPROCESS_MANAGER?
				new this(client) :
				null;
		}
		else {
			client.emit(Events.WARN,'multiple clients created in child process, only first one will handle child process helper');
		}
		return this._itself;
	}
	send(message) {
		return new Promise((resolve, reject) => {
			process.send(message, err => {
				if (err) reject(err);
				else resolve();
			});
		});
	}
	_respond (type, message) {
		this.send(message).catch(err => {
			const error = new Error('CHILD_PROCESS_BROADCAST_ERROR', type, err.message);
			error.stack = err.stack;
			this.client.emit(Events.ERROR, error);
		});
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
//todo: Учесть возможность создания этого класса без менеджера дочерних процессов
module.exports = ChildProcessUtils;
