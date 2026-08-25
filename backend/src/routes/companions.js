const { buildCrudRouter } = require('../utils/crudRouterFactory');
const Companion = require('../models/Companion');

module.exports = buildCrudRouter(Companion, { hasCategory: true });
