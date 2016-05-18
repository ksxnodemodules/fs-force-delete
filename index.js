
((module) => {
	'use strict';

	var {rmdir, unlink, stat, readdir} = require('fs');
	var path = require('path');
	var justTry = require('try-promise').try;
	var {addPromise} = require('fs-force-utils/promise');
	var Info = require('fs-force-utils/info');
	var Action = require('fs-force-utils/action');
	var _throwif = require('fs-force-utils/throw-if');
	var _donothing = require('fs-force-utils/do-nothing');
	var flatArray = require('fs-force-utils/flat-array');

	var resolvePath = path.resolve;
	var getParent = path.dirname;
	var joinPath = path.join;

	var __rm = (entry, onfinish, onaction) => {
		var callOnFinish = (...action) =>
			onfinish(null, new Info('delete', entry, action));
		stat(entry, (error, info) => {
			if (error) {
				return callOnFinish();
			}
			if (info.isFile()) {
				return unlink(entry, (error) => {
					if (error) {
						return onfinish(error, null);
					}
					var action = new Action('delete', entry, 'file');
					justTry(onaction, [action]);
					callOnFinish(action);
				});
			}
			if (info.isDirectory()) {
				return readdir(entry, (error, list) => {
					if (error) {
						return onfinish(error, null);
					}
					var childpromises = new Set();
					for (let item of list) {
						let callback = (resolve, reject) =>
							__rm(joinPath(entry, item), (error, info) => error ? reject(error) : resolve(info), onaction);
						childpromises.add(new Promise(callback));
					}
					Promise.all(childpromises).then((info) => {
						rmdir(entry, (error) => {
							if (error) {
								onfinish(error, null);
							}
							var action = new Action('delete', entry, 'dir');
							justTry(onaction, [action]);
							callOnFinish(...flatArray(info.map((info) => info.action)), action);
						});
					}).catch((error) => onfinish(error, null));
				});
			}
			onfinish(new Error(`Can't delete entry "${entry}"`), null);
		});
	};

	var _rm = (entry, onfinish, onaction) =>
		addPromise((resolve) => __rm(entry, (...errinf) => resolve(errinf), onaction))
			.onfinish((errinf) => onfinish(...errinf));

	module.exports = (entry, onfinish = _throwif, onaction = _donothing) => _rm(resolvePath(entry), onfinish, onaction);

})(module);
