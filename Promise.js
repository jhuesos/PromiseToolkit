/*jslint indent: 4, browser: true */

/**
 * @author Jaime Vega (jhuesos@gmail.com)
 * @license MIT License
 */
(function () {
	"use strict";

	var Promise = function () {
		if (!this instanceof Promise) {
			return new Promise(arguments);
		}

		this._queue = [];

		return this;
	};

    /**
     * Chain operations depending bases upon state change in of our promises. Both callbacks expects to be called with
     * one parameter, the value obtained after the operation was finished.
     * @param {Function} [onResolved] Callback to call if the operation was resolved.
     * @param {Function} [onRejected] Callback to call if the operation was rejected.
     * @return {Promise} Return the object itself to cascade calls.
     */
	Promise.prototype.then = function (onResolved, onRejected) {
		var callbacks = {
			resolvedCB : onResolved,
			rejectedCB : onRejected
		};

		this._queue.push(callbacks);

		return this;
	};

	Promise.prototype.resolve = function (arg) {
		var cbs = this._queue.shift();

		if (cbs && typeof cbs.resolvedCB === 'function') {
			cbs.resolvedCB(arg);
		}

		return this;
	};

	Promise.prototype.reject = function (arg) {
		var cbs = this._queue.shift();

		if (cbs && typeof cbs.rejectedCB === 'function') {
			cbs.rejectedCB(arg);
		}

		return this;
	};

    // Export Promise to global scope
	window.Promise = Promise;
}());