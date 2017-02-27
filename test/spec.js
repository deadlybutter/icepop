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
          getBy: ['_id', 'name'],
          queryBy: ['_id', 'name', 'owner'],
          edit: {
            by: ['_id'],
            fields: ['name', 'owner', 'type', 'age'],
          },
          createFields: ['name', 'owner', 'type', 'age'],
          deleteBy: ['_id'],
          populate: ['owner'],
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

/*

# Security
 - Check endpoints that require auth


# Versions
 - Check multiple versions are created
 - Check deprecation works

# Query
 - Check pages are returned correctly
 - Check array is returned
 - Check query params from definitions work

# Get
 - Check only 1 item is returned
 - Check fields from definitions work

 */
