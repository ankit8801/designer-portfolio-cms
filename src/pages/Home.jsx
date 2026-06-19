import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import React, { useState, useEffect, useRef } from 'react'
import { fetchProjects } from '../firebase/services/projectService'
import { getSettings } from '../firebase/services/settingsService'
import { ProtectedImage } from '../components/ui/ProtectedImage'

const DISCIPLINES = [
  'Brand Identity', 'UI/UX Design', 'Packaging', 'Logo Systems',
  'Social Media', 'Motion Design', 'Illustration', 'Print Design',
]

export default function Home() {
  const customEase = [0.16, 1, 0.3, 1]
  const [allProjects, setAllProjects] = useState([])
  const [featuredProjects, setFeaturedProjects] = useState([])
  const [settings, setSettings] = useState({})
  const heroRef = useRef(null)

  // Mouse-follow glow
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const glowX = useSpring(mouseX, { stiffness: 80, damping: 20 })
  const glowY = useSpring(mouseY, { stiffness: 80, damping: 20 })

  useEffect(() => {
    const handleMouse = (e) => {
      mouseX.set(e.clientX - 200)
      mouseY.set(e.clientY - 200)
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [mouseX, mouseY])

  useEffect(() => {
    fetchProjects()
      .then(data => {
        setAllProjects(data)
        setFeaturedProjects(data.slice(0, 4))
      })
      .catch(() => {})
      
    getSettings()
      .then(data => setSettings(data))
      .catch(() => {})
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: customEase } }
  }

  const heroProject = settings?.heroFeaturedProjectId ? allProjects.find(p => p.id === settings.heroFeaturedProjectId) : null;

  return (
    <main className="relative overflow-hidden">
      <Helmet>
        <title>Devendra Surve | graphic designer</title>
        <meta name="description" content="Devendra Surve is a graphic designer crafting compelling brand identities, UI/UX experiences, packaging, and visual systems." />
        <meta property="og:title" content="Devendra Surve | graphic designer" />
        <meta property="og:description" content="Devendra Surve is a graphic designer crafting compelling brand identities, UI/UX experiences, packaging, and visual systems." />
        <meta property="og:image" content={settings?.homeHero || "https://devendrasurve.com/default-og-image.jpg"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Devendra Surve | graphic designer" />
        <meta name="twitter:description" content="Devendra Surve is a graphic designer crafting compelling brand identities, UI/UX experiences, packaging, and visual systems." />
        <meta name="twitter:image" content={settings?.homeHero || "https://devendrasurve.com/default-og-image.jpg"} />
      </Helmet>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Ambient background gradient blobs & uploaded image */}
        <div className="absolute inset-0 -z-10 bg-page-surface">
          {settings?.homeHero && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <ProtectedImage 
                src={settings.homeHero} 
                alt="" 
                loading="eager"
                fetchpriority="high"
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-page-surface via-page-surface/80 to-transparent transition-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-page-surface via-page-surface/50 to-transparent transition-none" />
            </motion.div>
          )}
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-bl from-section-surface to-transparent opacity-60 transition-none" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-gradient-to-tr from-accent-primary/5 to-transparent transition-none" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(200,169,126,0.1)_0%,transparent_70%)] transition-none" />
          <div className="grid-bg absolute inset-0 opacity-40 transition-none" />
        </div>

        {/* Mouse-follow glow */}
        <motion.div
          className="pointer-events-none fixed w-[400px] h-[400px] rounded-full -z-10"
          style={{
            x: glowX,
            y: glowY,
            background: 'radial-gradient(circle, rgba(200,169,107,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Hero content */}
        <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 pt-32 pb-24 flex flex-col lg:flex-row items-center gap-16 lg:gap-0">
          {/* Left: Typography */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 flex flex-col items-start z-10"
          >
            {/* Eyebrow */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-accent-primary" aria-hidden="true" />
              <span className="font-label text-[10px] tracking-[0.4em] uppercase text-accent-primary">Creative Design Studio</span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              variants={itemVariants}
              className="font-headline font-extrabold text-[13vw] sm:text-[10vw] lg:text-[7.5vw] xl:text-[112px] leading-[0.85] tracking-tight uppercase text-primary-text mb-6"
            >
              Design<br />
              <span className="text-primary-text italic font-bold">That</span><br />
              Speaks
            </motion.h1>

            {/* Discipline pill tags */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-10 max-w-md">
              {DISCIPLINES.map((d, i) => (
                <motion.span
                  key={d}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.06, duration: 0.5, ease: customEase }}
                  className="category-pill"
                >
                  {d}
                </motion.span>
              ))}
            </motion.div>

            {/* Subtext */}
            <motion.p variants={itemVariants} className="font-body text-base md:text-lg text-primary-text/60 max-w-sm leading-relaxed mb-10">
              Crafting brands, interfaces, and visual systems that connect, convert, and captivate.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex items-center gap-4 flex-wrap">
              <Link
                to="/projects"
                className="group flex items-center gap-3 bg-accent-primary text-on-accent px-8 py-4 rounded-full font-headline font-bold uppercase tracking-[0.1em] shadow-2xl hover:scale-105 hover:shadow-[0_0_30px_rgba(200,169,107,0.4)] transition duration-300"
                aria-label="View design portfolio"
              >
                View My Work
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link
                to="/contact"
                className="group flex items-center gap-3 border border-border-primary/30 text-primary-text/70 hover:text-primary-text hover:border-border-primary/50 px-8 py-4 rounded-full font-headline font-bold uppercase tracking-[0.1em] transition duration-300"
                aria-label="Get in touch for collaboration"
              >
                Let's Collaborate
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Floating design composition */}
          <div className="relative flex-1 flex items-center justify-center min-h-[400px] lg:min-h-[600px]">
            {/* Decorative floating shapes */}
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 right-12 w-32 h-32 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 border border-accent-primary/20"
              aria-hidden="true"
            />
            <motion.div
              animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-12 left-8 w-24 h-24 rounded-full bg-gradient-to-br from-primary-text/5 to-transparent border border-border-primary/20"
              aria-hidden="true"
            />
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-1/2 right-4 w-4 h-16 bg-accent-primary/30 rounded-full"
              aria-hidden="true"
            />

            {/* Responsive Hero Project Showcase */}
            {heroProject && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: customEase }}
                className="relative flex-1 w-full max-w-lg aspect-square sm:aspect-[4/5] lg:aspect-auto lg:h-[600px] flex items-center justify-center mt-8 lg:mt-0"
              >
                <Link
                  to={`/projects/${heroProject.id}`}
                  className="group relative block w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-border-primary/20"
                >
                  {heroProject.thumbnail ? (
                    <ProtectedImage src={heroProject.thumbnail} alt={heroProject.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-card-surface to-surface-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-accent-primary/20">palette</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-text/80 via-primary-text/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="category-pill self-start mb-3">{heroProject.category}</span>
                    <h3 className="font-headline font-bold text-3xl text-primary-text uppercase tracking-wider mb-2">{heroProject.title}</h3>
                    <div className="flex items-center gap-2 text-secondary-text group-hover:text-accent-primary-primary transition-colors">
                      <span className="font-label text-xs uppercase tracking-wider">View Case Study</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          aria-hidden="true"
        >
          <div className="w-[1px] h-20 bg-accent-primary/20 relative overflow-hidden">
            <motion.div
              animate={{ y: [0, 80, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 left-0 w-full h-1/2 bg-accent-primary"
            />
          </div>
          <span className="font-label text-[9px] uppercase tracking-[0.3em] text-accent-primary/40">Scroll</span>
        </motion.div>
      </section>

      {/* ── FEATURED PROJECTS STRIP ───────────────────────────────────────── */}
      {featuredProjects.length > 0 && (
        <section className="py-32 px-6 md:px-12 bg-section-surface">
          <div className="max-w-[1400px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: customEase }}
              className="flex items-end justify-between mb-16"
            >
              <div>
                <span className="font-label text-[10px] tracking-[0.4em] uppercase text-accent-primary mb-4 block">Portfolio</span>
                <h2 className="font-headline font-extrabold text-4xl md:text-6xl uppercase tracking-tighter text-primary-text">
                  Selected <span className="italic font-light opacity-70">Works</span>
                </h2>
              </div>
              <Link
                to="/projects"
                className="hidden md:flex items-center gap-3 font-headline text-[10px] uppercase tracking-[0.2em] text-accent-primary/60 hover:text-accent-primary transition-colors"
                aria-label="View all projects"
              >
                View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: customEase }}
                >
                  <Link
                    to={`/projects/${project.id}`}
                    className="block group relative aspect-[4/5] rounded-2xl overflow-hidden bg-card-surface border border-border-primary/10 shadow-xl"
                    aria-label={`View project: ${project.title}`}
                  >
                    {project.thumbnail ? (
                      <ProtectedImage src={project.thumbnail} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-card-surface to-surface-high flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-accent-primary/20">palette</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-text/80 via-primary-text/20 to-transparent gallery-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition duration-300 translate-y-2 group-hover:translate-y-0">
                      <span className="category-pill self-start">{project.category}</span>
                      <div>
                        <h3 className="font-headline font-bold text-sm text-primary-text uppercase tracking-wider mb-2">{project.title}</h3>
                        <div className="flex items-center gap-2 text-secondary-text">
                          <span className="font-label text-[9px] uppercase tracking-wider">View Case Study</span>
                          <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 flex justify-center md:hidden">
              <Link to="/projects" className="flex items-center gap-3 font-headline text-[10px] uppercase tracking-[0.3em] text-accent-primary border border-accent-primary/30 px-8 py-4 rounded-full hover:bg-accent-primary-primary hover:text-on-accent transition duration-300">
                View All Projects <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── DISCIPLINES STRIP ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 bg-page-surface border-t border-border-primary/10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: customEase }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center"
          >
            {/* Left: Headline */}
            <div className="md:col-span-1">
              <span className="font-label text-[10px] tracking-[0.4em] uppercase text-accent-primary mb-4 block">What I Do</span>
              <h2 className="font-headline font-extrabold text-4xl md:text-5xl uppercase tracking-tighter text-primary-text leading-tight">
                Full<br /><span className="italic font-light opacity-60">spectrum</span><br />design.
              </h2>
            </div>
            {/* Right: Discipline grid */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: 'brand_awareness', label: 'Brand Identity' },
                { icon: 'devices',         label: 'UI / UX Design' },
                { icon: 'inventory_2',     label: 'Packaging' },
                { icon: 'smart_display',   label: 'Social Media' },
                { icon: 'animation',       label: 'Motion Design' },
                { icon: 'draw',            label: 'Illustration' },
                { icon: 'text_fields',     label: 'Typography' },
                { icon: 'print',           label: 'Print Design' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.6, ease: customEase }}
                  className="bg-card-surface/50 border border-border-primary/10 rounded-2xl p-5 flex flex-col items-start gap-3 group hover:border-accent-primary/30 hover:bg-card-surface transition duration-300"
                >
                  <span className="material-symbols-outlined text-accent-primary/60 group-hover:text-accent-primary-primary transition-colors text-xl">{item.icon}</span>
                  <span className="font-headline font-bold text-xs uppercase tracking-wide text-primary-text/70 group-hover:text-primary-text transition-colors">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 md:px-12 bg-section-surface">
        <div className="max-w-[1400px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: customEase }}
          >
            <span className="font-label text-[10px] tracking-[0.4em] uppercase text-accent-primary mb-6 block">Ready to create?</span>
            <h2 className="font-headline font-extrabold text-[8vw] md:text-[5vw] lg:text-[72px] uppercase tracking-tighter text-primary-text leading-[0.9] mb-12">
              Let's Build<br /><span className="text-primary-text italic font-bold">Something Great</span>
            </h2>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-4 bg-accent-primary text-on-accent px-12 py-5 rounded-full font-headline font-bold uppercase tracking-[0.15em] shadow-2xl hover:scale-105 hover:shadow-[0_0_40px_rgba(200,169,107,0.4)] transition duration-300"
              aria-label="Contact to start a project"
            >
              Start a Project
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
