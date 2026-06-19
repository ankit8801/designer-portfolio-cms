import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { fetchProjects } from '../firebase/services/projectService'
import { CardStack } from '../components/CardStack'

const ALL_LABEL = 'All Work'

export default function Gallery() {
  const customEase = [0.16, 1, 0.3, 1]
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(ALL_LABEL)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    fetchProjects()
      .then(data => { setProjects(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])


  // Build unique category list from live data
  const categories = useMemo(() => {
    const cats = [...new Set(projects.map(p => p.category).filter(Boolean))]
    return [ALL_LABEL, ...cats]
  }, [projects])

  const filtered = useMemo(() =>
    activeCategory === ALL_LABEL
      ? projects
      : projects.filter(p => p.category === activeCategory),
    [projects, activeCategory]
  )

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto">
      <Helmet>
        <title>Projects | Devendra Surve</title>
        <meta name="description" content="Explore a curated collection of design projects — brand identities, UI/UX, packaging, social media, and more." />
      </Helmet>

      {/* Header */}
      <header className="mb-16 md:mb-20 flex flex-col items-center text-center">
        <div className="mb-8 scroll-path" aria-hidden="true" />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="font-label text-[10px] uppercase tracking-[0.4em] text-accent-primary mb-4"
        >
          Portfolio
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: customEase }}
          className="font-headline font-extrabold text-[10vw] md:text-[6vw] leading-[0.9] tracking-tighter uppercase text-primary-text"
        >
          Selected <span className="italic font-light opacity-70">Works</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: customEase }}
          className="mt-6 max-w-xl text-primary-text/50 font-body text-lg leading-relaxed"
        >
          A curated collection of branding, interface, packaging, and visual storytelling projects.
        </motion.p>
      </header>

      {/* Category Filter Tabs */}
      {categories.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: customEase }}
          className="flex flex-wrap gap-2 justify-center mb-16"
          role="tablist"
          aria-label="Filter projects by category"
        >
          {categories.map(cat => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-5 py-2.5 rounded-full font-headline font-bold text-[10px] uppercase tracking-[0.15em] transition duration-300 border ${
                activeCategory === cat
                  ? 'bg-accent-primary text-on-accent border-accent-primary shadow-[0_0_20px_rgba(200,169,107,0.3)]'
                  : 'border-border-primary/20 text-primary-text/50 hover:border-border-primary/40 hover:text-primary-text bg-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 border-2 border-accent-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32"
        >
          <span className="material-symbols-outlined text-5xl text-accent-primary/20 mb-4 block">palette</span>
          <p className="font-body text-primary-text/40 text-lg">No projects in this category yet.</p>
        </motion.div>
      )}

      {/* Projects 3D Card Stack */}
      {!loading && filtered.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: customEase }}
          className="relative w-full py-12 flex justify-center overflow-visible"
        >
          <CardStack 
            items={filtered} 
            maxVisible={7}
            cardWidth={520}
            cardHeight={360}
            loop={true}
          />
        </motion.div>
      )}
    </main>
  )
}
