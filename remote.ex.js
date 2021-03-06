#!/usr/bin/env node

// This example uses 'iostat' to gather load average from a remote machine and graph it. To run this
// example, first start nodeload on a remote machine:
//
//      remote-machine> nodeload.js
//      Started HTTP server on remote-machine:8000.
//      
//      local-machine> examples/remote.ex.js remote-machine:8000
//
// This example expects a machine with a single disk, so iostat output looks like:
//
//             disk0       cpu     load average
//       KB/t tps  MB/s  us sy id   1m   5m   15m
//      36.73   2  0.08   8  4 89  0.39 0.43 0.41
//       0.00   0  0.00  10  4 86  0.39 0.43 0.41
//
var http = require('http'),
    util = require('util'),
    nlhttp = require('./lib/http'),
    remote = require('./lib/remote'),
    REPORT_MANAGER = require('./lib/reporting').REPORT_MANAGER,
    HTTP_SERVER = nlhttp.HTTP_SERVER,
    HttpServer = nlhttp.HttpServer,
    Cluster = remote.Cluster;

// Parse remote host from command line arguments
//
var slave, remoteHost, remoteHost2;
if (process.argv.length < 3) {
    console.log([
        'No remote host specified, starting slave host locally. To use a separate slave machine, run:\n',
        '\n',
        '   $ examples/remote.ex.js <host:port>.\n',
        '\n',
        'To start a second host, just run nodeload.js on another machine, optionally specifying the port:\n',
        '\n',
        '   $ HTTP_PORT=8001 nodeload.js\n'
    ].join(''));
    
    slave = new HttpServer().start(8001);
    remote.installRemoteHandler(slave);
    remoteHost = 'localhost:8001';

    slave2 = new HttpServer().start(8002);
    remote.installRemoteHandler(slave2);
    remoteHost2 = 'localhost:8002';

} else {
    remoteHost = process.argv[2];
}


// Initialize the HTML report
var report = REPORT_MANAGER.addReport(remoteHost),
    cpuChart = report.getChart('CPU usage');

var report2 = REPORT_MANAGER.addReport(remoteHost2),
    cpuChart2 = report2.getChart('CPU usage');


// Create the Cluster...
//
var cluster = new Cluster({
    master: {
        sendOutput: function(slaves, slaveId, output) {
            console.log("In send output");
            console.log("Slave Id: " + slaveId);
            util.print(output);

            // grab fields 4-6 from the iostat output, which assumes output looks like:
            //
            //             disk0       cpu     load average
            //       KB/t tps  MB/s  us sy id   1m   5m   15m
            //      36.73   2  0.08   8  4 89  0.39 0.43 0.41
            //
            // not so portable...


            var parts = output.trim().split(/\s+/);

            if (parts.length > 8) {

                console.log('     user: ' + parts[6]);
                console.log('     system: ' + parts[7]);
                console.log('     idle: ' + parts[8]);

                var chart = slaveId === 'localhost:8001' ? cpuChart : cpuChart2;

                chart.put({
                    user: parseFloat(parts[6]),
                    system: parseFloat(parts[7]),
                    idle: parseFloat(parts[8])
                });
            }
        }
    },
    slaves: {
        hosts: [remoteHost, remoteHost2],
        setup: function(master) {
            console.log("Running setup");
            this.spawn = require("child_process").spawn;


            master.on('error', function(err) {
                console.log('Error communicating with master: ' + err.toString());
            });
        },
        exec: function(master, cmd, params) {
            var self = this,
                child = self.spawn(cmd, params);

            console.log("From exec spawn id: " + child.id);

            self.state = 'running';
            child.stdout.on('data', function(data) {

                console.log("master.sendOutput - data: " + data.toString());

                master.sendOutput(data.toString());
            });
            child.on('exit', function(data) {
                console.log("exiting child process " );
                self.state = 'done';
            });
        }
    }
});

// ...and start it
//
console.log('Browse to http://localhost:8000 to HTML report');
console.log('Press ^C to exit.');
cluster.on('init', function() {
    console.log("Cluster init event: ");
    cluster.on('start', function() {
        console.log('----------------- Slave Output -----------------');
        cluster.exec('iostat', ['-w1']);
    });
    cluster.on('end', function(slaves) {
        console.log('All slaves terminated.');
        if (slave) {
            slave.stop();
        }
        process.exit(0);
    });
    cluster.on('running', function() {
        console.log('All slaves running');
    });
    cluster.on('done', function() {
        console.log('All slaves done. Stopping cluster...');
        cluster.end();
    });
    cluster.on('slaveError', function(slave, err) {
        if (err === null) {
            console.log('Unresponsive slave detected: ' + slave.id);
        } else {
            console.log('Slave error from ' + slave.id + ': ' + err.toString());
            if (cluster.state === 'stopping') {
                process.exit(1);
            }
        }
    });
    cluster.on('slaveState', function(slave, state) {
        if (state === 'error') {
            console.log('Slave "' + slave.id + '" encountered an error.');
        }
    });
    console.log("Starting cluster: ");
    cluster.start();
});
process.on('SIGINT', function () {
    cluster.end();
});