import React from 'react';
import { useProtectedImage } from '../../hooks/useProtectedImage';

/**
 * A standard <img> component that integrates practical deterrents against casual downloading.
 * It prevents right-click context menus, image dragging, and user text-selection.
 * It does NOT use pointer-events: none, to ensure it remains accessible to screen readers.
 * 
 * @param {Object} props - Standard img props (src, alt, className, etc.)
 */
export const ProtectedImage = React.forwardRef(({ src, alt, className = "", style = {}, ...props }, ref) => {
  const protectionProps = useProtectedImage();

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      {...protectionProps}
      {...props}
      style={{
        ...protectionProps.style,
        ...style
      }}
    />
  );
});

ProtectedImage.displayName = 'ProtectedImage';
