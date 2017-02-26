const console = require('keypunch');
console.addHeaderFunction(() => `[PID:${process.pid}]`);

const express = require('express');
const app = express();

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('localhost:27017/icepop_test');

mongoose.connection.on('connected', () => {
  console.info('Mongoose connection open');
});

const icepop = require('../');
app.use('/api', icepop(require('./spec')));

app.listen(5000, function () {
  console.info(`Icepop test server listening on port 5000`);
});
