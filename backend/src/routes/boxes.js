const { buildCrudRouter } = require('../utils/crudRouterFactory');
const Box = require('../models/Box');

module.exports = buildCrudRouter(Box, { hasCategory: false });
