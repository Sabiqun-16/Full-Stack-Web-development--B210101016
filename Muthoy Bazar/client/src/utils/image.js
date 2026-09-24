const API_ORIGIN = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

// Product images are stored either as absolute URLs (pasted by an admin, e.g. https://...)
// or as server-relative paths from a real Multer upload (e.g. /uploads/rice-173.jpg).
// This resolves either form into something the browser can load directly.
export function resolveImageUrl(src) {
  if (!src) return '';
  return /^https?:\/\//i.test(src) ? src : `${API_ORIGIN}${src}`;
}
