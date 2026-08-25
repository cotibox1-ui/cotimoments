/**
 * Motor de precios — SECCIÓN 37 y 38 del spec.
 *
 * REGLA DE ORO: el frontend nunca es la fuente de verdad del precio.
 * Esta función recibe SOLO ids y cantidades desde el cliente, vuelve a
 * consultar la base de datos por los costos reales y vigentes, y calcula
 * el precio desde cero. El resultado (incluyendo cada costo usado) se
 * guarda como snapshot inmutable en el pedido.
 */

const Product = require('../models/Product');
const Companion = require('../models/Companion');
const Box = require('../models/Box');
const Decoration = require('../models/Decoration');
const Configuration = require('../models/Configuration');

class PricingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PricingError';
    this.statusCode = 400;
  }
}

/**
 * @param {Object} selection
 * @param {Array<{productId:string, quantity:number}>} selection.products
 * @param {Array<{productId:string, quantity:number}>} selection.companions
 * @param {string} selection.boxId
 * @param {Array<string>} selection.decorationIds
 * @param {boolean} selection.deliveryWanted
 * @returns {Promise<Object>} desglose completo con snapshots, listo para guardar en Order/Proposal
 */
async function calculateOrderPricing(selection) {
  const {
    products = [],
    companions = [],
    boxId,
    decorationIds = [],
    deliveryWanted = false,
  } = selection;

  if (!boxId) throw new PricingError('Debes seleccionar una caja.');
  if (!products.length) throw new PricingError('Debes seleccionar al menos un producto.');

  const config = await Configuration.getSingleton();

  // ---- Productos ----
  const resolvedProducts = [];
  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (!product || !product.available) {
      throw new PricingError(`El producto "${item.productId}" ya no está disponible.`);
    }
    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
    resolvedProducts.push({
      productId: product._id,
      name: product.name,
      quantity,
      unitCostAtOrder: product.cost,
      totalCost: product.cost * quantity,
    });
  }

  // ---- Acompañantes ----
  const resolvedCompanions = [];
  for (const item of companions) {
    const companion = await Companion.findById(item.productId);
    if (!companion || !companion.available) {
      throw new PricingError(`El acompañante "${item.productId}" ya no está disponible.`);
    }
    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
    resolvedCompanions.push({
      productId: companion._id,
      name: companion.name,
      quantity,
      unitCostAtOrder: companion.cost,
      totalCost: companion.cost * quantity,
    });
  }

  // ---- Caja ----
  const box = await Box.findById(boxId);
  if (!box || !box.available) {
    throw new PricingError('La caja seleccionada ya no está disponible.');
  }

  // ---- Decoración ----
  const resolvedDecorations = [];
  for (const decId of decorationIds) {
    const decoration = await Decoration.findById(decId);
    if (!decoration || !decoration.available) {
      throw new PricingError(`Un elemento de decoración ya no está disponible.`);
    }
    resolvedDecorations.push({
      decorationId: decoration._id,
      name: decoration.name,
      costAtOrder: decoration.cost,
    });
  }

  // ---- Suma de costo base (sección 11) ----
  const productsCost = resolvedProducts.reduce((sum, p) => sum + p.totalCost, 0);
  const companionsCost = resolvedCompanions.reduce((sum, c) => sum + c.totalCost, 0);
  const decorationsCost = resolvedDecorations.reduce((sum, d) => sum + d.costAtOrder, 0);
  const boxCost = box.cost;

  const baseCost = productsCost + companionsCost + decorationsCost + boxCost;

  // ---- Ganancia configurable (sección 12) ----
  const profitPercentage = config.pricing.profitPercentage;
  const profitAmount = round2((baseCost * profitPercentage) / 100);
  const boxPrice = round2(baseCost + profitAmount);

  // ---- Delivery (sección 13) ----
  const deliveryCostAtOrder = deliveryWanted ? config.delivery.cost : 0;
  const finalPrice = round2(boxPrice + deliveryCostAtOrder);

  return {
    resolvedProducts,
    resolvedCompanions,
    box: {
      boxId: box._id,
      name: box.name,
      costAtOrder: boxCost,
    },
    resolvedDecorations,
    pricing: {
      baseCost: round2(baseCost),
      profitPercentageAtOrder: profitPercentage,
      profitAmount,
      boxPrice,
      deliveryCostAtOrder,
      finalPrice,
    },
    freeLocationName: config.delivery.freeLocationName,
  };
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

module.exports = { calculateOrderPricing, PricingError, round2 };
