const { buildCrudRouter } = require('../utils/crudRouterFactory');
const Decoration = require('../models/Decoration');

module.exports = buildCrudRouter(Decoration, { hasCategory: false });
