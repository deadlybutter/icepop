module.exports = {
  deprecated: {
    status: 410,
    res: {
      error: true,
      message: 'This API route is deprecated',
    }
  },
  invalidField: {
    status: 400,
    res: {
      error: true,
      message: 'You can\' query on this field',
    },
  },
  entityNotFound: {
    status: 404,
    res: {
      error: true,
      message: 'This entity does not exist',
    }
  },
  missingData: {
    status: 400,
    res: {
      error: true,
      message: 'This request did not supply the required data',
    }
  },
  notAuthorized: {
    status: 403,
    res: {
      error: true,
      message: 'You are not authenticated to perform this request',
    }
  },
}
