import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import React, { useState, useEffect } from 'react'
import { getSettings } from '../firebase/services/settingsService'
import { ProtectedImage } from '../components/ui/ProtectedImage'

const DEFAULT_MODEL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmLJLVr-u5vNVg6-5nELs24TrHcXnBR4dA_jA70oaCkN5povJEHW_iLFR6JvqhpCQZqa74snkvGEuBRyGFGptS7byLjSN4mwLcuaW3ua03qRmdCIrkW_KTZD2xWsEgWtoUVE0avhroUhdgjn_Si49kb1DiWVF6Z6tJ6zzQIpazT4_CTCfQsW4HHOTtWVQduvv1pndQjMFHTjWVWLWGfucRDm3NU7lXFjKPlOGORw-_vs1cqJNCa-YP5fg6Mzm4hI5dhvRvbrkIneHQ'

const stats = [
  { value: '50+', label: 'Projects Delivered' },
  { value: '8+',  label: 'Design Disciplines' },
  { value: '3+',  label: 'Years Experience' },
  { value: '∞',   label: 'Creative Drive' },
]

const SERVICES = [
  {
    icon: 'brand_awareness',
    title: 'Brand Identity',
    description: 'Complete brand systems — logo, colour, typography, and guidelines that give businesses a distinctive, cohesive visual voice.',
    category: 'Brand Identity',
  },
  {
    icon: 'devices',
    title: 'UI / UX Design',
    description: 'Intuitive, beautiful digital interfaces — from wireframes to high-fidelity prototypes — designed for real users.',
    category: 'UI Design',
  },
  {
    icon: 'inventory_2',
    title: 'Packaging Design',
    description: 'Packaging that commands shelf presence and communicates brand values at first glance.',
    category: 'Packaging',
  },
  {
    icon: 'smart_display',
    title: 'Social Media Design',
    description: 'Scroll-stopping visual content systems for social platforms, built for consistency and engagement.',
    category: 'Social Media',
  },
  {
    icon: 'animation',
    title: 'Motion Design',
    description: 'Animated logos, transitions, and storytelling sequences that bring brands to life.',
    category: 'Motion Design',
  },
  {
    icon: 'draw',
    title: 'Logo Systems',
    description: 'Versatile, timeless logo marks and full symbol suites that work across every medium.',
    category: 'Logo Design',
  },
]

export default function Services() {
  const customEase = [0.16, 1, 0.3, 1]
  const [modelImage, setModelImage] = useState(DEFAULT_MODEL)

  useEffect(() => {
    getSettings()
      .then(s => { if (s.servicesModel) setModelImage(s.servicesModel) })
      .catch(() => {})
  }, [])

  return (
    <main className="tonal-gradient flex-grow pt-32 pb-24">
      <Helmet>
        <title>Services | Devendra Surve</title>
        <meta name="description" content="Design services by Devendra Surve — brand identity, UI/UX, packaging, social media, motion design, and logo systems." />
      </Helmet>

      <section className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">

        {/* Top: Hero editorial */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-16 lg:gap-24 mb-32">
          {/* LEFT: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -40 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: customEase }}
            className="w-full md:w-1/2 relative group"
          >
            <div className="absolute -inset-4 bg-accent/5 blur-3xl rounded-full opacity-50" />
            <ProtectedImage
              alt="Creative workspace showcasing design tools and process"
              className="relative z-10 w-full h-auto object-contain mix-blend-lighten transform group-hover:scale-105 transition-transform duration-700 ease-out"
              src={modelImage}
              decoding="async"
            />
          </motion.div>

          {/* RIGHT: Copy */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: customEase }}
            className="w-full md:w-1/2 space-y-8"
          >
            <p className="font-headline text-[0.75rem] uppercase tracking-[0.3em] text-primary-text/60 font-medium">
              Full-spectrum design for brands that want to stand out.
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-headline font-light leading-[1.05] tracking-tight text-primary-text">
              From <span className="text-accent">concept</span> to{' '}
              <span className="text-green-accent">launch</span>, every pixel with purpose.
            </h1>
            <div className="flex items-center gap-6 pt-4">
              <Link to="/projects" className="flex items-center gap-4 group" aria-label="Explore design portfolio">
                <motion.span
                  whileHover={{ scale: 1.1, backgroundColor: 'var(--color-accent)' }}
                  className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-primary-text group-hover:text-on-accent transition-colors" aria-hidden="true">arrow_forward</span>
                </motion.span>
                <span className="font-headline uppercase tracking-[0.3em] text-[10px] font-extrabold text-primary-text group-hover:text-accent transition-colors">View Projects</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: customEase }}
          className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20 origin-left"
          aria-hidden="true"
        />

        {/* Stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-2 md:flex md:flex-row items-center justify-between gap-8 md:gap-4 mb-32"
        >
          {stats.map(stat => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: customEase } }
              }}
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              <span className="text-3xl md:text-5xl lg:text-6xl font-headline font-extrabold text-primary-text tracking-tighter">
                {stat.value}
              </span>
              <span className="font-headline uppercase tracking-[0.2em] text-[10px] text-primary-text/40 mt-3 font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Services Grid */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: customEase }}
            className="mb-12"
          >
            <span className="font-label text-[10px] uppercase tracking-[0.4em] text-accent mb-3 block">What I Offer</span>
            <h2 className="font-headline font-extrabold text-4xl md:text-5xl uppercase tracking-tighter text-primary-text">
              Services
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.7, ease: customEase }}
                className="group bg-card-bg/40 border border-white/5 rounded-2xl p-8 hover:border-accent/20 hover:bg-card-bg/70 transition-all duration-400 flex flex-col gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <span className="material-symbols-outlined text-accent text-xl">{service.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-headline font-bold text-lg uppercase tracking-wide text-primary-text mb-3">{service.title}</h3>
                  <p className="font-body text-sm text-primary-text/50 leading-relaxed">{service.description}</p>
                </div>
                <Link
                  to={`/projects?category=${encodeURIComponent(service.category)}`}
                  className="font-label text-[9px] uppercase tracking-[0.2em] text-accent/40 group-hover:text-accent transition-colors flex items-center gap-2"
                  aria-label={`View ${service.title} projects`}
                >
                  View Work <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: customEase }}
          className="text-center py-16 border-t border-white/5"
        >
          <p className="font-body text-xl text-primary-text/50 mb-8">Have a project in mind?</p>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-4 bg-accent text-on-accent px-10 py-5 rounded-full font-headline font-bold uppercase tracking-[0.15em] shadow-2xl hover:scale-105 hover:shadow-[0_0_30px_rgba(200,169,107,0.4)] transition-all duration-300"
            aria-label="Get in touch to discuss your project"
          >
            Let's Work Together
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
