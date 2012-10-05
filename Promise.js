/*jshint indent:4, browser:true, strict:false */
/**
 * @author Jaime Vega (jhuesos@gmail.com)
 * @license MIT License
 */
(function () {
	var Promise = function () {
		if (!this instanceof Promise) {
			return new Promise(arguments);
		}

		this._queue = [];

		return this;
	};

    /**
     * Chain operations depending bases upon state change in of our promises. Both callbacks expects to be called with
     * one parameter, the value obtained after the operation was finished. Promise support add multiple then
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

    /**
     * Set the promise as resolved and call resolved callback with an argument
     * @param {*} arg Argument to pass to the callback
     * @return {Promise} Return the object itself to cascade calls.
     */
	Promise.prototype.resolve = function (arg) {
		var cbs = this._queue.shift();

		if (cbs && typeof cbs.resolvedCB === 'function') {
			cbs.resolvedCB(arg);
		}

		return this;
	};

    /**
     * Set the promise as rejected and call rejected callback with an argument
     * @param {*} arg Argument to pass to the callback.
     * @return {Promise} Return the object itself to cascade calls.
     */
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