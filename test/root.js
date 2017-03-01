const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('localhost:27017/icepop_unit_test');

function dropDatabase(done) {
  mongoose.connection.db.dropDatabase(done);
}

before(function(done) {
  mongoose.connection.on('open', () => {
    console.info('Mongoose connection open');
    done();
  });
});

beforeEach(function(done) {
  dropDatabase(done);
});

after(function(done) {
  dropDatabase(done)
});
