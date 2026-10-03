const API_ORIGIN = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

// Keep hosted URLs and frontend product assets on their own origin; resolve legacy
// server-relative upload paths against the API host.
export function resolveImageUrl(src) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src) || src.startsWith('/products/')) return src;
  return `${API_ORIGIN}${src}`;
}

const localImageBasePath = (name) => `/products/${name.toLowerCase().replace(/\s+/g, '-')}`;
const localImageAliases = {
  'international gluta bar bouncy bright': '/products/bathing-soap-bar.jpg',
  'liquid detergent': '/products/liquid-detergent.webp',
  'anti-dandruff shampoo': '/products/anti-dandruff-shampoo.jpg',
  'toilet tissue roll (4-pack)': '/products/toilet-tissue-roll-(4-pack).jpg',
  'fluoride toothpaste': '/products/fluoride-toothpast-colgate.png',
  'almonds': '/products/Almonds.jpg',
  'chia seeds': '/products/Chia%20Seeds.jpg',
  'vermicelli (shemai)': '/products/vermicelli-(Shemai).jpg',
  'mineral water 5l jar': '/products/mineral-water-5L-jar.jpg',
  'roasted thai peanuts': '/products/roasted-peanuts.jpeg',
  'mango fruit juice': '/products/Mango-fruit-juice.jpg',
};

export const getLocalProductImagePath = (name) => `${localImageBasePath(name)}.jpg`;

export async function findLocalProductImagePath(name) {
  const alias = localImageAliases[name.toLowerCase()];
  const candidates = [
    ...(alias ? [alias] : []),
    ...['jpg', 'jpeg', 'png', 'webp'].map((extension) => `${localImageBasePath(name)}.${extension}`),
  ];

  for (const path of new Set(candidates)) {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) return path;
    } catch {
      continue;
    }
  }
  return '';
}
