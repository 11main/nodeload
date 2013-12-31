#!/usr/bin/env node

// This test will hit localhost:8080 with 20 concurrent connections for 10 minutes.
var http = require('http'),
net = require('net'),
nl = require('../nodeload.js');

//http.createServer(function (req, res) {
//    res.writeHead(200, {"Content-Type": "text/plain"});
//    res.end("Hello World\n");
//
////    res.writeHead(200);
////    res.end();
//}).listen(8085);


var server = http.createServer(function (req, res) {

    console.log ("Received request");

    server.on('connect', function () {
        console.log('Connected');
    });

    server.on('clientError', function () {
        console.log('clientError');
    });


    res.writeHead(200);
    res.end();



//    res.writeHead((Math.random() < 0.8) ? 200 : 404, {'Content-Type': 'text/plain'});
//    res.end('foo\n');
}).listen(9000);

console.log("");
console.log("");
console.log("");
console.log("");
console.log("--------------------");
console.log("Server to load test listening on 9000.");
console.log("--------------------");
console.log("");
console.log("");
console.log("");
console.log("");

//numUsers: 2,
//    timeLimit: 60,
//    targetRps: 2,
//    userProfile: [[0, 0], [10, 4], [20, 8], [30, 12], [40, 8], [50, 4]],


var loadtest = nl.run({

    name: "Read",
    host: 'localhost',
    port: 9000,
    numUsers: 1,
    timeLimit: 180,
    targetRps: 1,
    stats: [
        'result-codes',
        { name: 'latency', percentiles: [0.9, 0.99] },
        'concurrency',
        'rps',
        'uniques',
        { name: 'http-errors', successCodes: [200,404], log: 'http-errors.log' }
    ],
    requestGenerator: function(client) {

//        path:  "/" + Math.floor(Math.random()*8000),
//        port: 9000,

        var options = {
            hostname: 'www.google.com',
            port: 80,
            path:  "/",
            method: 'GET'
        };

        var req = http.request(options);

        req.on('finish', function(){
            console.log('request finished');
        });

        req.on('connect', function(){
            console.log('request connect');
        });

        req.on('socket', function(){
            console.log('request socket');
        });

        req.on('upgrade', function(){
            console.log('request socket');
        });

        req.on('continue', function(){
            console.log('request continue');
        });


        return req;


//        return client.request('GET', "/" + Math.floor(Math.random()*8000), { 'host': 'localhost' });
    }

//    name: 'Example',
//    host: 'www.att.com',
//    port: 80,
//    stats: ['latency', 'result-codes', { name: 'http-errors', successCodes: [200], log: 'http-errors.log' }],
//    requestGenerator: function (client) {
//
//        var options = {
//            hostname: 'www.att.com',
//            port: 80,
//            path:  "",
//            method: 'GET'
//        };


//	name: 'Example',
//	host: 'localhost',
//	port: 8089,
//	numUsers: 2,
//	timeLimit: 40,
//	targetRps: 5,
//	stats: ['latency', 'result-codes', { name: 'http-errors', successCodes: [200], log: 'http-errors.log' }],
//	requestGenerator: function (client) {
//
//        var options = {
//            hostname: 'localhost',
//            port: 8089,
//            path:  "/" + Math.floor(Math.random()*10000),
//            method: 'GET'
//        };

//        var req = http.request(options);
//
//        return req;
//        }

//        var req = client.request('GET', "/" + Math.floor(Math.random()*10000));

//        console.log("In test4.js ++ requestGenerator")
});
// loadtest.on('end', function() { process.exit(0); });