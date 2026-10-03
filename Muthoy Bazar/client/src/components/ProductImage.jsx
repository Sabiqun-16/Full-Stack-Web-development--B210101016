import React, { useEffect, useRef, useState } from 'react';
import { findLocalProductImagePath, resolveImageUrl } from '../utils/image';

export default function ProductImage({ product, onMissing, ...imageProps }) {
  const imageUrl = resolveImageUrl(product.images?.[0]);
  const onMissingRef = useRef(onMissing);
  const [src, setSrc] = useState(imageUrl);
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    onMissingRef.current = onMissing;
  }, [onMissing]);

  useEffect(() => {
    let active = true;
    setSrc(imageUrl);
    setTriedFallback(false);

    if (!imageUrl) {
      findLocalProductImagePath(product.name).then((path) => {
        if (active && path) setSrc(path);
        else if (active) onMissingRef.current?.();
      });
    }

    return () => { active = false; };
  }, [imageUrl, product.name]);

  const handleError = async () => {
    if (triedFallback) {
      onMissingRef.current?.();
      return;
    }
    setTriedFallback(true);
    const path = await findLocalProductImagePath(product.name);
    if (path && path !== src) setSrc(path);
    else onMissingRef.current?.();
  };

  return <img {...imageProps} src={src} alt={imageProps.alt || product.name} onError={handleError} />;
}