/*jshint indent:4, browser:true */
/*global Promise, AsyncTestCase, TestCase, assertTrue, assertFalse, assertFunction, assertEquals */
/**
 * @author Jaime Vega (jhuesos@gmail.com)
 * @license MIT License
 */
(function () {
	"use strict";

	// PREPARATION CODE

    // AsyncFn is a method who simulates the behaviour of an async function called using setTimeout and uses Promise.
    // Accepts an array which indicates if the async calls were successful or failed. For example: [true, false]
    // will simulate two async consecutive calls, first successful and other failed.
    var asyncMultipleCbs = function (successful, args) {
            var promise = new Promise(),
                success = function (arg) {
                    promise.resolve(arg);
                },
                fail = function (arg) {
                    promise.reject(arg);
                },
                asyncFn = function (successful, args) {
                    setTimeout(function () {
                        if (successful.shift()) {
                            success(args.shift());
                        } else {
                            fail(args.shift());
                        }

                        if (successful.length > 0) {
                            asyncFn(successful, args);
                        }
                    }, 10);
                };

            asyncFn(successful, args);

            return promise;
        };

    // UNIT TESTS

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

            asyncMultipleCbs([true], [1]).then(fn);

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
            asyncMultipleCbs([false], [0]).then(successFn, rejectFn);

			// At this point, since asyncFn is an async fn, called should be still false
			assertFalse(rejectedCalled);
			assertFalse(successCalled);
		});

		queue.call("Step 2: Check if only rejected cb was called", function () {
			assertTrue(rejectedCalled);
			assertFalse(successCalled);
		});
	};

    ThenTestSuite.prototype.testPromiseWithMultipleAsyncCallsAndArgs = function (queue) {
        var successCalled = 0,
            rejectedCalled = 0,
            args = [];

        queue.call("Step 1: Run async method with promises and rejected request", function (callbacks) {

            var successFn = callbacks.add(function (arg) {
                    successCalled += 1;
                    args.push(arg);
                }),
                rejectFn = callbacks.add(function (arg) {
                    rejectedCalled += 1;
                    args.push(arg);
                });

            // Calling async fn with false, we make sure the "request" fails
            asyncMultipleCbs([true, false], [1, 2]).then(successFn, rejectFn).then(successFn, rejectFn);

            // At this point, since asyncFn is an async fn, called should be still false
            assertEquals(0, rejectedCalled);
            assertEquals(0, successCalled);
            assertEquals([], args);
        });

        queue.call("Step 2: Check if only rejected cb was called", function () {
            assertEquals(1, rejectedCalled);
            assertEquals(1, successCalled);
            assertEquals([1, 2], args);
        });
    };
}());
