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

module.exports = {
  versions: {
    'v1': {
      entities: [
        {
          id: 'dog',
          getBy: ['_id', 'name'],
          queryBy: ['_id', 'name', 'owner'],
          edit: {
            by: ['_id'],
            fields: ['name', 'owner', 'type', 'age'],
          },
          createFields: ['name', 'owner', 'type', 'age'],
          deleteBy: ['_id'],
          populate: {
            path: 'owner',
            model: 'Person',
          },
          model: Dog,
        },
        {
          id: 'person',
          queryBy: ['name'],
          getBy: ['name'],
          edit: {
            by: ['_id'],
            fields: ['name'],
          },
          createFields: ['name'],
          deleteBy: ['_id'],
          model: Person,
        },
      ],
    },
  },
  security: {
    key: '123456789',
  }
}
