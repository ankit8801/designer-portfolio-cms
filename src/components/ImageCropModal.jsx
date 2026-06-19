import React, { useState, useRef, useEffect } from 'react';
import { Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';

const ASPECT_RATIOS = [
  { label: 'Free', value: undefined },
  { label: 'Square (1:1)', value: 1 / 1 },
  { label: 'Portrait (4:5)', value: 4 / 5 },
  { label: 'Widescreen (16:9)', value: 16 / 9 },
];

export default function ImageCropModal({ isOpen, image, onCancel, onCropComplete, mode = 'content' }) {
  const [view, setView] = useState(mode === 'cover' ? 'crop' : 'preview');
  const [aspect, setAspect] = useState(mode === 'cover' ? 16 / 9 : undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const cropperRef = useRef(null);

  // Reset view on open based on mode
  useEffect(() => {
    if (isOpen) {
      setView(mode === 'cover' ? 'crop' : 'preview');
      setAspect(mode === 'cover' ? 16 / 9 : undefined);
    }
  }, [isOpen, mode]);

  const handleUseOriginal = async () => {
    setIsProcessing(true);
    try {
      // Fetch data URL back to Blob and attach a flag to skip resizing if needed
      const res = await fetch(image);
      const blob = await res.blob();
      // Add a custom property so the image processor knows to preserve dimensions
      blob.preserveDimensions = true; 
      onCropComplete(blob);
    } catch (e) {
      console.error(e);
      alert('Failed to process original image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCrop = () => {
    const cropper = cropperRef.current;
    if (!cropper) return;
    setIsProcessing(true);

    const canvas = cropper.getCanvas();
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
        } else {
          alert('Crop failed.');
        }
        setIsProcessing(false);
      }, 'image/webp', 0.95);
    } else {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-page-surface/95 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-[95vw] md:w-[90vw] max-w-4xl bg-card-surface border border-border-primary/20 rounded-[32px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex-shrink-0 p-4 md:p-8 border-b border-border-primary/10 flex justify-between items-center bg-card-surface/50 backdrop-blur-md">
            <div>
              <span className="font-label text-[10px] tracking-[0.3em] uppercase text-accent-primary mb-1 block italic">Asset Preparation</span>
              <h2 className="font-headline font-bold text-xl uppercase tracking-wider text-primary-text">
                {view === 'preview' ? 'Preview Image' : 'Crop Image'}
              </h2>
            </div>
            <button 
              onClick={onCancel}
              className="w-10 h-10 bg-section-surface rounded-full flex items-center justify-center text-primary-text/40 hover:text-error hover:bg-card-surface transition active:scale-90"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            
            {view === 'preview' ? (
              // --- PREVIEW VIEW ---
              <div className="flex flex-col items-center p-8 space-y-8">
                <div className="w-full max-w-2xl bg-primary-text/40 rounded-2xl border border-border-primary/20 p-4 flex items-center justify-center overflow-hidden" style={{ minHeight: '300px' }}>
                  <img src={image} alt="Preview" className="max-w-full max-h-[50vh] object-contain rounded-lg" />
                </div>
                
                <div className="text-center space-y-2 max-w-md">
                  <h3 className="font-headline text-lg font-bold text-primary-text">Designer Intent Preserved</h3>
                  <p className="font-body text-sm text-primary-text/60">
                    We recommend uploading the original asset exactly as you formatted it in Figma/Photoshop. We'll optimize it to WebP under the hood without altering dimensions.
                  </p>
                </div>
              </div>
            ) : (
              // --- CROP VIEW ---
              <div className="flex flex-col h-full">
                <div className="relative h-[300px] sm:h-[400px] md:h-[500px] flex-shrink-0 bg-section-surface border-b border-border-primary/10">
                  <Cropper
                    ref={cropperRef}
                    src={image}
                    className="cropper h-full w-full"
                    stencilProps={{
                      aspectRatio: aspect,
                    }}
                  />
                </div>
                
                <div className="p-4 md:p-8">
                  <div className="space-y-4">
                    <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 block ml-1">Aspect Ratio Presets</label>
                    <div className="flex gap-2 flex-wrap">
                      {ASPECT_RATIOS.map((arr, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAspect(arr.value)}
                          className={`flex-1 min-w-[80px] py-3 px-2 rounded-xl text-[9px] font-headline font-bold uppercase tracking-widest transition ${
                            aspect === arr.value 
                            ? 'bg-accent-primary text-on-accent shadow-lg shadow-accent-primary/20' 
                            : 'bg-section-surface text-primary-text/40 hover:bg-card-surface hover:text-primary-text'
                          }`}
                        >
                          {arr.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>

          {/* Footer - Fixed Bottom */}
          <div className="flex-shrink-0 p-6 md:p-8 border-t border-border-primary/10 bg-card-surface/50 backdrop-blur-md">
            
            {view === 'preview' ? (
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 items-center">
                <button
                  type="button"
                  onClick={() => setView('crop')}
                  disabled={isProcessing}
                  className="w-full sm:w-auto font-headline text-[11px] font-bold uppercase tracking-widest text-primary-text/60 hover:text-primary-text transition-colors disabled:opacity-30 py-3 px-6 rounded-full border border-border-primary/20 hover:bg-section-surface"
                >
                  <span className="material-symbols-outlined text-[1rem] mr-2 align-middle">crop</span>
                  Edit / Crop
                </button>
                <button
                  type="button"
                  onClick={handleUseOriginal}
                  disabled={isProcessing}
                  className="w-full sm:w-auto bg-accent-primary text-on-accent px-10 py-4 rounded-full font-headline font-bold text-xs uppercase tracking-widest shadow-xl shadow-accent-primary/20 hover:scale-105 active:scale-95 transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <><div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[1.1rem]">cloud_upload</span> Use Original</>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 items-center">
                {mode === 'content' ? (
                  <button
                    type="button"
                    onClick={() => setView('preview')}
                    disabled={isProcessing}
                    className="w-full sm:w-auto font-headline text-[11px] font-bold uppercase tracking-widest text-primary-text/40 hover:text-primary-text transition-colors disabled:opacity-30 py-2"
                  >
                    Back to Preview
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="w-full sm:w-auto font-headline text-[11px] font-bold uppercase tracking-widest text-primary-text/40 hover:text-primary-text transition-colors disabled:opacity-30 py-2"
                  >
                    Discard
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleUseOriginal}
                  disabled={isProcessing}
                  className="w-full sm:w-auto font-headline text-[11px] font-bold uppercase tracking-widest text-primary-text/80 bg-section-surface hover:bg-card-surface transition-colors py-3 px-6 rounded-full border border-border-primary/20"
                >
                  Skip Crop
                </button>

                <button
                  type="button"
                  onClick={handleApplyCrop}
                  disabled={isProcessing}
                  className="w-full sm:w-auto bg-accent-primary text-on-accent px-10 py-4 rounded-full font-headline font-bold text-xs uppercase tracking-widest shadow-xl shadow-accent-primary/20 hover:scale-105 active:scale-95 transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <><div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" /> Cropping...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[1.1rem]">crop</span> Apply Crop</>
                  )}
                </button>
              </div>
            )}
            
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
