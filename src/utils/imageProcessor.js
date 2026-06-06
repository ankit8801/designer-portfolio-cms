/**
 * Utility for client-side image processing: resizing, WebP conversion, and watermarking.
 * 
 * @param {File|Blob} file - The original image file.
 * @param {Object} options - Configuration options.
 * @param {number} [options.maxWidth=1920] - Maximum width for resizing.
 * @param {number} [options.quality=0.8] - WebP compression quality (0 to 1).
 * @param {Object} [options.watermark] - Watermark settings.
 * @param {boolean} [options.watermark.enabled=false] - Whether to apply a watermark.
 * @param {string} [options.watermark.type='text'] - 'text' or 'image'.
 * @param {string} [options.watermark.text=''] - Text for the watermark if type is 'text'.
 * @param {string} [options.watermark.imageUrl=''] - URL for the watermark image if type is 'image'.
 * @returns {Promise<Blob>} - Resolves with the optimized WebP Blob.
 */
export const processImageForWeb = async (file, options = {}) => {
  const {
    maxWidth = 1920,
    quality = 0.8,
    watermark = { enabled: false, type: 'text', text: '', imageUrl: '' }
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      const exportCanvas = () => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas export failed'));
          }
        }, 'image/webp', quality);
      };

      // Apply watermark if enabled
      if (watermark.enabled) {
        if (watermark.type === 'text' && watermark.text) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          // Scale font size based on image width, minimum 14px
          const fontSize = Math.max(14, width * 0.025);
          ctx.font = `${fontSize}px sans-serif`;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          
          // Add a subtle drop shadow for readability on varying backgrounds
          ctx.shadowColor = "rgba(0,0,0,0.5)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;

          ctx.fillText(watermark.text, width - 20, height - 20);
          
          // Reset shadow
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          exportCanvas();
        } else if (watermark.type === 'image' && watermark.imageUrl) {
          const wmImg = new Image();
          wmImg.crossOrigin = 'anonymous';
          wmImg.onload = () => {
             // Watermark width is 15% of the main image width
             const wmWidth = width * 0.15; 
             const wmHeight = (wmImg.height * wmWidth) / wmImg.width;
             
             ctx.globalAlpha = 0.5;
             ctx.drawImage(wmImg, width - wmWidth - 20, height - wmHeight - 20, wmWidth, wmHeight);
             ctx.globalAlpha = 1.0;
             
             exportCanvas();
          };
          wmImg.onerror = () => {
             console.warn("Failed to load watermark image, proceeding without it.");
             exportCanvas();
          };
          wmImg.src = watermark.imageUrl;
        } else {
          exportCanvas();
        }
      } else {
        exportCanvas();
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for processing'));
    img.src = objectUrl;
  });
};
