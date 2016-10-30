// lifted from https://github.com/dciccale/docker-angular-tutum/
// https://blog.tutum.co/2015/06/03/docker-angularjs-and-tutum-part-1/

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config');

// Setup server
var app = express();
var http = require('http');

// Express configuration
require('./config/express')(app);
// Route configutation
require('./routes')(app);

// Start server
http.createServer(app).listen(config.port, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
module.exports = app;
