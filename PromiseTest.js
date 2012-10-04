/*jshint indent:4, browser:true, newcap:true */
/*global Promise, AsyncTestCase, TestCase, assertTrue, assertFalse, assertFunction */

/**
 * @author Jaime Vega (jhuesos@gmail.com)
 * @license MIT License
 */
(function () {
	"use strict";

	// Preparation code

	// AsyncFn is a method who simulates the behaviour of an async function called using setTimeout and uses Promise.
	var asyncFn = function (successful) {
		var fnToCall,
			promise = new Promise(),
			success = function () {
				promise.resolve();
			},
			fail = function () {
				promise.reject();
			};


		fnToCall = successful ? success : fail;

		setTimeout(function () {
			fnToCall();
		}, 10);

		return promise;
	};

	// General Basic promise test suite
	var PromiseTestSuite = new TestCase("Promise");

	PromiseTestSuite.prototype.testContainsThenMethod = function () {
		var promise = new Promise();

		assertFunction(promise.then);
	};

	PromiseTestSuite.prototype.testContainsResolveMethod = function () {
		var promise = new Promise();

		assertFunction(promise.resolve);
	};

	PromiseTestSuite.prototype.testContainsRejectMethod = function () {
		var promise = new Promise();

		assertFunction(promise.reject);
	};

	// Then / Promise full implementation test suite
	var ThenTestSuite = new AsyncTestCase("Then"),
		promise;

	ThenTestSuite.prototype.setUp = function () {
		promise = new Promise();
	};

	ThenTestSuite.prototype.testReturnsPromiseInstanceForCascading = function () {
		var fn = function () {};

		assertTrue(promise.then(fn) instanceof Promise);
	};

	ThenTestSuite.prototype.testSimpleThenWithSuccessCB = function (queue) {

		var called = false;

		queue.call("Step 1: Run async method with promises", function (callbacks) {

			var fn = callbacks.add(function () {
				called = true;
			});

			asyncFn(true).then(fn);

			// At this point, since asyncFn is an async fn, called should be still false
			assertFalse(called);
		});

		queue.call("Step 2: Check if resolve cb was called", function () {
			assertTrue(called);
		});
	};

	ThenTestSuite.prototype.testRejectedRequestWithBothCBs = function (queue) {
		var successCalled = false,
			rejectedCalled = false;

		queue.call("Step 1: Run async method with promises and rejected request", function (callbacks) {

			var successFn = function () {
					successCalled = true;
				},
				rejectFn = callbacks.add(function () {
					rejectedCalled = true;
				});

			// Calling async fn with false, we make sure the "request" fails
			asyncFn(false).then(successFn, rejectFn);

			// At this point, since asyncFn is an async fn, called should be still false
			assertFalse(rejectedCalled);
			assertFalse(successCalled);
		});

		queue.call("Step 2: Check if only rejected cb was called", function () {
			assertTrue(rejectedCalled);
			assertFalse(successCalled);
		});
	};
}());
