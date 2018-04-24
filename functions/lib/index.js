"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.database();
/// WORKERS ///
const workers = {
    testWorker,
    emailWorker,
};
function testWorker(task) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('test worker executed');
        if (Math.random() >= 0.5)
            throw new Error('random error');
    });
}
function emailWorker(task) {
    return __awaiter(this, void 0, void 0, function* () {
        yield timeout(2000);
        console.log('email sent');
    });
}
/// TASK RUNNER CLOUD FUNCTION ///
exports.taskRunner = functions.https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
    const queueRef = db.ref('tasks');
    // Get all tasks that with expired times
    const tasks = yield queueRef.orderByChild('time').endAt(Date.now()).once('value');
    if (tasks.exists()) {
        const promises = [];
        // Execute tasks concurrently
        tasks.forEach(taskSnapshot => {
            promises.push(execute(taskSnapshot));
        });
        const results = yield Promise.all(promises);
        // Optional: count success/failure ratio
        const successCount = results.reduce(sum);
        const failureCount = results.length - successCount;
        res.status(200).send(`Work complete. ${successCount} succeeded, ${failureCount} failed`);
    }
    else {
        res.status(200).send(`Task queue empty`);
    }
}));
/// HELPERS
// Helper to run the task, then clear it from the queue
function execute(taskSnapshot) {
    return __awaiter(this, void 0, void 0, function* () {
        const task = taskSnapshot.val();
        const key = taskSnapshot.key;
        const ref = db.ref(`tasks/${key}`);
        try {
            // execute worker for task
            const result = yield workers[task.worker](task);
            // If the task has an interval then reschedule it, else remove it
            if (task.interval) {
                yield ref.update({
                    time: task.time + task.interval,
                    runs: (task.runs || 0) + 1
                });
            }
            else {
                yield ref.remove();
            }
            return 1; // === success
        }
        catch (err) {
            // If error, update fail count and error message
            yield ref.update({
                err: err.message,
                failures: (task.failures || 0) + 1
            });
            return 0; // === error
        }
    });
}
// Used to count the number o fail
function sum(acc, num) {
    return acc + num;
}
// Simulated latency
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=index.js.map