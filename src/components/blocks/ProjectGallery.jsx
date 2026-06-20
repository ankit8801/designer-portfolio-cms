import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { ProtectedImage } from '../ui/ProtectedImage';

const MediaItem = ({ item, className, onClick }) => {
  const videoRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsInView(entry.isIntersecting);
      });
    }, options);

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const handleVideoPlay = async () => {
      if (!videoRef.current || !isInView || !mounted) return;

      try {
        if (videoRef.current.readyState >= 3) {
          setIsBuffering(false);
          await videoRef.current.play();
        } else {
          setIsBuffering(true);
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.oncanplay = resolve;
            }
          });
          if (mounted) {
            setIsBuffering(false);
            await videoRef.current.play();
          }
        }
      } catch (error) {
        console.warn("Video playback failed:", error);
      }
    };

    if (isInView) {
      handleVideoPlay();
    } else if (videoRef.current) {
      videoRef.current.pause();
    }

    return () => {
      mounted = false;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, [isInView]);

  if (item.type === 'video') {
    return (
      <div className={`${className} relative overflow-hidden bg-card-surface`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          onClick={onClick}
          playsInline
          muted
          loop
          preload="auto"
          style={{
            opacity: isBuffering ? 0.8 : 1,
            transition: 'opacity 0.2s',
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
        >
          <source src={item.url} type="video/mp4" />
        </video>
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-card-surface">
            <div className="w-6 h-6 border-2 border-border-primary/40 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-primary-text/40 backdrop-blur-sm">
          <Play className="w-3 h-3 text-primary-text fill-page-surface" />
        </div>
      </div>
    );
  }

  return (
    <ProtectedImage
      src={item.url}
      alt={item.title}
      className={`${className} cursor-pointer`}
      onClick={onClick}
      loading="lazy"
      decoding="async"
    />
  );
};

const GalleryModal = ({ selectedItem, isOpen, onClose, setSelectedItem, mediaItems }) => {
  const [dockPosition, setDockPosition] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30
        }}
        className="fixed inset-0 w-full min-h-screen flex items-center justify-center backdrop-blur-2xl bg-primary-text/90 z-[200] p-4 md:p-8"
      >
        <div className="relative w-full max-w-6xl aspect-[16/9] bg-card-surface/50 rounded-3xl overflow-hidden shadow-2xl border border-border-primary/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedItem.id}
              className="w-full h-full relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MediaItem item={selectedItem} className="w-full h-full object-contain" onClick={onClose} />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-primary-text via-primary-text/40 to-transparent">
                <h3 className="text-primary-text text-2xl md:text-3xl font-headline font-bold uppercase tracking-tight">
                  {selectedItem.title}
                </h3>
                <p className="text-primary-text/60 text-sm md:text-base font-body mt-2 max-w-2xl">
                  {selectedItem.desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            className="absolute top-6 right-6 p-4 rounded-full bg-section-surface text-primary-text/40 hover:text-error hover:bg-card-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition border border-border-primary/10 active:scale-90 shadow-xl"
            onClick={onClose}
            aria-label="Close gallery"
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Floating Dock */}
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.1}
          initial={false}
          animate={{ x: dockPosition.x, y: dockPosition.y }}
          onDragEnd={(_, info) => {
            setDockPosition(prev => ({
              x: prev.x + info.offset.x,
              y: prev.y + info.offset.y
            }));
          }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[300] touch-none"
        >
          <motion.div
            className="relative rounded-[24px] bg-card-surface/40 backdrop-blur-3xl border border-border-primary/20 shadow-2xl p-2 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center -space-x-2 px-1">
              {mediaItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item);
                  }}
                  style={{
                    zIndex: selectedItem.id === item.id ? 50 : mediaItems.length - index,
                  }}
                  className={`
                    relative group
                    w-12 h-12 md:w-16 md:h-16 flex-shrink-0 
                    rounded-xl overflow-hidden 
                    cursor-pointer
                    ${selectedItem.id === item.id
                      ? 'ring-2 ring-accent-primary shadow-2xl scale-110'
                      : 'hover:ring-2 hover:ring-border-primary/30'}
                  `}
                  initial={{ rotate: index % 2 === 0 ? -10 : 10 }}
                  animate={{
                    scale: selectedItem.id === item.id ? 1.1 : 1,
                    rotate: selectedItem.id === item.id ? 0 : index % 2 === 0 ? -10 : 10,
                    y: selectedItem.id === item.id ? -12 : 0,
                  }}
                  whileHover={{
                    scale: 1.25,
                    rotate: 0,
                    y: -15,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                >
                  <MediaItem item={item} className="w-full h-full" onClick={() => setSelectedItem(item)} />
                  {selectedItem.id === item.id && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute -inset-2 bg-accent-primary/20 blur-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};

const getGapSize = (gap) => {
  switch (gap) {
    case 'small': return { grid: 'gap-2 md:gap-4', masonryCol: 'gap-2 md:gap-4', masonryItem: 'mb-2 md:mb-4' };
    case 'large': return { grid: 'gap-8 md:gap-12', masonryCol: 'gap-8 md:gap-12', masonryItem: 'mb-8 md:mb-12' };
    case 'medium':
    default: return { grid: 'gap-4 md:gap-6', masonryCol: 'gap-4 md:gap-6', masonryItem: 'mb-4 md:mb-6' };
  }
}

const getGridConfig = (layout, gap) => {
  const spacing = getGapSize(gap);
  switch (layout) {
    case 'grid':
      return {
        isMasonry: false,
        container: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${spacing.grid} auto-rows-[200px] md:auto-rows-[280px]`,
        getItemClass: () => "col-span-1 row-span-1"
      };
    case 'hero-strip':
      return {
        isMasonry: false,
        container: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${spacing.grid} auto-rows-[120px] md:auto-rows-[200px]`,
        getItemClass: (i) => i === 0 ? "col-span-full row-span-2 md:row-span-3" : "col-span-1 row-span-1"
      };
    case 'masonry':
      return {
        isMasonry: true,
        container: `columns-1 sm:columns-2 md:columns-3 lg:columns-4 ${spacing.masonryCol}`,
        getItemClass: () => `break-inside-avoid ${spacing.masonryItem} h-auto w-full inline-block`
      };
    case 'bento':
    default:
      const spans = [
        'md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2',
        'md:col-span-2 md:row-span-2 col-span-1 sm:col-span-2 sm:row-span-2',
        'md:col-span-1 md:row-span-3 sm:col-span-2 sm:row-span-2',
        'md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2',
        'md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2',
        'md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2',
      ];
      return {
        isMasonry: false,
        container: `grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 ${spacing.grid} auto-rows-[100px] md:auto-rows-[120px]`,
        getItemClass: (i) => spans[i % spans.length]
      };
  }
}

const ProjectGallery = ({ mediaItems, title, description, layout = 'bento', gap = 'medium' }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState(mediaItems);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setItems(mediaItems);
  }, [mediaItems]);

  const config = getGridConfig(layout, gap);

  return (
    <div className="w-full">
      <div className="mb-12 text-center">
        <motion.span
          className="font-label text-[10px] tracking-[0.4em] uppercase text-accent-primary mb-4 block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Visual Archive
        </motion.span>
        <motion.h2
          className="text-4xl md:text-5xl font-headline font-extrabold text-primary-text uppercase tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="mt-4 text-primary-text/60 font-body max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {description}
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {selectedItem ? (
          <GalleryModal
            key="modal"
            selectedItem={selectedItem}
            isOpen={true}
            onClose={() => setSelectedItem(null)}
            setSelectedItem={setSelectedItem}
            mediaItems={items}
          />
        ) : (
          <motion.div
            key="grid"
            className={config.container}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {items.map((item, index) => {
              const itemClass = config.getItemClass(index);
              return (
              <motion.div
                key={item.id}
                layoutId={`media-${item.id}`}
                className={`relative overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing border border-border-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${itemClass}`}
                onClick={() => !isDragging && setSelectedItem(item)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    !isDragging && setSelectedItem(item);
                  }
                }}
                variants={{
                  hidden: { y: 30, scale: 0.95, opacity: 0 },
                  visible: {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      delay: index * 0.05
                    }
                  }
                }}
                whileHover={{ scale: config.isMasonry ? 1.01 : 1.02 }}
                drag={!config.isMasonry}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(e, info) => {
                  setTimeout(() => setIsDragging(false), 50);
                  const moveDistance = Math.sqrt(Math.pow(info.offset.x, 2) + Math.pow(info.offset.y, 2));
                  if (moveDistance > 80) {
                    const newItems = [...items];
                    const draggedItem = newItems[index];
                    const targetIndex = (info.offset.x + info.offset.y) > 0 ?
                      Math.min(index + 1, items.length - 1) :
                      Math.max(index - 1, 0);
                    newItems.splice(index, 1);
                    newItems.splice(targetIndex, 0, draggedItem);
                    setItems(newItems);
                  }
                }}
              >
                <MediaItem
                  item={item}
                  className={`w-full ${config.isMasonry ? 'h-auto object-cover' : 'absolute inset-0 h-full object-cover'} transition-transform duration-700 group-hover:scale-110`}
                  onClick={() => !isDragging && setSelectedItem(item)}
                />
                
                <motion.div
                  className="absolute inset-0 flex flex-col justify-end p-6 group"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-text/90 via-primary-text/20 to-transparent pointer-events-none" />
                  <h3 className="relative text-primary-text text-sm font-headline font-bold uppercase tracking-wider line-clamp-1 pointer-events-none">
                    {item.title}
                  </h3>
                  <p className="relative text-primary-text/60 text-[10px] font-body mt-1 line-clamp-2 uppercase tracking-[0.1em] pointer-events-none">
                    {item.desc}
                  </p>
                </motion.div>
              </motion.div>
            )})}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectGallery;
