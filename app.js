var request = require('request')
var FiveBeans = require('fivebeans');
var cluster = require('cluster');
var num_CPUs = require('os').cpus().length;
var BeanWorker = require('fivebeans').worker;
var tube = 'wongkachunken';

var opt = {
	uri : 'http://challenge.aftership.net:9578/v1/beanstalkd',
	method : 'POST',
	headers : {
		'aftership-api-key' : 'a6403a2b-af21-47c5-aab5-a2420d20bbec'
	},
}

//Create child process
if (cluster.isMaster) {
	for (var i = 0; i < num_CPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', function (worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
	});
} else {
	main();
}

//Main
function main() {
	request(opt, function (error, response, body) {
		body = JSON.parse(body);
		rateTask(body)
	});
}

/**
* rateTask() beanstalkd worker for feeding rate and updating db
* @param {Object} BeanstalkdServer
*/
function rateTask(BeanstalkdServer) {
	var Client = new FiveBeans.client(BeanstalkdServer.data.host, BeanstalkdServer.data.port);

	Client
	.on('connect', function () {
		// client can now be used
		var Job1 =
		{
			type: 'xe',
			payload: {'from':'USD', 'to':'HKD'}
		};		
		
		
		//Put a job to beanstalkd
		Client.use(tube, function (err, tname) {
			/*
			Client.put(0, 0, 60, JSON.stringify([tube, Job1]), function (err, jobid) {
				console.log(jobid);
			});
			*/
			/*
			Client.stats_tube(tname, function(err, response) {
				console.log(response);
			});
			*/
			/*
			Client.peek_ready(function(err, jobid, payload) {
				console.log(jobid);
				Client.destroy(jobid, function(err) {
					console.log(err);
					process.exit(0);
				});
			});
			*/
		});
		
	})
	.on('error', function (err) {
		// connection failure
		console.log('connection failure');
	})
	.on('close', function () {
		// underlying connection has closed
		console.log('underlying connection has closed');
	});
	
	//Client.connect();	
	
	var Options =
	{
		id: 'worker_1',
		host: BeanstalkdServer.data.host,
		port: BeanstalkdServer.data.port,
		handlers:
		{
			xe: require('./xe_handler')()
		},
		ignoreDefault: true
	}
	var Worker = new BeanWorker(Options);
	Worker.start([tube]);	
	
}
