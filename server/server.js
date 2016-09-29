"use strict";

var fs = require('fs');
var express = require('express');
var mongoose = require('../config/lib/mongoose');
var con = require('../config/config');
var http = require('http');
var https = require('https');
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

    if (con.config.https_secure) {
      var privateKey = fs.readFileSync(con.config.key_loc, 'utf8');
      var certificate = fs.readFileSync(con.config.cert_loc, 'utf8');

      var credentials = {
        key: privateKey,
        cert: certificate
      };

      server = https.createServer(credentials, app);
    }

    var socketio = require('socket.io')(server, {
      serveClient: process.env.NODE_ENV !== 'production',
      path: '/socket.io'
    });
    // var socketios = require('socket.io')(httpsServer, {
    //   serveClient: process.env.NODE_ENV !== 'production',
    //   path: '/socket.io'
    // });

    require('../config/lib/socketio')(socketio);
    // require('../config/lib/socketio')(socketios);
    require('../config/lib/express').init(app);

    if (callback) callback(app, db, con, server);

  });
};

init(function (app, db, con, server) {

  server.listen(con.config.port, con.config.host, function () {
    var host = server.address().address;
    var port = server.address().port;

    // Logging initialization
    console.log('');
    console.log(chalk.bold.cyan('\tProject Name:\t\t\t' + con.config.app.title));
    console.log(chalk.bold.cyan('\tEnvironment:\t\t\t' + process.env.NODE_ENV));
    console.log(chalk.bold.cyan('\tDatabase:\t\t\t' + con.config.db.uri));
    console.log('');

    if (!con.config.https_secure) {
      console.log(chalk.bold.magenta('\tHTTP Server'));
      console.log(chalk.bold.gray('\tAddress:\t\t\t' + 'http://localhost:' + port));
    } else {
      console.log(chalk.bold.magenta('\tHTTPS Server'));
      console.log(chalk.bold.gray('\tAddress:\t\t\t' + 'https://localhost:' + port));
    }

    console.log(chalk.bold.gray('\tPort:\t\t\t\t' + port));
    console.log(chalk.bold.gray('\tHost:\t\t\t\t' + host));
    console.log('');

  });
});

// exports = module.exports = express.init();
