const fs = require('fs');
const path = require('path');
const readline = require('readline');
const localApi = process.env.LOCAL_API_URL || 'http://localhost:5000/api';
const liveApi = process.env.LIVE_API_URL || 'https://muthoy-bazar-backend.onrender.com/api';
const applyChanges = process.argv.includes('--apply');
const clientProductsDir = path.resolve(__dirname, '../client/public/products');
const clientProductFiles = new Set(fs.readdirSync(clientProductsDir));
const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
const imageAliases = {
  'international gluta bar bouncy bright': '/products/bathing-soap-bar.jpg',
  'fluoride toothpaste': '/products/Fluoride%20Toothpast%20Colgate.png',
  'almonds': '/products/Almonds.jpg',
  'chia seeds': '/products/Chia%20Seeds.jpg',
  'vermicelli (shemai)': '/products/Vermicelli%20(Shemai).jpg',
  'mineral water 5l jar': '/products/mineral-water-5L-jar.jpg',
  'roasted thai peanuts': '/products/roasted-peanuts.jpeg',
  'mango fruit juice': '/products/Mango-fruit-juice.jpg',
};
const brandImageAliases = {
  'full cream milk powder|auro milk': '/products/auro-milk-full-cream-milk-powder.jpg',
  'full cream milk powder|i milk': '/products/i-milk-full-cream-milk-powder.jpg',
};
const productFields = [
  'name', 'brand', 'category', 'description', 'images', 'price', 'discountPrice',
  'stock', 'sku', 'weight', 'unit', 'isFeatured', 'isBestSeller', 'isNewArrival', 'isActive',
];

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `${options.method || 'GET'} ${url} failed (${response.status})`);
  }
  return data;
}

function categoryName(product) {
  return typeof product.category === 'object' ? product.category?.name || '' : '';
}

function localStaticImage(name, brand = '') {
  const isCommittedAsset = (image) => {
    try {
      return clientProductFiles.has(decodeURIComponent(path.basename(image)));
    } catch {
      return false;
    }
  };

  const alias = brandImageAliases[`${name.toLowerCase()}|${brand.toLowerCase()}`] || imageAliases[name.toLowerCase()];
  if (alias && isCommittedAsset(alias)) return alias;

  const base = `/products/${name.toLowerCase().replace(/\s+/g, '-')}`;
  return imageExtensions
    .map((extension) => `${base}.${extension}`)
    .find(isCommittedAsset) || '';
}

function portableImage(image) {
  const localHost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(image);
  if (localHost) return false;
  if (image.startsWith('/products/')) {
    try {
      return clientProductFiles.has(decodeURIComponent(path.basename(image)));
    } catch {
      return false;
    }
  }
  return /^https?:\/\//i.test(image);
}

function imagesForSync(source, existing) {
  const fallback = localStaticImage(source.name, source.brand);
  if (fallback) return [fallback];

  const stableImages = (source.images || []).filter(portableImage);
  if (stableImages.length) return stableImages;

  return (existing?.images || []).filter(portableImage);
}

function makePayload(source, liveCategoryByName, existing) {
  const category = categoryName(source);
  const payload = {
    name: source.name,
    brand: source.brand,
    description: source.description,
    images: imagesForSync(source, existing),
    price: source.price,
    discountPrice: source.discountPrice,
    stock: source.stock,
    sku: source.sku,
    weight: source.weight,
    unit: source.unit,
    isFeatured: source.isFeatured,
    isBestSeller: source.isBestSeller,
    isNewArrival: source.isNewArrival,
    isActive: source.isActive,
  };

  if (category) {
    const liveCategory = liveCategoryByName.get(category);
    if (!liveCategory) throw new Error(`Live database is missing category: ${category}`);
    payload.category = liveCategory._id;
  } else if (existing?.category?._id) {
    payload.category = existing.category._id;
  } else {
    payload.category = null;
  }

  return payload;
}

function changedFields(payload, existing) {
  return productFields.filter((field) => {
    const payloadValue = field === 'category' ? payload.category || null : payload[field];
    const existingValue = field === 'category' ? existing.category?._id || null : existing[field];
    return JSON.stringify(payloadValue) !== JSON.stringify(existingValue);
  });
}

async function promptEmailAndPassword() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const email = await new Promise((resolve) => rl.question('Live admin email: ', resolve));
  rl.close();

  if (!process.stdin.isTTY || !process.stdin.setRawMode) {
    throw new Error('Run --apply in an interactive VS Code terminal so the password can be entered safely.');
  }

  process.stdout.write('Live admin password (hidden): ');
  const input = process.stdin;
  const oldRawMode = input.isRaw;
  let password = '';

  const passwordPromise = new Promise((resolve, reject) => {
    const cleanup = () => {
      input.off('data', onData);
      input.setRawMode(oldRawMode || false);
      input.pause();
      process.stdout.write('\n');
    };
    const onData = (buffer) => {
      for (const character of buffer.toString('utf8')) {
        if (character === '\u0003') {
          cleanup();
          reject(new Error('Cancelled'));
          return;
        }
        if (character === '\r' || character === '\n') {
          cleanup();
          resolve(password);
          return;
        }
        if (character === '\u007f' || character === '\b') {
          password = password.slice(0, -1);
        } else if (character >= ' ') {
          password += character;
        }
      }
    };

    input.setRawMode(true);
    input.resume();
    input.on('data', onData);
  });

  return { email: email.trim(), password: await passwordPromise };
}

