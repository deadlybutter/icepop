const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('localhost:27017/icepop_unit_test');

mongoose.connection.on('connected', () => {
  console.info('Mongoose connection open');
});

mongoose.connection.on('error', (err) => {
  console.info('Mongoose connection error', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose connection disconnected');
});

function dropDatabase(done) {
  mongoose.connection.db.dropDatabase(done);
}

beforeEach(function(done) {
  dropDatabase(done);
});

after(function(done) {
  dropDatabase(done)
});
