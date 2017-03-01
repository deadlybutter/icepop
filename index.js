const console = require('keypunch');
console.logLevel = process.env.LOG_LEVEL || 0;
console.addHeaderFunction((type) => `[Icepop (${type})] `);

const responses = require('./lib/responses');

const router = require('express')();

const bodyParser = require('body-parser');
router.use(bodyParser.json());

const MAX_ITEMS_PER_PAGE = 25;

let API_KEY = '';

function deprecatedHandler(req, res) {
  const status = responses.deprecated.status;
  const message = responses.deprecated.res;

  res.status(status).json(message);
}

function queryHandler(req, res) {
  const query = {};
  const page = req.query.page || 1;
  const populate = this.populate ? this.populate.join(' ') : '';

  Object.keys(req.query).forEach((fieldKey) => {
    if (this.queryBy.indexOf(fieldKey) !== -1) {
      query[fieldKey] = req.query[fieldKey];
    }
  });

  this.model
    .find(query)
    .populate(populate)
    .skip(MAX_ITEMS_PER_PAGE * (page -1))
    .limit(MAX_ITEMS_PER_PAGE)
    .then((items) => {
      res.json({
        error: false,
        pagination: {
          page,
          count: items.length,
          max: MAX_ITEMS_PER_PAGE,
        },
        data: items,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: true,
        message: err.message || 'the server had an error',
      });
    });
}

function getHandler(req, res) {
  const requestedField = req.params.field;
  const requestedId = req.params.id;

  if (this.getBy.indexOf(requestedField) === -1) {
    const invalidField = responses.invalidField;
    return res.status(invalidField.status).json(invalidField.res);
  }

  const query = {};
  query[requestedField] = requestedId;

  const populate = this.populate ? this.populate.join(' ') : '';

  this.model
    .findOne(query)
    .populate(populate)
    .then((item) => {
      if (!item) {
        const entityNotFound = responses.entityNotFound;
        return res.status(entityNotFound.status).json(entityNotFound.res);
      }

      res.json({
        error: false,
        data: item,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: true,
        message: err.message || 'the server had an error',
      });
    });
}

function createHandler(req, res) {
  const missingData = responses.missingData;

  if (!req.body) {
    return res.status(missingData.status).json(missingData.res);
  }

  if (!req.body.key || req.body.key !== API_KEY) {
    const notAuthorized = responses.notAuthorized;
    return res.status(notAuthorized.status).json(notAuthorized.res);
  }

  const data = {};
  Object.keys(req.body).forEach((dataKey) => {
    if (this.createFields.indexOf(dataKey) !== -1) {
      data[dataKey] = req.body[dataKey];
    }
  });

  if (Object.keys(data).length < this.createFields.length) {
    return res.status(missingData.status).json(missingData.res);
  }

  const newModel = new this.model(data);

  newModel.save()
    .then((createdModel) => {
      res.json({
        error: false,
        data: createdModel,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: true,
        message: err.message || 'the server had an error',
      });
    });
}

function editHandler(req, res) {
  if (!req.body) {
    const missingData = responses.missingData;
    return res.status(missingData.status).json(missingData.res);
  }

  if (!req.body.key || req.body.key !== API_KEY) {
    const notAuthorized = responses.notAuthorized;
    return res.status(notAuthorized.status).json(notAuthorized.res);
  }

  const requestedField = req.params.field;
  const requestedId = req.params.id;

  if (this.edit.by.indexOf(requestedField) === -1) {
    const invalidField = responses.invalidField;
    return res.status(invalidField.status).json(invalidField.res);
  }

  const query = {};
  query[requestedField] = requestedId;
  const populate = this.populate ? this.populate.join(' ') : '';

  this.model
    .findOne(query)
    .populate(populate)
    .then((item) => {
      if (!item) {
        const entityNotFound = responses.entityNotFound;
        return res.status(entityNotFound.status).json(entityNotFound.res);
      }

      Object.keys(req.body).forEach((dataKey) => {
        if (this.edit.fields.indexOf(dataKey) !== -1) {
          item[dataKey] = req.body[dataKey];
        }
      });

      return item.save();
    })
    .then((savedItem) => {
      res.json({
        error: false,
        data: savedItem,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: true,
        message: err.message || 'the server had an error',
      });
    });
}

function deleteHandler(req, res) {
  if (!req.body.key || req.body.key !== API_KEY) {
    const notAuthorized = responses.notAuthorized;
    return res.status(notAuthorized.status).json(notAuthorized.res);
  }

  const requestedField = req.params.field;
  const requestedId = req.params.id;

  if (this.deleteBy.indexOf(requestedField) === -1) {
    const invalidField = responses.invalidField;
    return res.status(invalidField.status).json(invalidField.res);
  }

  const query = {};
  query[requestedField] = requestedId;

  this.model
    .findOne(query)
    .remove()
    .then((results) => {
      res.json({
        error: false,
        data: {
          deleted: results.result.ok === 1,
        },
      })
    })
    .catch((err) => {
      res.status(500).json({
        error: true,
        message: err.message || 'the server had an error',
      });
    });
}

module.exports = (definitions) => {
  if (!definitions) {
    console.error('No definitions provided to Icepop');
    return router;
  }

  API_KEY = definitions.security ? definitions.security.key : '';

  Object.keys(definitions.versions).forEach((versionKey) => {
    const routePrefix = `/${versionKey}`;
    const version = definitions.versions[versionKey];

    if (!version.active) {
      const wildcard = `${routePrefix}/*`;
      router.get(wildcard, deprecatedHandler);
      router.post(wildcard, deprecatedHandler);
      router.put(wildcard, deprecatedHandler);
      router.delete(wildcard, deprecatedHandler);
      return;
    }

    version.entities.forEach((entity) => {
      if (!entity.id) {
        console.error('An Entity is missing a ID');
        return;
      }

      if (!entity.model) {
        console.error(`${entity.id} is missing a model reference`);
        return;
      }

      if (entity.queryBy) {
        router.get(`${routePrefix}/${entity.id}`, queryHandler.bind(entity));
      }

      if (entity.getBy) {
        router.get(`${routePrefix}/${entity.id}/:field/:id`, getHandler.bind(entity));
      }

      if (entity.createFields) {
        router.post(`${routePrefix}/${entity.id}`, createHandler.bind(entity));
      }

      if (entity.edit) {
        router.put(`${routePrefix}/${entity.id}/:field/:id`, editHandler.bind(entity));
      }

      if (entity.deleteBy) {
        router.delete(`${routePrefix}/${entity.id}/:field/:id`, deleteHandler.bind(entity));
      }
    });
  });

  return router;
}
