const { buildCrudRouter } = require('../utils/crudRouterFactory');
const Product = require('../models/Product');

module.exports = buildCrudRouter(Product, { hasCategory: true });
