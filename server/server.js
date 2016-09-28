"use strict";

var express = require('express');
var mongoose = require('../config/lib/mongoose');
var con = require('../config/config');
var http = require('http');
var path = require('path');
var chalk = require('chalk');


if (con.config.seedDB) {

  require('../config/lib/seed');

  var chai = require('chai');

  global.expect = chai.expect;
  global.assert = chai.assert;
  chai.should();

};

// Initialize models
mongoose.loadModels();

var init = function init(callback) {
  mongoose.connect(function (db) {
    // Initialize express
    var app = express();

    var server = http.createServer(app);
    var socketio = require('socket.io')(server, {
      serveClient: process.env.NODE_ENV !== 'production',
      path: '/socket.io'
    });
    require('../config/lib/socketio')(socketio);
    require('../config/lib/express').init(app);

    if (callback) callback(app, db, con, server);

  });
};

init(function (app, db, con, server) {

  server.listen(con.config.port, con.config.host, function () {
    var host = server.address().address;
    var port = server.address().port;

    // Logging initialization
    console.log('\t--');
    console.log(chalk.green('\tProject Name:\t\t\t' + con.config.app.title));
    console.log(chalk.green('\tEnvironment:\t\t\t' + process.env.NODE_ENV));
    console.log(chalk.green('\tPort:\t\t\t\t' + port));
    console.log(chalk.green('\tHost:\t\t\t\t' + host));
    console.log(chalk.green('\tDatabase:\t\t\t' + con.config.db.uri));

  });

});

// exports = module.exports = express.init();
