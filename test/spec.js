const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: String,
});

const Person = mongoose.model('person', personSchema);

const dogSchema = new mongoose.Schema({
  name: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'person',
  },
  type: String,
  age: Number,
});

const Dog = mongoose.model('dog', dogSchema);

const testPerson = new Person({
  name: 'Bob',
});

const testDog = new Dog({
  name: 'Spot',
  owner: testPerson,
  type: 'dalmatian',
  age: 4,
});

// testPerson.save().then(() => testDog.save());

module.exports = {
  versions: {
    'v1': {
      active: true,
      entities: [
        {
          id: 'dog',
          get: ['_id', 'name'],
          query: ['_id', 'name', 'owner'],
          edit: ['name', 'owner', 'type', 'age'],
          populate: ['owner'],
          model: Dog,
        },
        {
          id: 'person',
          query: ['name'],
          get: ['name'],
          edit: ['name'],
          model: Person,
        },
      ],
    },
  },
  security: {
    key: '123456789',
  }
}
