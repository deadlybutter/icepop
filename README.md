# Icepop

Quickly bootstrap a Express+Mongoose API
_:warning: This is a V1, the code isn't very dry & it might not suit your project at the moment._

## Installation

```sh
$ npm install icepop
```

## Get started

This guide is designed for an Express + Mongoose server, eg:

```js
const express = require('express');
const app = express();

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('localhost:27017/icepop_example');

mongoose.connection.on('open', () => {
  console.info('Mongoose connection open');
});

app.listen(5000, function () {
  console.info(`Icepop test server listening on port 5000`);
});
```

To setup your API routes, simply require icepop & give it your API definitions (Covered below)

```js
const icepop = require('icepop');
const spec = {}; // Explained below...
app.use('/api', icepop(spec));
```

## Definitions spec

```js
{
  versions: {
    'v1': { // Scope out your different schema versions easily
      entities: [
        {
          id: 'cat', // This should be the unique name of your entity.
          getBy: ['_id', 'name'], // These are properties you can use to individually get this entity. eg: GET /api/v1/cat/_id/123456789
          queryBy: ['_id', 'name', 'owner'], // These are properties you can use to query by & paginate on. eg: GET /api/v1/cat?_owner=bob&page=2
          createFields: ['name', 'owner'], // These are properties that must be filled out when creating a new entity via POST
          edit: {
            by: ['_id'], // These are the fields you can query by for an edit. eg: PUT /api/v1/cat/_id/123456789
            fields: ['name', 'owner'], // These are fields you can actually change
          },
          deleteBy: ['_id'], // These are the fields you can query for for a delete. eg: DELETE /api/v1/cat/_id/123456789
          populate: ['owner'], // These are fields that have embedded mongo documents and should be populated when queried
          model: Cat, // The Mongoose object
          deprecated: true, // Indicate this model for this api scope is deprecated
        }
      ]
    },
  },
  security: {
    key: 'abcdefg123456', // Set a API secret key. eg: process.env.API_KEY
  },
}
```

## Generated API Documentation

Api Docs are automatically generated for your API spec. Visit `/api/docs` in your application.
(Soon).

## Local dev

`git clone`
`npm install`

For testing changes, use `npm run server` to start a dev server, and `npm run test` to execute all tests. (You'll need Mongo running to execute both).


TESTS TO WRITE
- multiple versions
- deprecation notice
- population

TODO
- enforce lowercase, no space ID
