const API_ORIGIN = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

// Keep hosted URLs and frontend product assets on their own origin; resolve legacy
// server-relative upload paths against the API host.
export function resolveImageUrl(src) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src) || src.startsWith('/products/')) return src;
  return `${API_ORIGIN}${src}`;
}

const localImageBasePath = (name) => `/products/${name.toLowerCase().replace(/\s+/g, '-')}`;

export const getLocalProductImagePath = (name) => `${localImageBasePath(name)}.jpg`;

export async function findLocalProductImagePath(name) {
  const candidates = ['jpg', 'jpeg', 'png', 'webp'].map((extension) => `${localImageBasePath(name)}.${extension}`);
  const matches = await Promise.all(candidates.map(async (path) => {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/') ? path : '';
    } catch {
      return '';
    }
  }));
  return matches.find(Boolean) || '';
}
