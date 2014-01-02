#!/usr/bin/env node


var http = require('http'),
nl = require('../nodeload.js')
    .quiet()
    .setMonitorIntervalMs(2000);

// Do not remove  'request-bytes', 'response-bytes' from stats. It causes requests to stop being issued.

var test = nl.run({
    name: '11Main',
    host: 'localhost',
    port: 9000,
    method: 'GET',
    path: '/',
    numUsers: 2,
    numRequests: 5000,
    timeLimit: 120,
    targetRps: 50,
    stats: [{ name: 'latency', percentiles: [0.9, 0.99] }, 'result-codes',
            'request-bytes', 'response-bytes',
            'concurrency','rps', 'uniques',
            { name: 'http-errors', successCodes: [200,404], log: 'http-errors.log' }],
    requestGenerator: function(client) {
        var options = {
            hostname: 'localhost',
            port: 9000,
            path:  "/",
            method: 'GET'
        };

        var req = http.request(options);
        return req;
    }

});

test.start();

