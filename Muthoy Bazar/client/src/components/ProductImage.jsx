import React, { useEffect, useState } from 'react';
import { findLocalProductImagePath, resolveImageUrl } from '../utils/image';

export default function ProductImage({ product, ...imageProps }) {
  const imageUrl = resolveImageUrl(product.images?.[0]);
  const [src, setSrc] = useState(imageUrl);
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    let active = true;
    setSrc(imageUrl);
    setTriedFallback(false);

    if (!imageUrl) {
      findLocalProductImagePath(product.name).then((path) => {
        if (active && path) setSrc(path);
      });
    }

    return () => { active = false; };
  }, [imageUrl, product.name]);

  const handleError = async () => {
    if (triedFallback) return;
    setTriedFallback(true);
    const path = await findLocalProductImagePath(product.name);
    if (path) setSrc(path);
  };

  return <img {...imageProps} src={src} alt={imageProps.alt || product.name} onError={handleError} />;
}