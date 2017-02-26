const console = require('keypunch');
console.logLevel = process.env.LOG_LEVEL || 0;
console.addHeaderFunction((type) => `[Icepop (${type})] `);

const responses = require('./lib/responses');

const router = require('express')();

const MAX_ITEMS_PER_PAGE = 25;

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
    if (this.query.indexOf(fieldKey) !== -1) {
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
      res.json({
        error: true,
        message: err,
      });
    });
}

function getHandler(req, res) {
  const requestedField = req.params.field;
  const requestedId = req.params.id;

  if (this.get.indexOf(requestedField) === -1) {
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
      res.json({
        error: true,
        message: err,
      });
    });
}

module.exports = (definitions) => {
  if (!definitions) {
    console.error('No definitions provided to Icepop');
    return router;
  }

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

      if (entity.query) {
        router.get(`${routePrefix}/${entity.id}`, queryHandler.bind(entity));
      }

      if (entity.get) {
        router.get(`${routePrefix}/${entity.id}/:field/:id`, getHandler.bind(entity));
      }
    });
  });

  return router;
}
