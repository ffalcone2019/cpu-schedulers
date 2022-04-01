// COP4610 Operating Systems
// Assignment 2
//
// Fallon Falcone, Solomon Markowitz
// 3/29/2022
//
// This program simulates the SJF algorithm using the inputs given.
// It shows each context switch and what processes are in the run, ready,
// and IO queues.  It calculates the final times and averages, and displays
// them when the simulation is complete.

// Input times for the 9 processes
var p1 = [ 7, 22, 6, 19, 12, 44, 8, 21, 10, 37, 5, 24, 6, 44, 7, 43, 8 ];
var p2 = [ 14, 48, 15, 44, 17, 42, 22, 37, 19, 76, 14, 41, 16, 31, 17, 43, 18 ];
var p3 = [ 8, 43, 7, 41, 6, 45, 8, 21, 9, 35, 14, 18, 5, 26, 3, 31, 6 ];
var p4 = [ 13, 37, 4, 41, 5, 35, 12, 41, 8, 55, 15, 34, 6, 73, 5, 77, 3 ];
var p5 = [ 6, 34, 7, 21, 5, 44, 6, 32, 7, 28, 3, 48, 11, 44, 6, 33, 3, 28, 4 ];
var p6 = [ 9, 32, 4, 28, 5, 10, 6, 12, 7, 14, 9, 18, 12, 24, 15, 30, 8 ];
var p7 = [ 14, 46, 17, 41, 11, 42, 15, 21, 4, 32, 7, 19, 16, 33, 10 ];
var p8 = [ 4, 64, 5, 53, 6, 44, 4, 73, 6, 87, 5, 66, 8, 25, 6, 33, 9, 41, 7 ];
var p9 = [ 13, 37, 8, 41, 7, 27, 12, 29, 5, 27, 6, 18, 3, 33, 4, 62, 6 ];

// Create process objects
var processArrary = [
	{ name: "P1", times: p1, rt: 0, rspt: -1, wt: 0, tt: 0 },
	{ name: "P2", times: p2, rt: 0, rspt: -1, wt: 0, tt: 0 },
	{ name: "P3", times: p3, rt: 0, rspt: -1, wt: 0, tt: 0 },
	{ name: "P4", times: p4, rt: 0, rspt: -1, wt: 0, tt: 0 },
	{ name: "P5", times: p5, rt: 0, rspt: -1, wt: 0, tt: 0 },
	{ name: "P6", times: p6, rt: 0, rspt: -1, wt: 0, tt: 0 },
	{ name: "P7", times: p7, rt: 0, rspt: -1, wt: 0, tt: 0 },
	{ name: "P8", times: p8, rt: 0, rspt: -1, wt: 0, tt: 0 },
	{ name: "P9", times: p9, rt: 0, rspt: -1, wt: 0, tt: 0 },
];

// Create queues
var runQueue = [];
var readyQueue = [];
var ioQueue = [];
var complete = [];

// Start at time 0
var currentTime = 0;

// All process arrive - add them to ready queue
processArrary.forEach(p => {
	addToReadyQueue(p)
})

// Move the top of the ready queue to the run queue
runQueue.push(readyQueue.shift())

// Set the response time of the first item in the
// run queue to be 0
runQueue[0].rspt = 0

// Display
console.log("")
displayStep()

// Run until nothing left in any of the queues
while (runQueue.length > 0 || readyQueue.length > 0 || ioQueue.length > 0) {

	// Next tick
	currentTime++

	// Handle run queue times
	runQueue.forEach(p => {
		p.tt++
		p.rt++
		p.times[0]--

		// If the response time is -1 it means this is
		//	the first time this process was in the run
		//	queue so set its response time
		if (p.rspt == -1) {
			p.rspt = currentTime
		}
	})

	// Handle ready queue times
	readyQueue.forEach(p => {
		p.tt++
		p.wt++
	})

	// Handle io queue times
	ioQueue.forEach(p => {
		p.tt++
		p.times[0]--
	})

	// If there are any processes in the io queue with a time remaining of 0
	//	they have to be moved to the ready queue
	var finished = ioQueue.filter(p => {
		return p.times[0] == 0
	})
	ioQueue = ioQueue.filter(p => {
		return p.times[0] != 0
	})
	finished.forEach(p => {
		p.times.shift()
		addToReadyQueue(p)
	})

	// See if a process is currently running
	if (runQueue.length > 0) {

		// If its burst time has run out move it out
		if (runQueue[0].times[0] == 0) {

			// Get the next time in the list
			runQueue[0].times.shift()

			// If there is another time then this is an
			//	io time so move it to the io queue
			//	or else there are no more times so
			//	it is done - move it to complete
			if (runQueue[0].times.length != 0) {
				addToIOQueue(runQueue.shift())
			} else {
				addToCompleteQueue(runQueue.shift())
			}

			// Set the new running process by moving the top
			//	of the ready queue to the run queue
			if (readyQueue.length != 0) {
				runQueue.push(readyQueue.shift())
			}
			displayStep()
		}
	} else {
		// There was no running process

		// Set the new running process by moving the top
		//	of the ready queue to the run queue
		if (readyQueue.length != 0) {
			runQueue.push(readyQueue.shift())
			displayStep()
		}
	}
}

