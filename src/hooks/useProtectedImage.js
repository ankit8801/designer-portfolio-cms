import { useCallback } from 'react';

/**
 * Hook to provide event handlers and inline styles for basic image protection.
 * Note: This only provides practical deterrents against casual copying (right-click, drag).
 * It does not prevent screenshots or extracting from browser cache/network inspector.
 * @returns {Object} Props to spread onto an <img> element.
 */
export const useProtectedImage = () => {
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDragStart = useCallback((e) => {
    e.preventDefault();
  }, []);

  return {
    onContextMenu: handleContextMenu,
    onDragStart: handleDragStart,
    draggable: false,
    style: {
      WebkitUserDrag: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
    }
  };
};
