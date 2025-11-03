// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.EventHub
 */
sap.ui.define([
    "sap/ushell/EventHub",
    "sap/ushell/test/utils",
    "sap/base/Log"
], (EventHub, testUtils, Log) => {
    "use strict";

    /* global QUnit, sinon */

    function fnFunction () { }

    QUnit.module("EventHub functionality - #on", {
        beforeEach: function () { EventHub._reset(); }
    });

    QUnit.test("it returns a doable", function (assert) {
        const oDoable = EventHub.on("Event");

        assert.strictEqual(typeof oDoable.do, "function", "result exposes a #do function");
        assert.strictEqual(typeof oDoable.off, "function", "result exposes an #off function");
    });

    QUnit.test("it does not call callback if nothing is emitted", function (assert) {
        const oCallback = sinon.stub();

        EventHub
            .on("WeatherChange")
            .do(oCallback);

        assert.strictEqual(oCallback.callCount, 0, "callback is not called");
    });

    QUnit.test("it does not call callback if another event is emitted", function (assert) {
        const oCallback = sinon.stub();

        EventHub
            .on("EventA")
            .do(oCallback);

        EventHub.emit("EventB");

        assert.strictEqual(oCallback.callCount, 0, "callback is not called");
    });

    QUnit.test("it does not call callback immediately when an event is emitted after listener is attached", function (assert) {
        const oCallback = sinon.stub();

        EventHub
            .on("Event")
            .do(oCallback);

        EventHub.emit("Event", 1);

        assert.strictEqual(oCallback.callCount, 0, "callback is called");
    });

    QUnit.test("it calls callback asynchronously when an event is emitted after listener is attached", function (assert) {
        // Arrange
        const fnDone = assert.async();

        EventHub
            .on("Event")
            .do(() => {
                // Assert
                assert.ok(true, "callback is called asynchronously");
                fnDone();
            });

        // Act
        EventHub.emit("Event", 1);
    });

    QUnit.test("it does not call callback immediately when an event is emitted before listener is attached", function (assert) {
        const oCallback = sinon.stub();

        EventHub.emit("Event");

        EventHub
            .on("Event")
            .do(oCallback);

        assert.strictEqual(oCallback.callCount, 0, "callback is not called");
    });

    QUnit.test("it calls callback asynchronously when an event is emitted before listener is attached", function (assert) {
        // Arrange
        const fnDone = assert.async();
        EventHub.emit("Event");

        EventHub
            .on("Event")
            .do(() => {
                // Assert
                assert.ok(true, "callback is called");
                fnDone();
            });
    });

    QUnit.test("it calls callback one time if multiple events are emitted before listener is attached", function (assert) {
        // Arrange
        const fnDone = assert.async();
        assert.expect(1);

        // Act
        EventHub
            .emit("Event", 1)
            .emit("Event", 2)
            .emit("Event", 3);

        EventHub
            .on("Event")
            .do(() => {
                // Assert
                assert.ok(true, "callback is called");
                setTimeout(fnDone, 100); // just in case is called more times
            });
    });

    QUnit.test("it calls callback once with the last value if the same event is emitted synchronously in a chain", function (assert) {
        // Arrange
        assert.expect(1);
        const fnDone = assert.async();
        const iCallCount = 0;

        // Act
        EventHub
            .on("Event")
            .do((iValue) => {
                // Assert
                assert.strictEqual(iValue, 3, `callback is called with the expected value on call #${iCallCount}`);
                fnDone();
            });

        EventHub
            .emit("Event", 1)
            .emit("Event", 2)
            .emit("Event", 3); // <-- wins
    });

    QUnit.test("it calls callback one time if multiple events with the same data are emitted after listener is attached", function (assert) {
        // Arrange
        assert.expect(1);
        const fnDone = assert.async();

        EventHub
            .on("Event")
            .do(() => {
                // Assert
                assert.ok(true, "function was called");
                setTimeout(fnDone, 100);
            });

        // Act
        EventHub
            .emit("Event", 1)
            .emit("Event", 1)
            .emit("Event", 1);
    });

    QUnit.test("it calls the callback three times if multiple events with the same data are emitted but fireAlways flag is true", function (assert) {
        // Arrange
        const fnDone = assert.async();
        assert.expect(3);

        const fnWait = EventHub.wait.bind(null, "Event");
        const fnEmit = EventHub.emit.bind(null, "Event", 1, true);

        EventHub
            .on("Event")
            .do(() => {
                // Assert
                assert.ok(true, "listener was called");
            });

        // Act
        fnEmit();
        fnWait()
            .then(fnEmit)
            .then(fnWait)
            .then(fnEmit)
            .then(fnDone);
    });

    QUnit.test("it calls callback with data if event is emitted with data", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oEmittedData = { some: "data" };

        EventHub
            .on("Event")
            .do((oGotData) => {
                // Assert
                assert.deepEqual(oGotData, oEmittedData,
                    "the callback was called with the same data that were emitted");

                fnDone();
            });

        // Act
        EventHub.emit("Event", oEmittedData);
    });

    QUnit.test("it calls callback with last data emitted when multiple events are emitted before listener is attached", function (assert) {
        // Arrange
        assert.expect(1);
        const fnDone = assert.async();
        const oEmittedData1 = { some: "data1" };
        const oEmittedData2 = { some: "data2" };
        const oEmittedData3 = { some: "data3" };

        EventHub.emit("Event", oEmittedData1);
        EventHub.emit("Event", oEmittedData2);
        EventHub.emit("Event", oEmittedData3);

        // Act
        EventHub
            .on("Event")
            .do((oGotData) => {
                // Assert
                assert.deepEqual(oGotData, oEmittedData3,
                    "the callback was called with the last data emitted");
                fnDone();
            });
    });

    QUnit.test("it calls the whole chain of do callbacks when an event is emitted", function (assert) {
        // Arrange
        assert.expect(1);
        const fnDone = assert.async();
        const aRecordedCalls = [];
        function oCallback1 () { aRecordedCalls.push("first"); }
        function oCallback2 () { aRecordedCalls.push("second"); }
        function oCallback3 () { aRecordedCalls.push("third"); }

        // Act
        EventHub
            .on("Event")
            .do(oCallback1)
            .do(oCallback2)
            .do(oCallback3);

        EventHub.emit("Event", 1);

        // Assert
        setTimeout(() => {
            assert.deepEqual(aRecordedCalls.sort(), ["first", "second", "third"].sort(),
                "the registered callbacks were called in order");
            fnDone();
        }, 100);
    });

    QUnit.test("it calls the whole chain of do callbacks once with the latest value when an event is emitted multiple times synchronously", function (assert) {
        // Arrange
        const fnDone = assert.async();
        assert.expect(1);

        const aRecordedCalls = [];
        function oCallback1 () { aRecordedCalls.push("first"); }
        function oCallback2 () { aRecordedCalls.push("second"); }
        function oCallback3 () { aRecordedCalls.push("third"); }

        // Act
        EventHub
            .on("Event")
            .do(oCallback1)
            .do(oCallback2)
            .do(oCallback3)
            .do(() => {
                // Assert
                assert.deepEqual(aRecordedCalls.sort(), [
                    "first", "second", "third"
                ].sort(), "the registered callbacks were called once (no order assumed)");

                fnDone();
            });

        EventHub.emit("Event", 1);
        EventHub.emit("Event", 2);
    });

    QUnit.test("it calls the whole chain of do callbacks multiple times when an event is emitted multiple times asynchronously", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const aRecordedCalls = [];
        function oCallback1 () { aRecordedCalls.push("first"); }
        function oCallback2 () { aRecordedCalls.push("second"); }
        function oCallback3 () { aRecordedCalls.push("third"); }

        // Act
        EventHub
            .on("Event")
            .do(oCallback1)
            .do(oCallback2)
            .do(oCallback3);

        const fnWait = EventHub.wait.bind(null, "Event");

        EventHub.emit("Event", 1);
        fnWait()
            .then(EventHub.emit.bind(null, "Event", 2))
            .then(fnWait)
            .then(() => {
                // Assert
                assert.deepEqual(aRecordedCalls.sort(), [
                    "first",
                    "second",
                    "third",
                    "first",
                    "second",
                    "third"
                ].sort(), "the registered callbacks were called multiple times (no order assumed)");

                fnDone();
            });
    });

    QUnit.test("it calls chained and non-chained #do callbacks in no particular order", function (assert) {
        const fnDone = assert.async();
        const aRecordedCalls = [];
        function oCallback1 () { aRecordedCalls.push("first"); }
        function oCallback2 () { aRecordedCalls.push("second"); }
        function oCallback3 () { aRecordedCalls.push("third"); }
        function oCallback4 () { aRecordedCalls.push("fourth"); }

        const oDoable = EventHub.on("Event");
        oDoable.do(oCallback1).do(oCallback2);
        oDoable.do(oCallback3);
        oDoable.do(oCallback4);

        EventHub.emit("Event", 1); // should both the callback be called? -> yes

        setTimeout(() => {
            assert.deepEqual(aRecordedCalls.sort(), ["first", "second", "third", "fourth"].sort(),
                "the registered callbacks were called in no particular order");
            fnDone();
        }, 100);
    });

    QUnit.test("it calls each listener registered on the same event", function (assert) {
        const fnDone = assert.async();
        // Arrange
        const oCallback1 = sinon.stub();
        const oCallback2 = sinon.stub();

        // Act
        EventHub
            .on("Event")
            .do(oCallback1);
        EventHub
            .on("Event")
            .do(oCallback2);

        EventHub.emit("Event", 1);

        // Assert
        setTimeout(() => {
            assert.strictEqual(oCallback1.callCount, 1, "callback from first listener was called");
            assert.strictEqual(oCallback2.callCount, 1, "callback from second listener was called");
            fnDone();
        }, 100);
    });

    QUnit.test("it allows #off to be called independently on each listener registered on the same event (#emit before #on)", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback1 = sinon.stub();
        const oCallback2 = sinon.stub();

        // Act
        EventHub.emit("Event", 1);

        EventHub
            .on("Event")
            .do(oCallback1)
            .off(); // note: off called before oCallback2 is registered

        EventHub
            .on("Event")
            .do(oCallback2);

        // Assert
        EventHub.on("Event").do(() => {
            assert.strictEqual(oCallback1.callCount, 1, "callback from first listener was called");
            assert.strictEqual(oCallback2.callCount, 1, "callback from second listener was called");
            fnDone();
        });
    });

    QUnit.test("it allows #off to be called before do is called", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback1 = sinon.stub();
        const oCallback2 = sinon.stub();

        // Act
        EventHub.emit("Event", 1);

        const oDoable = EventHub.on("Event");

        oDoable.off(); // mark as off after first value is returned

        oDoable.do(oCallback1);
        oDoable.do(oCallback2);

        // Assert
        setTimeout(() => {
            assert.strictEqual(oCallback1.callCount, 1, "callback from first listener was called");
            assert.strictEqual(oCallback2.callCount, 1, "callback from second listener was called");
            fnDone();
        }, 100);
    });

    QUnit.test("it allows #off to be called independently on each listener registered on the same event (#emit after #on)", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback1 = sinon.stub();
        const oCallback2 = sinon.stub();

        // Act
        EventHub
            .on("Event")
            .do(oCallback1)
            .off(); // note: off called before oCallback2 is registered

        EventHub
            .on("Event")
            .do(oCallback2);

        EventHub.emit("Event", 1);

        // Assert
        setTimeout(() => {
            assert.strictEqual(oCallback1.callCount, 0, "callback from first listener was not called");
            assert.strictEqual(oCallback2.callCount, 1, "callback from second listener was called");
            fnDone();
        }, 100);
    });

    QUnit.test("it allows #off to be called independently on each listener registered on the same event (#emit after #on(s))", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback1 = sinon.stub();
        const oCallback2 = sinon.stub();

        // Act
        const oDoable = EventHub.on("Event");
        oDoable.do(() => {
            oCallback1(); // record call
            oDoable.off(); // do not prevent the next #on to be called
        });

        EventHub
            .on("Event")
            .do(oCallback2);

        EventHub.emit("Event", 1);

        // Assert
        setTimeout(() => {
            assert.strictEqual(oCallback1.callCount, 1, "callback from first listener was called");
            assert.strictEqual(oCallback2.callCount, 1, "callback from second listener was called");
            fnDone();
        }, 100);
    });

    QUnit.test("it allows #off to be called independently on each listener registered on the same event (#emit between #on(s))", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback1 = sinon.stub();
        const oCallback2 = sinon.stub();

        // Act
        EventHub
            .on("Event")
            .do(oCallback1) // [A]
            .off(); // note: off called before oCallback2 is registered

        EventHub.emit("Event", 1);

        EventHub
            .on("Event")
            .do(oCallback2); // [B]

        EventHub
            .wait("Event") // dispatch to callback [A]
            .then(() => {
                // Assert
                EventHub
                    .on("Event")
                    .do(() => { // executed after [B]
                        assert.strictEqual(oCallback1.callCount, 0, "callback from first listener was not called");
                        assert.strictEqual(oCallback2.callCount, 1, "callback from second listener was called");
                        fnDone();
                    });
            });
    });

    QUnit.test("it does not dispatch any event once when #off called", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback = sinon.stub();

        // Act
        EventHub
            .on("Event")
            .do(oCallback)
            .off();

        EventHub.emit("Event", 1);
        EventHub.emit("Event", 2); // dispatching is asynchronous, so this wins because data is more up to date

        // Assert
        EventHub.wait("Event").then(() => {
            assert.strictEqual(oCallback.callCount, 0, "callback was not called");
            fnDone();
        });
    });

    QUnit.test("it does not dispatch further events when #off is called inside the callback", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oStub = sinon.stub();

        // Act
        const oDoable = EventHub.on("Event");

        oDoable.do(() => {
            oStub(); // track call count

            oDoable.off();
        });

        const fnWait = EventHub.wait.bind(null, "Event");

        EventHub.emit("Event", 1);
        fnWait()
            .then(() => {
                EventHub.emit("Event", 2);
            })
            .then(fnWait)
            .then(() => {
                EventHub.emit("Event", 3);
            })
            .then(fnWait)
            .then(() => {
                // Assert
                assert.strictEqual(oStub.callCount, 1, "callback was not called further times");
                fnDone();
            });
    });

    QUnit.test("it does not dispatch to the next do when #off called inside a previous callback", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallbackA = sinon.stub();
        const oCallbackB = sinon.stub();

        // Act
        const oDoable = EventHub.on("Event");

        oDoable
            .do(oCallbackA)
            .do(() => {
                oDoable.off();
            })
            .do(oCallbackB);

        const fnWait = EventHub.wait.bind(null, "Event");

        EventHub.emit("Event", 1);
        fnWait()
            .then(() => {
                return EventHub.emit("Event", 2);
            })
            .then(fnWait)
            .then(() => {
                // Assert
                assert.strictEqual(oCallbackA.callCount, 1, "callback A was only called one time");
                assert.strictEqual(oCallbackB.callCount, 0, "callback B was not called");
                fnDone();
            });
    });

    QUnit.test("it allows off to be called multiple times on a do-able", function (assert) {
        // Arrange
        const oCallback = sinon.stub();

        // Act
        try {
            EventHub.on("Event")
                .do(oCallback)
                .off()
                .off();

            // Assert
            assert.ok(true, "no error was thrown");
        } catch (oError) {
            // Assert
            assert.ok(false, `no error was thrown DEBUG: ${oError.message}`);
        }
    });

    QUnit.test("it allows idempotent off operation", function (assert) {
        // Arrange
        const fnDone1 = assert.async();
        const fnDone2 = assert.async();
        const oCallback = sinon.stub();

        // Act
        const oDoable = EventHub.on("Event");

        oDoable
            .do(oCallback);

        EventHub.emit("Event", 1); // --> event queued for dispatching (dispatching is async)
        EventHub.emit("Event", 2); // --> new data! previous event is cancelled and this one is dispatched instead.

        oDoable.off(); // calling off a number of times has no extra effect
        oDoable.off();

        const fnWait = EventHub.wait.bind(null, "Event");

        fnWait()
            .then(() => {
                EventHub.emit("Event", 3); // --> does not reach the callback (off was called already)
                fnDone1();
            })
            .then(fnWait)
            .then(() => {
                assert.strictEqual(oCallback.callCount, 1, "callback was called only once");
                fnDone2();
            });
    });

    QUnit.test("it does not allow a #do call again, if #off was already called", function (assert) {
        // Arrange
        const oCallback = sinon.stub();

        // Act
        const oOffed = EventHub
            .on("Event")
            .do(oCallback)
            .off();

        // Assert
        assert.strictEqual(typeof oOffed.do, "undefined", "no #do method is present after calling #off on a doable");
    });

    QUnit.test("#off only unsubscribes after the data are dispatched at least once", function (assert) {
        //
        // Calling #on declares that data WILL come, so calling off has no
        // immediate effect.
        //
        const oCallback = sinon.stub();
        const fnDone = assert.async();

        const oDoable = EventHub.on("Event");

        oDoable.do(oCallback).off(); // note: #off unsubscribes only after the data returned

        EventHub.emit("Event", 1);

        EventHub.wait("Event").then(() => {
            assert.strictEqual(oCallback.callCount, 0, "callback was not called");
            fnDone();
        });
    });

    QUnit.test("it allows a doable to be executed from inside another doable callback", function (assert) {
        // Arrange
        const oCallback = sinon.stub();
        const fnDone = assert.async();

        // Act
        const oDoable = EventHub.on("Event");
        oDoable.do((x) => {
            oCallback(); // called

            oDoable.do((y) => { // every time there is an extra listener registered
                oCallback();
            });
        });
        const fnWait = EventHub.wait.bind(null, "Event");

        EventHub.emit("Event", 1);
        fnWait()
            .then(() => {
                EventHub.emit("Event", 2);
            })
            .then(fnWait)
            .then(() => {
                // Assert
                assert.strictEqual(oCallback.callCount, 5,
                    "callback was called 5 times");
                fnDone();
            });
    });

    QUnit.test("it preserves the originally emitted data if a registered callback changes them (#emit before #do)", function (assert) {
        const fnDone = assert.async();
        const oEmittedData = {
            weather: "sunny"
        };

        EventHub.emit("WeatherInfo", oEmittedData);

        const fnWait = EventHub.wait.bind(null, "WeatherInfo");

        fnWait()
            .then(() => {
                EventHub.on("WeatherInfo")
                    .do((oEventData) => {
                        oEventData.weather = "cloudy"; // change the weather
                    });
            })
            .then(fnWait)
            .then(() => {
                assert.deepEqual(oEmittedData, { weather: "sunny" },
                    "original emitted data remain unchanged if callback changes them");
                fnDone();
            });
    });

    QUnit.test("it preserves the originally emitted data if a registered callback changes them (#emit after #do)", function (assert) {
        const fnDone = assert.async();
        const oEmittedData = {
            weather: "sunny"
        };

        EventHub
            .on("WeatherInfo")
            .do((oEventData) => {
                oEventData.weather = "cloudy"; // change the weather
            });

        const fnWait = EventHub.wait.bind(null, "WeatherInfo");

        fnWait()
            .then(() => {
                EventHub.emit("WeatherInfo", oEmittedData);
            })
            .then(fnWait)
            .then(() => {
                assert.deepEqual(oEmittedData, { weather: "sunny" },
                    "original emitted data remain unchanged if callback changes them");
                fnDone();
            });
    });

    [{
        testDescription: "undefined",
        vEmittedData: undefined,
        expected: undefined
    }, {
        testDescription: "a string",
        vEmittedData: "test string",
        expected: "test string"
    }, {
        testDescription: "a boolean",
        vEmittedData: true,
        expected: true
    }, {
        testDescription: "a serializable object",
        vEmittedData: { a: [1, 2, 3, 4, 5] },
        expected: { a: [1, 2, 3, 4, 5] }
    }, {
        testDescription: "null",
        vEmittedData: null,
        expected: null
    }, {
        testDescription: "number",
        vEmittedData: 123,
        expected: 123
    }, {
        testDescription: "zero",
        vEmittedData: 0,
        expected: 0
    }, {
        testDescription: "the empty string",
        vEmittedData: "",
        expected: ""
    }, {
        testDescription: "a function",
        vEmittedData: fnFunction,
        expected: fnFunction
    }, {
        testDescription: "an array with functions",
        vEmittedData: [1, 2, fnFunction, 3, 4],
        expected: [1, 2, fnFunction, 3, 4]
    }, {
        testDescription: "an object with a function as a member",
        vEmittedData: {
            a: 1,
            fn: fnFunction
        },
        expected: {
            a: 1,
            fn: fnFunction
        }
    }].forEach((oFixture) => {
        QUnit.test(`it can emit ${oFixture.testDescription}`, function (assert) {
            const fnDone = assert.async();
            EventHub.emit("event", oFixture.vEmittedData);

            EventHub
                .on("event")
                .do((oData) => {
                    assert.deepEqual(oData, oFixture.expected, "the expected data were returned");
                    fnDone();
                });
        });
    });

    QUnit.test("it keeps on handler listening for future notifications after a burst of events have been emitted", function (assert) {
        const fnDone = assert.async();
        let iCallCount = 0;

        EventHub
            .on("event")
            .do((iNextCount) => {
                iCallCount++;
                assert.strictEqual(iNextCount, 20, "got expected value");
                assert.strictEqual(iCallCount, 1, "called handler one time");
                fnDone();
            });

        // burst of events
        for (let i = 0; i <= 20; i++) {
            EventHub.emit("event", i);
        }
    });

    QUnit.test("it does not unsubscribe listeners in future emits", function (assert) {
        const fnDone = assert.async();

        EventHub
            .on("event")
            .do((iNum) => {
                if (iNum === 20) {
                    // first call
                    EventHub.emit("event", 100);
                    return;
                }

                // second call
                assert.strictEqual(iNum, 100, "second call was made");
                fnDone();
            });

        // burst of events causes callback to be called once
        for (let i = 0; i <= 20; i++) {
            EventHub.emit("event", i);
        }
    });

    QUnit.module("EventHub functionality - #emit", {
        beforeEach: function () { EventHub._reset(); }
    });

    QUnit.test("it does not throw if calls are emitted in a chain", function (assert) {
        let bThrows = false;
        try {
            EventHub
                .emit("A")
                .emit("B")
                .emit("C");
        } catch (oError) {
            bThrows = true;
        }

        assert.strictEqual(bThrows, false, "did not throw an error");
    });

    QUnit.module("EventHub functionality - #once", {
        beforeEach: function () { EventHub._reset(); }
    });

    QUnit.test("it returns a doable", function (assert) {
        const oDoable = EventHub.once("Event");

        assert.strictEqual(typeof oDoable.do, "function", "result exposes a #do function");
        assert.strictEqual(typeof oDoable.off, "function", "result exposes an #off function");
    });

    QUnit.test("it calls the callback once when many events are emitted after listener is attached", function (assert) {
        const oCallback = sinon.stub();
        const fnDone = assert.async();

        EventHub
            .once("Event")
            .do(oCallback);

        const fnWait = EventHub.wait.bind(null, "Event");

        fnWait()
            .then(() => {
                EventHub.emit("Event", 1);
            })
            .then(fnWait)
            .then(() => {
                EventHub.emit("Event", 2);
            })
            .then(fnWait)
            .then(() => {
                EventHub.emit("Event", 3);
            })
            .then(fnWait)
            .then(() => {
                assert.strictEqual(oCallback.callCount, 1,
                    "the callback was called one time");
                fnDone();
            });
    });

    QUnit.test("it allows #off to be called multiple times without effect", function (assert) {
        const oCallback = sinon.stub();
        const fnDone = assert.async();

        EventHub
            .once("Event")
            .do(oCallback)
            .off(oCallback);

        const fnWait = EventHub.wait.bind(null, "Event");

        fnWait()
            .then(() => {
                EventHub.emit("Event", 1);
            })
            .then(fnWait)
            .then(() => {
                EventHub.emit("Event", 2);
            })
            .then(fnWait)
            .then(() => {
                EventHub.emit("Event", 3);
            })
            .then(fnWait)
            .then(() => {
                assert.strictEqual(oCallback.callCount, 0, "the callback was not called one time");
                fnDone();
            });
    });

    QUnit.module("EventHub functionality - #last", {
        beforeEach: function () { EventHub._reset(); }
    });

    QUnit.test("it returns undefined immediately if no event was emitted", function (assert) {
        // Act
        const vData = EventHub.last("Event");

        // Assert
        assert.strictEqual(typeof vData, "undefined",
            "a value with 'undefined' type was returned");
    });

    QUnit.test("it returns undefined if immediately if event is emitted after #last is called", function (assert) {
        // Act
        const vData = EventHub.last("Event");

        EventHub.emit("Event", 1);

        // Assert
        assert.strictEqual(typeof vData, "undefined",
            "a value with 'undefined' type was returned");
    });

    QUnit.test("it returns the last emitted data of an event emitted multiple times", function (assert) {
        // Act
        EventHub.emit("Event", "data1");
        EventHub.emit("Event", "data2");
        EventHub.emit("Event", "data3");

        const sData = EventHub.last("Event");

        // Assert
        assert.strictEqual(sData, "data3",
            "the last emitted event data were returned");
    });

    QUnit.module("EventHub functionality - #join", {
        beforeEach: function () { EventHub._reset(); }
    });

    QUnit.test("it returns a doable", function (assert) {
        const oDoable = EventHub.join();

        assert.strictEqual(typeof oDoable.do, "function", "result exposes a #do function");
        assert.strictEqual(typeof oDoable.off, "function", "result exposes an #off function");
    });

    QUnit.test("allows #join to be called without arguments", function (assert) {
        const oCallback = sinon.stub();

        EventHub.join().do(oCallback);

        assert.strictEqual(oCallback.callCount, 0, "callback was not called");
    });

    QUnit.test("allows #join to be offed multiple times when called without arguments", function (assert) {
        const oCallback = sinon.stub();

        EventHub.join().off().off();

        assert.strictEqual(oCallback.callCount, 0, "callback was not called");
    });

    QUnit.test("it does not call the callback when no event is dispatched", function (assert) {
        const oCallback = sinon.stub();

        EventHub.join(
            EventHub.on("EventA"),
            EventHub.on("EventB")
        ).do(oCallback);

        assert.strictEqual(oCallback.callCount, 0, "callback was not called");
    });

    QUnit.test("it does not call callback when only one of two on'd events is emitted", function (assert) {
        const oCallback = sinon.stub();
        const fnDone = assert.async();

        EventHub.join(
            EventHub.on("EventA"),
            EventHub.on("EventB")
        ).do(oCallback);

        const fnWaitA = EventHub.wait.bind(null, "EventA");

        EventHub.emit("EventA", 1);
        fnWaitA().then(() => {
            assert.strictEqual(oCallback.callCount, 0, "callback was not called");
            fnDone();
        });
    });

    QUnit.test("it does not allow callbacks to change the original data that were emitted", function (assert) {
        const fnDone = assert.async();
        const oEmittedDataEventA = { weather: "sunny" };
        const oEmittedDataEventB = { temperature: "23deg" };

        EventHub.emit("EventA", oEmittedDataEventA);
        EventHub.emit("EventB", oEmittedDataEventB);

        EventHub.join(
            EventHub.on("EventA"),
            EventHub.on("EventB")
        ).do((oDataA, oDataB) => {
            oDataA.weather = "sunny";
            oDataB.weather = "30deg";
        });

        Promise.all([
            EventHub.wait("EventA"),
            EventHub.wait("EventB")
        ]).then(() => {
            assert.deepEqual(oEmittedDataEventA.weather, "sunny", "original value for EventA data is preserved");
            assert.deepEqual(oEmittedDataEventB.temperature, "23deg", "original value for EventB data is preserved");
            fnDone();
        });
    });

    QUnit.test("it calls the callback when both the on'd events are emitted", function (assert) {
        const oCallback = sinon.stub();
        const fnDone = assert.async();

        EventHub.join(
            EventHub.on("EventA"),
            EventHub.on("EventB")
        ).do(oCallback);

        EventHub.emit("EventA", 1);
        EventHub.emit("EventB", 2);

        Promise.all([
            EventHub.wait("EventA"),
            EventHub.wait("EventB")
        ]).then(() => {
            assert.strictEqual(oCallback.callCount, 1, "callback was not called");
            fnDone();
        });
    });

    QUnit.test("it calls the callback when one event is emitted before and the other is emitted after the #join", function (assert) {
        const oCallback = sinon.stub();
        const fnDone = assert.async();

        EventHub.emit("EventA", 1);

        EventHub.join(
            EventHub.on("EventA"),
            EventHub.on("EventB")
        ).do(oCallback);

        EventHub.emit("EventB", 3);

        Promise.all([
            EventHub.wait("EventA"),
            EventHub.wait("EventB")
        ])
            .then(() => {
                assert.strictEqual(oCallback.callCount, 1, "callback was not called");
                fnDone();
            });
    });

    QUnit.test("it joins all 'on' events as expected", function (assert) {
        const oCallback = sinon.stub();
        const fnDone = assert.async();

        EventHub.join(
            EventHub.on("EventA"),
            EventHub.on("EventB"),
            EventHub.on("EventC")
        ).do(oCallback);

        // Act/Assert
        const fnWaitA = EventHub.wait.bind(null, "EventA");
        const fnWaitB = EventHub.wait.bind(null, "EventB");
        const fnWaitC = EventHub.wait.bind(null, "EventC");

        EventHub.emit("EventC", "C1");
        fnWaitC()
            .then(() => {
                assert.strictEqual(oCallback.callCount, 0, "callback was not called (1 of 3 events emitted)");
            })
            .then(() => {
                EventHub.emit("EventA", "A1");
            })
            .then(fnWaitA)
            .then(() => {
                assert.strictEqual(oCallback.callCount, 0, "callback was not called (2 of 3 events emitted)");
            })
            .then(() => {
                EventHub.emit("EventB", "B1");
            })
            .then(fnWaitB)
            .then(() => {
                assert.strictEqual(oCallback.callCount, 1, "callback was not called (3 of 3 events emitted)");
                assert.deepEqual(oCallback.getCall(0).args, ["A1", "B1", "C1"],
                    "callback was called with the data in the expected order");
            })
            .then(() => {
                EventHub.emit("EventC", "C2");
            })
            .then(fnWaitC)
            .then(() => {
                assert.strictEqual(oCallback.callCount, 2, "callback was called again when an additional event was emitted");
                assert.deepEqual(oCallback.getCall(1).args, ["A1", "B1", "C2"],
                    "callback was called with the data in the expected order");
                fnDone();
            });
    });

    QUnit.test("it joins all 'on' events as expected (if events are emitted before join)", function (assert) {
        const oCallback = sinon.stub();
        const fnDone = assert.async();

        const fnWaitA = EventHub.wait.bind(null, "EventA");
        const fnWaitB = EventHub.wait.bind(null, "EventB");
        const fnWaitC = EventHub.wait.bind(null, "EventC");

        // Act
        EventHub.emit("EventA", "A1");
        EventHub.emit("EventB", "B1");
        EventHub.emit("EventC", "C2");

        Promise.all([fnWaitA, fnWaitB, fnWaitC]).then(() => {
            EventHub.join(
                EventHub.on("EventA"),
                EventHub.on("EventB"),
                EventHub.on("EventC")
            )
                .do(oCallback);

            // Assert
            EventHub.join(
                EventHub.on("EventA"),
                EventHub.on("EventB"),
                EventHub.on("EventC")
            )
                .do(() => {
                    assert.strictEqual(oCallback.callCount, 1, "callback was called again when an additional event was emitted");
                    if (oCallback.callCount === 1) {
                        assert.deepEqual(oCallback.getCall(0).args, ["A1", "B1", "C2"],
                            "callback was called with the data in the expected order");
                    }
                    fnDone();
                });
        });
    });

    QUnit.test("it does not allow chains of do(s)", function (assert) {
        const oOffable = EventHub.join(
            EventHub.on("EventA"),
            EventHub.on("EventB"),
            EventHub.on("EventC")
        )
            .do(sinon.stub());

        assert.strictEqual(typeof oOffable.on, "undefined",
            "there is no #on method on the doable returned by join");
    });

    QUnit.test("when #off is called, it unsubscribes all the subscribers after one message is dispatched", function (assert) {
        const fnDone = assert.async();
        const oCallback = sinon.stub();

        const fnWaitA = EventHub.wait.bind(null, "EventA");
        const fnWaitB = EventHub.wait.bind(null, "EventB");
        const fnWaitC = EventHub.wait.bind(null, "EventC");

        const oDoable = EventHub.join(
            EventHub.on("EventA"),
            EventHub.on("EventB"),
            EventHub.on("EventC")
        );

        oDoable.do(oCallback);

        EventHub.emit("EventA", "A");
        EventHub.emit("EventB", "B");
        EventHub.emit("EventC", "C");

        Promise.all([fnWaitA(), fnWaitB(), fnWaitC()])
            .then(() => {
                oDoable.off();

                EventHub.emit("EventA", "D");
            })
            .then(fnWaitA)
            .then(() => {
                assert.strictEqual(oCallback.callCount, 1, "was not called after #off is called");
                assert.deepEqual(oCallback.getCall(0).args, ["A", "B", "C"],
                    "callback was called with the data in the expected order");
                fnDone();
            });
    });

    QUnit.module("EventHub functionality - error handling", {
        beforeEach: function () {
            EventHub._reset();
            if (typeof Log.error !== "function") {
                throw new Error("Test precondition violated: Log.error must exist and be a function");
            }
            if (typeof console.error !== "function") {
                throw new Error("Test precondition violated: console.error must exist and be a function");
            }
            this.fnOrigErrorLog = Log.error;
        },
        afterEach: function () {
            testUtils.restoreSpies(
                Log.error,
                console.error,
                console.log
            );
            Log.error = this.fnOrigErrorLog;
        }
    });

    QUnit.test("it does not throw if callback function inside a #do throws", function (assert) {
        // Arrange
        let bEmitThrows = false;

        // Act
        EventHub
            .on("WeatherChange")
            .do(() => {
                throw new Error("something went wrong!");
            });

        // Assert
        try {
            EventHub.emit("WeatherChange", "30deg");
        } catch (oError) {
            bEmitThrows = true;
        }

        assert.strictEqual(bEmitThrows, false, "an error is not thrown when #emit is called");
    });

    QUnit.test("it still calls callbacks that don't throw if some do throw", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback = sinon.stub();
        const oCallbackThrows = sinon.stub().throws(new Error("something went wrong!"));

        // Act
        EventHub
            .on("WeatherChange")
            .do(oCallback)
            .do(oCallbackThrows)
            .do(oCallbackThrows)
            .do(oCallback);

        EventHub.emit("WeatherChange", "30deg");
        EventHub.wait("WeatherChange")
            .then(() => {
                // Assert
                assert.strictEqual(oCallback.callCount, 2, "remaining callbacks that don't throw are still called");
                fnDone();
            });
    });

    QUnit.test("it logs errors via Log.error if Log is available", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback = sinon.stub();
        const oCallbackThrows = sinon.stub.throws(new Error("something went wrong!"));

        const oLogStub = sinon.stub(Log, "error");

        // Act
        EventHub
            .on("WeatherChange")
            .do(oCallback)
            .do(oCallbackThrows)
            .do(oCallbackThrows)
            .do(oCallback);

        EventHub.emit("WeatherChange", "30deg");
        EventHub.wait("WeatherChange")
            .then(() => {
                // Assert
                assert.strictEqual(oLogStub.callCount, 2, "Log.error was called 2 times");

                if (oLogStub.callCount === 2) {
                    const oFirstCall = oLogStub.getCall(0);
                    assert.strictEqual(oFirstCall.args[0],
                        "An exception was raised while executing a registered callback on event 'WeatherChange'",
                        "got expected first argument for first call"
                    );
                    assert.strictEqual(oFirstCall.args[1]
                        .indexOf("Data passed to the event were: '30deg' Error details: "),
                    0,
                    `got expected second argument for first call. DEBUG: got ${oFirstCall.args[1]}`
                    );
                    assert.strictEqual(oFirstCall.args[2],
                        "sap.ushell.EventHub",
                        "got expected third argument for first call"
                    );

                    const oSecondCall = oLogStub.getCall(1);
                    assert.strictEqual(oSecondCall.args[0],
                        "An exception was raised while executing a registered callback on event 'WeatherChange'",
                        "got expected first argument for second call"
                    );
                    assert.strictEqual(oSecondCall.args[1]
                        .indexOf("Data passed to the event were: '30deg' Error details: "),
                    0,
                    `got expected second argument for second call. DEBUG: got ${oSecondCall.args[1]}`
                    );
                    assert.strictEqual(oSecondCall.args[2],
                        "sap.ushell.EventHub",
                        "got expected third argument for second call"
                    );
                }

                fnDone();
            });
    });

    QUnit.module("EventHub Channel functionality - #createChannel", {
        beforeEach: function () { EventHub._reset(); }
    });

    QUnit.test("it returns a channel when #createChannel is called", function (assert) {
        // Act
        const oChannel = EventHub.createChannel({});

        // Assert
        assert.strictEqual(typeof oChannel.on, "function", "channel exposes #on method");
        assert.strictEqual(typeof oChannel.once, "function", "channel exposes #once method");
        assert.strictEqual(typeof oChannel.emit, "function", "channel exposes #emit method");
        assert.strictEqual(typeof oChannel.last, "function", "channel exposes #last method");
        assert.strictEqual(typeof oChannel.join, "function", "channel exposes #join method");
    });

    QUnit.module("EventHub Channel functionality - #last", {
        beforeEach: function () { EventHub._reset(); }
    });

    QUnit.test("it returns the value from the original object if #last is called without events emitted", function (assert) {
        // Arrange
        const oChannel = EventHub.createChannel({
            a: { b: "hello" }
        });

        // Act (last) / Assert
        assert.strictEqual(oChannel.last("/a/b"), "hello", "#last returned expected value");
    });

    QUnit.test("it returns the last emitted value if #last is called after an event has been emitted", function (assert) {
        // Arrange
        const oChannel = EventHub.createChannel({
            a: { b: "hello" }
        });
        oChannel.emit("/a/b", "hi");

        // Act
        const sResult = oChannel.last("/a/b");

        // Assert
        assert.strictEqual(sResult, "hi", "#last returned expected value");
    });

    QUnit.test("it can emit a function", function (assert) {
        // Arrange
        const oChannel = EventHub.createChannel({
            a: { b: "hello" }
        });
        function fn () { }
        oChannel.emit("/a/b", fn);

        // Act
        const sResult = oChannel.last("/a/b");

        // Assert
        assert.strictEqual(sResult, fn, "#last returned expected value");
    });

    QUnit.test("it returns the last emitted value if #last is called after an event has been emitted (different path separators)", function (assert) {
        // Arrange
        const oChannel = EventHub.createChannel({
            a: { b: "hello" }
        });
        oChannel.emit(">a>b", "hi");

        // Act
        const sResult = oChannel.last("#a#b");

        // Assert
        assert.strictEqual(sResult, "hi", "#last returned expected value");
    });

    QUnit.test("it prevents a value to be retrieved from a path that was not in the contract", function (assert) {
        // Arrange
        const oChannel = EventHub.createChannel({
            weather: [{ a: undefined }]
        });
        oChannel.emit("/weather/0/a", { c: "hello" });

        // Act
        let bThrows = false;
        try {
            oChannel.last("/weather/0/a/c");
        } catch (oError) {
            bThrows = true;
        }

        // Assert
        assert.strictEqual(bThrows, true, "#last throws an error");
    });

    QUnit.test("it does not prevent to retrieve a yet-to-come value", function (assert) {
        // Arrange
        const oChannel = EventHub.createChannel({
            weather: [{ a: undefined }]
        });

        // Act
        let bThrows = false;
        let vLastValue = null;
        try {
            vLastValue = oChannel.last("/weather/0/a");
        } catch (oError) {
            bThrows = true;
        }

        // Assert
        assert.strictEqual(bThrows, false, "#last throws an error");
        if (!bThrows) {
            assert.strictEqual(vLastValue, undefined, "undefined could be successfully retrieved");
        }
    });

    QUnit.test("it allows last to obtain the last emitted value", function (assert) {
        // Arrange
        const oChannel = EventHub.createChannel({
            weather: [{ a: undefined }] // initially undefined
        });

        const fnDone = assert.async();

        oChannel.emit("/weather/0/a", "VALUE");
        oChannel.wait("/weather/0/a").then(() => {
            // Act
            let bThrows = false;
            let vLastValue = null;
            try {
                vLastValue = oChannel.last("/weather/0/a");
            } catch (oError) {
                bThrows = true;
            }

            // Assert
            assert.strictEqual(bThrows, false, "#last does not throw");
            if (!bThrows) {
                assert.strictEqual(vLastValue, "VALUE", "the new value could be retrieved");
            }

            fnDone();
        });
    });

    QUnit.module("EventHub Channel functionality - #on", {
        beforeEach: function () { EventHub._reset(); }
    });

    [
        "-", "/", "_", ".", "#"
    ].forEach((sSeparator) => {
        QUnit.test(`it calls #do directly when #on is called on a path separated by '${sSeparator}' that exists in the source object`, function (assert) {
            // Arrange
            const fnDone = assert.async();
            const oCallback = sinon.stub();
            const sListenOnPath = sSeparator + ["a", "b"].join(sSeparator);

            const oChannel = EventHub.createChannel({
                a: { b: "hello" }
            });

            // Act
            oChannel
                .on(sListenOnPath)
                .do(oCallback);

            // Assert
            oChannel
                .on(sListenOnPath)
                .do(() => {
                    assert.strictEqual(oCallback.callCount, 1, "the callback was called");
                    assert.strictEqual(oCallback.getCall(0).args[0], "hello",
                        "the callback was called with the expected data");
                    fnDone();
                });
        });
    });

    [
        "a", "9", "P"
    ].forEach((sSeparator) => {
        QUnit.test(`it throws error when the seperator in path is invalid: ${sSeparator}`, function (assert) {
            // Arrange
            const sListenOnPath = sSeparator + ["a", "b"].join(sSeparator);
            let isThrowError = false;
            const oChannel = EventHub.createChannel({
                a: { b: "hello" }
            });

            try {
                // Act
                oChannel
                    .on(sListenOnPath);
            } catch (oError) {
                isThrowError = true;
            }
            assert.ok(isThrowError, "should throw error when not valid seperator");
        });
    });

    QUnit.test("it does not call #do callback if value is undefined in the original object", function (assert) {
        // Arrange
        const oCallback = sinon.stub();

        const oChannel = EventHub.createChannel({
            a: {
                b: undefined
            }
        });

        // Act
        oChannel
            .on("/a/b")
            .do(oCallback);

        // Assert
        assert.strictEqual(oCallback.callCount, 0, "the callback was called");
    });

    QUnit.test("it calls #do callback again if value is changed to undefined (emit after on)", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback = sinon.stub();

        const oChannel = EventHub.createChannel({
            a: {
                b: null
            }
        });

        // Act
        oChannel
            .on("/a/b")
            .do(oCallback);

        oChannel.emit("/a/b", undefined);
        oChannel.wait("/a/b")
            .then(() => {
                // Assert
                assert.strictEqual(oCallback.callCount, 2, "the callback was called");
                fnDone();
            });
    });

    QUnit.test("it calls #do callback again if value is changed to undefined (emit before on)", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback = sinon.stub();

        const oChannel = EventHub.createChannel({
            a: {
                b: null
            }
        });

        // Act
        oChannel.emit("/a/b", undefined);
        oChannel
            .on("/a/b")
            .do(oCallback)
            .do(() => {
                // Assert
                assert.strictEqual(oCallback.callCount, 1, "the callback was called");
                assert.strictEqual(oCallback.getCall(0).args[0], undefined, "the callback was called");
                fnDone();
            });
    });

    QUnit.test("it throws if #on is called on a non-existing path", function (assert) {
        // Arrange
        const oChannel = EventHub.createChannel({
            a: {
                // no b
            }
        });

        // Act
        let bException = false;
        try {
            oChannel.on("/a/b");
        } catch (oError) {
            bException = true;
        }

        // Assert
        assert.strictEqual(bException, true, "an exception was thrown");
    });

    QUnit.test("it calls #do callback if the event is listened on a non-leaf node", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback = sinon.stub();
        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: true
                }
            }
        });

        // Act
        oChannel
            .on("/a/b")
            .do(oCallback)
            .do(() => {
                // Assert
                assert.strictEqual(oCallback.callCount, 1, "the callback was called");
                assert.deepEqual(oCallback.getCall(0).args[0], { c: true },
                    "callback was called with the expected first argument");
                fnDone();
            });
    });

    QUnit.test("it does not call #do callback if children is undefined", function (assert) {
        // Arrange
        const oCallback = sinon.stub();

        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: undefined
                }
            }
        });

        // Act
        oChannel.on("/a/b")
            .do(oCallback);

        // Assert
        assert.strictEqual(oCallback.callCount, 0, "callback was not called");
    });

    QUnit.module("EventHub Channel functionality - #emit", {
        beforeEach: function () { EventHub._reset(); },
        afterEach: function () {
            testUtils.restoreSpies(
                Log.error,
                console.error,
                console.log
            );
        }
    });

    QUnit.test("it does not throw if #emit is called on a yet-to-be-defined value", function (assert) {
        const fnDone = assert.async();
        // Arrange
        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: undefined
                }
            }
        });

        // Act
        let bException = false;
        try {
            oChannel.emit("/a/b/c", "hi");
        } catch (oError) {
            bException = true;
        }

        // Assert
        assert.strictEqual(bException, false, "an exception was not thrown");
        if (bException) {
            fnDone();
        }

        oChannel.on("/a/b/c").do((sValue) => {
            assert.strictEqual(sValue, "hi", "expected value is returned");
            fnDone();
        });
    });

    QUnit.test("it does not raise an exception when mass-updating a channel with a string under /a/h/d/f", function (assert) {
        const fnDone = assert.async();
        sinon.stub(Log, "error");
        sinon.stub(console, "log");

        // Arrange
        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: undefined
                },
                h: {
                    d: {
                        f: "123",
                        g: {},
                        h: []
                    }
                }
            }
        });

        // Act
        let bException = false;
        try {
            oChannel.emit("/a/h/d", { f: [fnFunction], g: { x: "1" }, h: [1, 2, 3] });
        } catch (oError) {
            bException = true;
        }

        // Assert
        assert.strictEqual(bException, false, "an exception was not thrown");
        assert.strictEqual(Log.error.callCount, 0, "Log.error was not called");
        assert.strictEqual(console.log.callCount, 0, "console.log was not called");
        fnDone();
    });

    QUnit.test("it can emit a non empty array over an empty array", function (assert) {
        const fnDone = assert.async();

        // Arrange
        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: undefined
                },
                h: {
                    d: {
                        f: "123",
                        g: {},
                        h: []
                    }
                }
            }
        });

        // Act
        let bException = false;
        try {
            oChannel.emit("/a/h/d/h", [1, 2, 3, 4]);
        } catch (oError) {
            bException = true;
        }

        // Assert
        assert.strictEqual(bException, false, "an exception was not thrown");
        if (bException) {
            fnDone();
            return;
        }
        oChannel.on("/a").do((oData) => {
            assert.deepEqual(oData, {
                b: {
                    // Restriction: no c because internally
                    // JSON.{stringify/clone} is used to serialize.
                },
                h: {
                    d: {
                        f: "123",
                        g: {},
                        h: [1, 2, 3, 4]
                    }
                }
            }, "values were updated correctly");

            fnDone();
        });
    });

    QUnit.test("it can emit an array over an empty object", function (assert) {
        const fnDone = assert.async();

        // Arrange
        const oChannel = EventHub.createChannel({
            a: {
                b: {
                },
                h: {
                    d: {
                        f: "123",
                        g: {},
                        h: {}
                    }
                }
            }
        });

        // Act
        let bException = false;
        try {
            oChannel.emit("/a/h/d/h", [1, 2, 3, 4]);
        } catch (oError) {
            bException = true;
        }

        // Assert
        assert.strictEqual(bException, false, "an exception was not thrown");
        if (bException) {
            fnDone();
            return;
        }

        oChannel.on("/a").do((oData) => {
            assert.deepEqual(oData, {
                b: {
                },
                h: {
                    d: {
                        f: "123",
                        g: {},
                        h: [1, 2, 3, 4]
                    }
                }
            }, "values were updated correctly");

            fnDone();
        });
    });

    QUnit.test("it raises an exception when mass-updating a channel with multiple items under /a/h/d/f", function (assert) {
        const fnDone = assert.async();

        // Arrange
        sinon.stub(Log, "error");
        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: undefined
                },
                h: {
                    d: {
                        f: [1, 2, 3],
                        g: function () { },
                        h: []
                    }
                }
            }
        });

        // Act
        let bException = false;
        let sErrorMessage = "";
        try {
            oChannel.emit("/a/h/d", { f: [], g: { x: "1" }, h: [1, 2, 3] });
        } catch (oError) {
            bException = true;
            sErrorMessage = oError.message;
        }

        // Assert
        assert.strictEqual(bException, true, "an exception was thrown");
        if (bException) {
            assert.strictEqual(
                sErrorMessage.indexOf("Cannot write value"),
                0,
                "error message starts with 'Cannot write value'"
            );

            assert.strictEqual(
                sErrorMessage.indexOf(". ") > 0,
                true,
                "error message contains a '. ', where the error reason begins"
            );

            const aErrorParts = sErrorMessage.split(". ");
            assert.strictEqual(
                aErrorParts[1],
                "One or more values are not defined in the channel contract or are defined as a non-empty object/array, for example, check 'f'",
                "Got the expected reason"
            );
        }

        assert.strictEqual(
            Log.error.callCount,
            0,
            "Log.error was not called."
        );
        fnDone();
    });

    QUnit.test("it does not throw if #emit is called on a yet-to-be-defined (complex) value", function (assert) {
        const fnDone = assert.async();
        // Arrange
        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: undefined
                }
            }
        });

        // Act
        let bException = false;
        try {
            oChannel.emit("/a/b/c", { d: "efg" });
        } catch (oError) {
            bException = true;
        }

        // Assert
        assert.strictEqual(bException, false, "an exception was not thrown");
        if (bException) {
            fnDone();
        } else {
            oChannel.on("/a/b/c").do((sValue) => {
                assert.deepEqual(sValue, { d: "efg" }, "expected value is returned");
                fnDone();
            });
        }
    });

    QUnit.test("it throws if #emit is called with a non-compatible structure", function (assert) {
        // Arrange
        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: true
                }
            }
        });

        // Act
        let bException = false;
        try {
            oChannel.emit("/a/b", [0, 1, 2, 3]);
        } catch (oError) {
            bException = true;
        }

        // Assert
        assert.strictEqual(bException, true, "an exception was thrown");
    });

    QUnit.test("it does not throw if #emit is called on a non-leaf node and value has compatible structure", function (assert) {
        const fnDone = assert.async();

        // Arrange
        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: true
                }
            }
        });

        // Act
        let bException = false;
        try {
            oChannel.emit("/a/b", { c: false });
        } catch (oError) {
            bException = true;
        }

        // Assert
        assert.strictEqual(bException, false, "an exception was not thrown");

        oChannel
            .on("/a")
            .do((oValue) => {
                assert.deepEqual(oValue, { b: { c: false } }, "obtained the expected value");
                fnDone();
            });
    });

    QUnit.test("it does not modify original object", function (assert) {
        // Arrange
        const oOriginalObject = {
            a: {
                b: {
                    c: true
                },
                d: false
            }
        };
        const oObjectClone = JSON.parse(JSON.stringify(oOriginalObject));
        const oChannel = EventHub.createChannel(oOriginalObject);

        // Act
        oChannel.emit("/a/b/c", "hello");
        oChannel.emit("/a/d", "hi");

        // Assert
        assert.deepEqual(oOriginalObject, oObjectClone, "the original object was not modified");
    });

    QUnit.test("it does not call #do callback if another path than the subscribed one is called", function (assert) {
        // Arrange
        const oCallback = sinon.stub();
        const oChannel = EventHub.createChannel({
            a: {
                b: undefined
            },
            x: {
                y: undefined
            }
        });

        oChannel
            .on("/a/b")
            .do(oCallback);

        // Act
        oChannel
            .emit("/x/y");

        // Assert
        assert.strictEqual(oCallback.callCount, 0, "the callback was called");
    });

    QUnit.test("it calls #do handler registered on a parent event if a child value is emitted", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback = sinon.stub();

        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: true
                }
            }
        });

        let bCalled = false;

        oChannel
            .on("/a/b")
            .do(oCallback)
            .do(() => {
                if (bCalled) {
                    return;
                }
                bCalled = true;

                // Act
                oChannel.emit("/a/b/c", false);
                oChannel.wait("/a/b/c").then(() => {
                    // Assert
                    assert.strictEqual(oCallback.callCount, 2, "the callback was called");
                    fnDone();
                });
            });
    });

    QUnit.test("it calls the parent #do handler again if children changes the second time", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback = sinon.stub();
        let bCalled = false;

        const oChannel = EventHub.createChannel({
            weather: [{ a: 1 }, { a: 2 }, { c: 3 }] // 1st call
        });

        // Act
        oChannel
            .on("/weather")
            .do(oCallback)
            .do(() => {
                if (!bCalled) {
                    bCalled = true;

                    oChannel.emit("/weather/0/a", 4); // 2nd call
                    oChannel.wait("/weather/0/a")
                        .then(() => {
                            oChannel.emit("/weather/1/a", 5); // 3rd call
                        })
                        .then(oChannel.wait.bind(null, "/weather/1/a"))
                        .then(() => {
                            // Assert
                            assert.strictEqual(oCallback.callCount, 3, "the callback was called");
                            fnDone();
                        });
                }
            });
    });

    QUnit.test("it throws when array is addressed with a non-parsable number", function (assert) {
        // Arrange
        const oChannel = EventHub.createChannel({
            channel: [1, 2, 3]
        });

        // Act
        let bThrows = false;
        let sError = null;
        try {
            oChannel.emit("/channel/1x", "hi"); // it's an invalid number
        } catch (oError) {
            bThrows = true;
            sError = oError.toString();
        }

        // Assert
        assert.strictEqual(bThrows, true, "the call throws");
        assert.strictEqual(sError, "Error: Invalid array index '1x' provided in path '/channel/1x'", "exception has the expected error message");
    });
    QUnit.test("it throws when called on an out-of-bounds array index", function (assert) {
        // Arrange
        const oChannel = EventHub.createChannel({
            channel: [1, 2, 3]
        });

        // Act
        let bThrows = false;
        let sError = null;
        try {
            oChannel.emit("/channel/3", "hi"); // 3 is out of bounds
        } catch (oError) {
            bThrows = true;
            sError = oError.toString();
        }

        // Assert
        assert.strictEqual(bThrows, true, "the call throws");
        assert.strictEqual(sError, "Error: The item '3' from path /channel/3 cannot be accessed in the object: [1,2,3]", "exception has the expected error message");
    });

    QUnit.test("it throws when called on an out-of-bounds array index mid-way through the target node", function (assert) {
        // Arrange
        const oChannel = EventHub.createChannel({
            events: {
                in: {
                    a: [undefined, { deep: "path" }]
                }
            }
        });

        // Act
        let bThrows = false;
        let sError = null;
        try {
            oChannel.emit("/events/in/a/2/deep", "hi"); // 3 is out of bounds
        } catch (oError) {
            bThrows = true;
            sError = oError.toString();
        }

        // Assert
        assert.strictEqual(bThrows, true, "the call throws");
        assert.strictEqual(sError, 'Error: The item \'2\' from path /events/in/a/2 cannot be accessed in the object: [null,{"deep":"path"}]', "exception has the expected error message");
    });

    QUnit.test("it can emit on toplevel array", function (assert) {
        // Arrange
        const oChannel = EventHub.createChannel([
            "some", undefined, "values"
        ]);

        // Act
        let bThrows = false;
        try {
            oChannel.emit("/1", "test");
        } catch (oError) {
            bThrows = true;
        }

        // Assert
        assert.strictEqual(bThrows, false, "the call succeeds");
    });

    QUnit.module("EventHub Channel functionality - #join", {
        beforeEach: function () { EventHub._reset(); }
    });

    QUnit.test("it calls #do handler once when both built-in values defined", function (assert) {
        // Arrange
        const fnDone = assert.async();

        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: true
                }
            },
            d: {
                e: {
                    f: false
                }
            }
        });

        // Act
        oChannel.join(
            oChannel.on("/a/b/c"),
            oChannel.on("/d/e/f")
        ).do(() => {
            // Assert
            assert.ok(true, "the callback was called");
            fnDone();
        });
    });

    QUnit.test("it does not call #do handler once when one built-in value is not defined", function (assert) {
        // Arrange
        const oCallback = sinon.stub();

        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: true
                }
            },
            d: {
                e: {
                    f: undefined
                }
            }
        });

        // Act
        oChannel.join(
            oChannel.on("/a/b/c"),
            oChannel.on("/d/e/f")
        ).do(oCallback);

        // Assert
        assert.strictEqual(oCallback.callCount, 0, "the callback was called");
    });

    QUnit.test("it calls #do handler when the only undefined value becomes defined", function (assert) {
        // Arrange
        const fnDone = assert.async();

        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: true
                }
            },
            d: {
                e: {
                    f: undefined
                }
            }
        });

        // Act
        oChannel.join(
            oChannel.on("/a/b/c"),
            oChannel.on("/d/e/f")
        ).do((bVal1, bVal2) => {
            // Assert
            assert.deepEqual([bVal1, bVal2], [true, false],
                "callback was called with the expected arguments");
            fnDone();
        });

        oChannel.emit("/d/e/f", false);
    });

    QUnit.test("it calls #do handler once if parent and child node are listened on and an event on the child is emitted", function (assert) {
        // Arrange
        const fnDone = assert.async();

        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: undefined
                }
            }
        });

        // Act
        oChannel.join(
            oChannel.on("/a/b"),
            oChannel.on("/a/b/c")
        ).do((oArg1, bArg2) => {
            // Assert
            assert.deepEqual([oArg1, bArg2], [{ c: true }, true],
                "callback was called with the expected arguments");
            fnDone();
        });

        oChannel.emit("/a/b/c", true);
    });

    QUnit.test("it calls callback as expected when events are joined on a parent + children and events are emitted on the children", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback = sinon.stub();

        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: undefined,
                    d: undefined,
                    e: undefined
                }
            }
        });

        // Act
        oChannel.join(
            oChannel.on("/a"),
            oChannel.on("/a/b/c"),
            oChannel.on("/a/b/d")
        ).do(oCallback);

        oChannel.emit("/a/b/c", "X"); // -> changes /a/b/c and propagates to /a (waiting on /a/b/d to change...)

        oChannel.wait("/a/b/c").then(() => {
            oChannel.emit("/a/b/d", "Y"); // -> changes /a/b/d (-> first call made) and propagates to /a again with new object (second call, but data are the same -> no update)
        }).then(oChannel.wait.bind(null, "/a/b/d")).then(() => {
            // Assert
            assert.strictEqual(oCallback.callCount, 1,
                "the callback was called 1 time");
            assert.deepEqual(oCallback.getCall(0).args, [{ b: { c: "X", d: "Y" } }, "X", "Y"],
                "arguments of the first call are as expected");
            fnDone();
        });
    });

    QUnit.test("it calls callback as expected when events are joined on a parent + children and events are emitted on the children - parent is last event listened on", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback = sinon.stub();

        const oChannel = EventHub.createChannel({
            a: {
                b: {
                    c: undefined,
                    d: undefined,
                    e: undefined
                }
            }
        });

        // Act
        oChannel.join(
            oChannel.on("/a/b/c"),
            oChannel.on("/a/b/d"),
            oChannel.on("/a")
        ).do(oCallback);

        oChannel.emit("/a/b/c", "X"); // -> changes /a/b/c and propagates to /a (waiting on /a/b/d to change...)
        oChannel.wait("/a/b/c").then(() => {
            oChannel.emit("/a/b/d", "Y");
        }).then(oChannel.wait.bind(null, "/a/b/d")).then(() => {
            // Assert
            assert.strictEqual(oCallback.callCount, 1,
                "the callback was called 1 time");
            assert.deepEqual(oCallback.getCall(0).args, ["X", "Y", { b: { c: "X", d: "Y" } }],
                "arguments of the first call are as expected");
            fnDone();
        });
    });

    QUnit.module("EventHub Channel functionality - #once", {
        beforeEach: function () { EventHub._reset(); }
    });

    QUnit.test("it call only once callback even there was 2 events", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback = sinon.stub();

        const oChannel = EventHub.createChannel({
            a: {
                b: undefined
            }
        });

        oChannel
            .once("/a/b")
            .do(oCallback);

        // Act
        oChannel.emit("/a/b", "X");

        oChannel.wait("/a/b").then(() => {
            oChannel.emit("/a/b", "Y");
        }).then(oChannel.wait.bind(null, "/a/b")).then(() => {
            // Assert
            assert.strictEqual(oCallback.callCount, 1,
                "the callback was called 1 time");
            assert.deepEqual(oCallback.getCall(0).args, ["X"],
                "arguments of the first call are as expected");
            fnDone();
        });
    });

    QUnit.test("it call once callback with value from contract", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oCallback = sinon.stub();

        const oChannel = EventHub.createChannel({
            a: {
                b: "Z"
            }
        });

        // Act
        oChannel
            .once("/a/b")
            .do(oCallback);

        oChannel.emit("/a/b", "Y");
        oChannel.wait("/a/b").then(() => {
            // Assert
            assert.strictEqual(oCallback.callCount, 1,
                "the callback was called 1 time");

            if (oCallback.callCount === 1) {
                assert.deepEqual(oCallback.getCall(0).args, ["Z"],
                    "arguments of the first call are as expected");
            }
            fnDone();
        });
    });
});