// Calculate stats
var totalRunTime = processArrary.reduce((prev, curr) => {
	return prev + curr.rt;
}, 0);
var totalResponseTime = processArrary.reduce((prev, curr) => {
	return prev + curr.rspt;
}, 0);
var totalWaitTime = processArrary.reduce((prev, curr) => {
	return prev + curr.wt;
}, 0);
var totalTurnaroundTime = processArrary.reduce((prev, curr) => {
	return prev + curr.tt;
}, 0);
var utilization = (totalRunTime / currentTime) * 100;
var avgWait = totalWaitTime / 9;
var avgTurnaround = totalTurnaroundTime / 9;
var avgResponse = totalResponseTime / 9;

// Print out results
console.log("Finished")
console.log("")
console.log("Total Time:         " + currentTime)
console.log("CPU Utilization:    " + utilization.toFixed(4) + "%")

// Show waiting times
console.log("")
console.log("Waiting Times       " + processArrary.reduce((prev, curr) => {
	return prev + curr.name.padEnd(5);
}, ""))
console.log("                    " + processArrary.reduce((prev, curr) => {
	return prev + curr.wt.toString().padEnd(5);
}, ""))
console.log("Average Wait:       " + avgWait.toFixed(2))

// Show turnaround times
console.log("")
console.log("Turnaround Times    " + processArrary.reduce((prev, curr) => {
	return prev + curr.name.padEnd(5);
}, ""))
console.log("                    " + processArrary.reduce((prev, curr) => {
	return prev + curr.tt.toString().padEnd(5);
}, ""))
console.log("Average Turnaround: " + avgTurnaround.toFixed(2))

// Show response times
console.log("")
console.log("Response Times      " + processArrary.reduce((prev, curr) => {
	return prev + curr.name.padEnd(5);
}, ""))
console.log("                    " + processArrary.reduce((prev, curr) => {
	return prev + curr.rspt.toString().padEnd(5);
}, ""))
console.log("Average Response:   " + avgResponse.toFixed(2))

// Add a process to the ready queue and order by time remaining
function addToReadyQueue(p) {
	for (let i = 0; i < readyQueue.length; i++) {
		if (p.times[0] < readyQueue[i].times[0]) {
			readyQueue.splice(i, 0, p)
			return
		}
	}
	readyQueue.push(p)
}

// Add a process to the io queue and order by name
function addToIOQueue(p) {
	for (let i = 0; i < ioQueue.length; i++) {
		if (p.name < ioQueue[i].name) {
			ioQueue.splice(i, 0, p)
			return
		}
	}
	ioQueue.push(p)
}

// Add a process to the complete queue and order by name
function addToCompleteQueue(p) {
	for (let i = 0; i < complete.length; i++) {
		if (p.name < complete[i].name) {
			complete.splice(i, 0, p)
			return
		}
	}
	complete.push(p)
}

// Display output for this step
function displayStep() {
	console.log("Current Time: " + currentTime)
	console.log("")
	if (runQueue.length != 0) {
		console.log("Now running:  " + runQueue[0].name)
	} else {
		console.log("Now running:  [idle]")
	}
	console.log("..................................................")
	console.log("")
	console.log("Ready Queue:  Process    Burst")
	if (readyQueue.length == 0) {
		console.log("              [empty]")
	} else {
		readyQueue.forEach(p => {
			console.log("              " + p.name + "         " + p.times[0])
		})
	}
	console.log("..................................................")
	console.log("")
	console.log("Now in I/O:   Process    Remaining I/O time")
	if (ioQueue.length == 0) {
		console.log("              [empty]")
	} else {
		ioQueue.forEach(p => {
			console.log("              " + p.name + "         " + p.times[0])
		})
	}
	if (complete.length != 0) {
		console.log("..................................................")
		console.log("")
		var str = complete.map(p => {
			return p.name
		})
		console.log("Completed:    " + str.join(",  "))
	}
	console.log("")
	console.log("::::::::::::::::::::::::::::::::::::::::::::::::::")
	console.log("")
	console.log("")
	console.log("")
}