async function main() {
  const [localResponse, liveResponse, categoriesResponse] = await Promise.all([
    requestJson(`${localApi}/products?limit=200`),
    requestJson(`${liveApi}/products?limit=200`),
    requestJson(`${liveApi}/categories`),
  ]);
  const localProducts = localResponse.products;
  const liveProducts = liveResponse.products;
  const groupBy = (items, keyFn) => {
    const groups = new Map();
    for (const item of items) {
      const key = keyFn(item);
      groups.set(key, [...(groups.get(key) || []), item]);
    }
    return groups;
  };
  const liveByName = groupBy(liveProducts, (product) => product.name);
  const liveBySku = new Map(liveProducts.map((product) => [product.sku, product]));
  const localNameCounts = new Map([...groupBy(localProducts, (product) => product.name)]
    .map(([name, products]) => [name, products.length]));
  const liveCategoryByName = new Map(categoriesResponse.categories.map((category) => [category.name, category]));
  const plans = localProducts.map((source) => {
    const skuMatch = liveBySku.get(source.sku);
    const nameMatches = liveByName.get(source.name) || [];
    const uniqueNameMatch = nameMatches.length === 1 && localNameCounts.get(source.name) === 1
      ? nameMatches[0]
      : null;
    const existing = skuMatch || uniqueNameMatch;
    const payload = makePayload(source, liveCategoryByName, existing);
    const matchedBySku = existing && existing.name !== source.name && existing.sku === source.sku;
    return { source, existing, payload, matchedBySku, fields: existing ? changedFields(payload, existing) : [] };
  });
  const updates = plans.filter((plan) => plan.existing && plan.fields.length);
  const creates = plans.filter((plan) => !plan.existing);
  const localKeys = new Set(localProducts.flatMap((product) => [product.name, product.sku]));
  const liveOnlyImageUpdates = liveProducts
    .filter((product) => !localKeys.has(product.name) && !localKeys.has(product.sku))
    .map((product) => ({ product, image: localStaticImage(product.name, product.brand) }))
    .filter(({ product, image }) => image && JSON.stringify([image]) !== JSON.stringify(product.images || []));
  const liveOnlyWithoutImage = liveProducts.filter(
    (product) => !localKeys.has(product.name) && !localKeys.has(product.sku)
      && !localStaticImage(product.name, product.brand)
  );

  console.log(`Local products: ${localProducts.length}; live products: ${liveProducts.length}`);
  console.log(`Would update: ${updates.length}; would add: ${creates.length}; image-only fixes: ${liveOnlyImageUpdates.length}. Live-only product data will be kept.`);
  updates.forEach(({ source, existing, matchedBySku, fields }) => {
    const action = matchedBySku ? `RENAME ${existing.name} -> ${source.name}` : `UPDATE ${source.name}`;
    console.log(`${action}: ${fields.join(', ')}`);
  });
  creates.forEach(({ source }) => console.log(`ADD ${source.name}`));
  liveOnlyImageUpdates.forEach(({ product, image }) => console.log(`IMAGE ONLY ${product.name}: ${image}`));
  liveOnlyWithoutImage.forEach((product) => console.log(`NO MATCHING PHOTO ${product.name}`));
  console.log('Local /uploads images are skipped; matching client/public/products images are used instead.');

  if (!applyChanges) {
    console.log('\nDry run only. Review this list, then run with --apply to sync.');
    return;
  }

  const { email, password } = await promptEmailAndPassword();
  const login = await requestJson(`${liveApi}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (login.user?.role !== 'admin') throw new Error('That account is not an admin.');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const confirmation = await new Promise((resolve) =>
    rl.question(`Type SYNC to apply ${updates.length} updates, ${creates.length} additions, and ${liveOnlyImageUpdates.length} image-only fixes: `, resolve)
  );
  rl.close();
  if (confirmation !== 'SYNC') {
    console.log('No changes applied.');
    return;
  }

  const headers = {
    Authorization: `Bearer ${login.token}`,
    'Content-Type': 'application/json',
  };
  for (const plan of updates) {
    await requestJson(`${liveApi}/admin/products/${plan.existing._id}`, {
      method: 'PUT', headers, body: JSON.stringify(plan.payload),
    });
    console.log(`Updated ${plan.source.name}`);
  }
  for (const plan of creates) {
    await requestJson(`${liveApi}/admin/products`, {
      method: 'POST', headers, body: JSON.stringify(plan.payload),
    });
    console.log(`Added ${plan.source.name}`);
  }
  for (const { product, image } of liveOnlyImageUpdates) {
    await requestJson(`${liveApi}/admin/products/${product._id}`, {
      method: 'PUT', headers, body: JSON.stringify({ images: [image] }),
    });
    console.log(`Fixed image for ${product.name}`);
  }
  console.log('Product sync complete. No live-only products were deleted.');
}

main().catch((error) => {
  console.error(`Sync stopped: ${error.message}`);
  process.exitCode = 1;
});