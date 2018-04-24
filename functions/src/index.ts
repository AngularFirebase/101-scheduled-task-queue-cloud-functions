import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

const db = admin.database()

/// WORKERS ///

const workers = {
    testWorker,
    emailWorker,
}

async function testWorker(task) {
    console.log('test worker executed')
    if (Math.random() >= 0.5) throw new Error('random error')
}


async function emailWorker(task) {
    await timeout(2000)
    console.log('email sent')
}

/// TASK RUNNER CLOUD FUNCTION ///

exports.taskRunner = functions.https.onRequest(async (req, res) => {

    const queueRef = db.ref('tasks');
    // Get all tasks that with expired times
    const tasks = await queueRef.orderByChild('time').endAt(Date.now()).once('value')


    if (tasks.exists()) {
        const promises = []
        
        // Execute tasks concurrently
        tasks.forEach( taskSnapshot => {
            promises.push( execute(taskSnapshot) )
        })

        const results = await Promise.all(promises)
        
        // Optional: count success/failure ratio
        const successCount = results.reduce(sum);
        const failureCount = results.length - successCount;
            
        res.status(200).send(`Work complete. ${successCount} succeeded, ${failureCount} failed`)
        
    } else {

        res.status(200).send(`Task queue empty`);
    }



});

/// HELPERS

// Helper to run the task, then clear it from the queue
async function execute(taskSnapshot) {

    const task = taskSnapshot.val();
    const key = taskSnapshot.key;
    const ref = db.ref(`tasks/${key}`);

    try {

        // execute worker for task
        const result = await workers[task.worker](task)
        
        // If the task has an interval then reschedule it, else remove it
        if (task.interval) {
            await ref.update({ 
                time: task.time + task.interval,
                runs: (task.runs || 0) + 1
            })
        } else {
            await ref.remove();
        }
       
        return 1;  // === success

    } catch(err) {
        // If error, update fail count and error message
        await ref.update({ 
            err: err.message,
            failures: (task.failures || 0) + 1
        })

        return 0; // === error
    }
}

// Used to count the number o fail
function sum(acc, num) {
    return acc + num;
}

// Simulated latency
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}