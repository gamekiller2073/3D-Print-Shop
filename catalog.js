globalThis.SHOP_CATALOG = Object.freeze({
  'evergreen vase': { name: 'Evergreen Vase', priceCents: 1250, scalable: true },
  'japandi vase': { name: 'Japandi Vase', sizePrices: { big: 1200, small: 1000 } },
  'spiral vase': { name: 'Spiral Vase', priceCents: 900, scalable: true },
  'strata vase': { name: 'Strata Vase', priceCents: 1200, scalable: true },
  'mcm vase': { name: 'MCM Vase', priceCents: 1100, scalable: true },
  'wave vase': { name: 'Wave Vase', priceCents: 1500, scalable: true },
  'quell vase': { name: 'Quell Vase', priceCents: 1400 },
  'solara vase': { name: 'Solara Vase', priceCents: 1100 },
  'radiate vase': { name: 'Radiate Vase', priceCents: 1300 },
  'harmony vase': { name: 'Harmony Vase', priceCents: 1250 },
  'modern spiral vase': { name: 'Modern Spiral Vase', priceCents: 1050 },
  'hell-level difficulty puzzle': { name: 'Hell-level difficulty puzzle', priceCents: 1500 },
  't puzzle': { name: 'T puzzle', priceCents: 1050 },
  'hexagonal puzzle': { name: 'Hexagonal puzzle', priceCents: 1300 },
  'star puzzle': { name: 'Star Puzzle', priceCents: 800 },
  'piramide': { name: 'Piramide', priceCents: 200, scalable: true },
  'gear click fidget': { name: 'Gear Click Fidget', priceCents: 150 },
  'flexi dragon': { name: 'Flexi Dragon', priceCents: 650 },
  'flexi grid': { name: 'Flexi Grid', priceCents: 400 },
  'flexi rexy': { name: 'Flexi Rexy', priceCents: 250 },
  'fidget keychain': { name: 'Fidget Keychain', priceCents: 50 },
  'speed cube stand': { name: 'Speed Cube Stand', priceCents: 150 },
  'elegant cube stand': { name: 'Elegant Cube Stand', priceCents: 150 },
  'spotify sleutelhanger': { name: 'Spotify sleutelhanger', priceCents: 200 },
  'name keychain': { name: 'Name Keychain', priceCents: 300 },
  'cable winder': { name: 'Cable winder', priceCents: 500 },
  'guitar wall mount': { name: 'Guitar Wall Mount', priceCents: 350 },
  'motorblock pen holder': { name: 'Motorblock Pen Holder', priceCents: 400 },
  'drum stick holder for 7a dual clip': { name: 'Drum Stick Holder For 7A Dual Clip', priceCents: 100 },
  'gridfinity grid': { name: 'Gridfinity Grid', quoteRequired: true },
  'gridfinity hollow bin': { name: 'Gridfinity Hollow Bin', quoteRequired: true }
});

globalThis.getShopPriceCents = function getShopPriceCents(product, options = {}) {
  const key = typeof product === 'string' ? product.trim().toLowerCase() : '';
  const item = globalThis.SHOP_CATALOG[key];
  if (!item) throw new Error('This product is not available for checkout.');
  if (item.quoteRequired) throw new Error('This product needs a custom quote before checkout.');

  if (item.sizePrices) {
    const size = options.size || 'big';
    const price = item.sizePrices[size];
    if (!price) throw new Error('Choose a valid product size.');
    return price;
  }

  if (item.scalable) {
    const size = options.size || '100%';
    const match = typeof size === 'string' ? size.match(/^(50|60|70|80|90|100|110|120|130|140|150)%$/) : null;
    if (!match) throw new Error('Choose a valid product size.');
    return Math.round(item.priceCents * Number(match[1]) / 100);
  }

  return item.priceCents;
};

globalThis.formatShopPrice = function formatShopPrice(priceCents) {
  return `€ ${(priceCents / 100).toFixed(2).replace('.', ',')}`;
};

globalThis.buildShopLineItems = function buildShopLineItems(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0 || cartItems.length > 50) {
    throw new Error('Your cart is empty or contains too many items.');
  }

  const optionLabels = {
    color: 'Color', textColor: 'Text Color', baseColor: 'Base Color',
    puzzleColor: 'Puzzle Color', tColor: 'T Color', blockColor: 'Block Color',
    starColor: 'Star Color',
    outerColor: 'Outer Color', innerColor: 'Inner Color', boxColor: 'Box Color',
    fingerColor: 'Finger Color', batteryType: 'Battery Type', spotify: 'Spotify',
    shape: 'Shape', size: 'Size', name: 'Name', guitarType: 'Guitar Type',
    labels: 'Labels', fingerSlide: 'Finger Slide', drawerWidthMm: 'Drawer Width (mm)',
    drawerDepthMm: 'Drawer Depth (mm)', hollowHeightUnits: 'Height Units',
    hollowWidthUnits: 'Width Units', hollowDepthUnits: 'Depth Units'
  };

  return cartItems.map(item => {
    if (!item || typeof item.product !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new Error('Each cart item must have a valid product and quantity.');
    }

    const options = item.options && typeof item.options === 'object' && !Array.isArray(item.options) ? item.options : {};
    const product = globalThis.SHOP_CATALOG[item.product.trim().toLowerCase()];
    const amount = globalThis.getShopPriceCents(item.product, options);
    const descriptionOptions = [];

    for (const [key, label] of Object.entries(optionLabels)) {
      const value = options[key];
      if (typeof value === 'string' && value.trim()) {
        descriptionOptions.push(`${label}: ${value.trim().slice(0, 200)}`);
      }
    }

    return {
      price_data: {
        currency: 'eur',
        product_data: {
          name: product.name,
          ...(descriptionOptions.length ? { description: descriptionOptions.join(', ').slice(0, 1000) } : {})
        },
        unit_amount: amount
      },
      quantity: item.quantity
    };
  });
};