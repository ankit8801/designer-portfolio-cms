import { Helmet } from 'react-helmet-async'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getSettings } from '../firebase/services/settingsService'
import { ProtectedImage } from '../components/ui/ProtectedImage'

const DEFAULTS = {
  portrait:   '/placeholder.webp',
  philosophy: '/placeholder.webp',
  resilience: '/placeholder.webp',
}

export default function About() {
  const customEase = [0.16, 1, 0.3, 1]
  const [images, setImages] = useState(DEFAULTS)

  useEffect(() => {
    getSettings().then(settings => {
      setImages({
        portrait:   settings.aboutPortrait   || DEFAULTS.portrait,
        philosophy: settings.aboutPhilosophy || DEFAULTS.philosophy,
        resilience: settings.aboutResilience || DEFAULTS.resilience,
      })
    }).catch(() => {})
  }, [])

  return (
    <>
      <Helmet>
        <title>About | Devendra Surve — graphic designer</title>
        <meta name="description" content="Meet Devendra Surve, creative director and designer" />
      </Helmet>

      {/* ── SECTION 1: Designer Introduction ───────────────────────────────── */}
      <main className="min-h-screen pt-40 pb-24 px-8 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">

          {/* LEFT: Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -40 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: customEase }}
            className="relative group"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl transition-transform duration-700 hover:scale-[1.02]">
              <ProtectedImage
                alt="Portrait of Devendra Surve, The Designer

Devendra Surve is an emerging graphic designer currently pursuing his fourth year of study, passionate about transforming ideas into compelling visual experiences. His creative practice spans branding, digital design, social media creatives, and visual identity systems, always guided by a strong sense of clarity and purpose.

To Devendra, design is the intersection of creativity and communication. Every project is approached with curiosity, strategic thinking, and attention to detail—ensuring that each visual not only looks striking but also tells a meaningful story. Through thoughtful design, he aims to create experiences that resonate, inspire, and leave a lasting impression."
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-1000"
                src={images.portrait}
                decoding="async"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent-primary/5 rounded-full blur-[100px] -z-10" />
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute -right-6 top-12 bg-card-surface/90 backdrop-blur-xl border border-border-primary/20 rounded-2xl p-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent-primary text-[16px]">palette</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-[10px] uppercase tracking-wide text-primary-text">Designer</p>
                  <p className="font-label text-[8px] uppercase tracking-wider text-primary-text/40">& Creative Director</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: Editorial Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: customEase }}
            className="flex flex-col space-y-12"
          >
            <div className="space-y-6">
              <span className="text-[0.75rem] uppercase tracking-[0.3em] text-accent-primary font-bold block font-headline">_______________</span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-primary-text leading-[1.05] font-headline uppercase">
                The <span className="italic text-primary-text">Designer</span>
              </h1>
            </div>

            <div className="space-y-6 max-w-xl">
              <p className="text-lg md:text-xl leading-relaxed text-primary-text/70 font-light font-body">
                The Designer

Devendra Surve is an emerging graphic designer currently pursuing his fourth year of study, passionate about transforming ideas into compelling visual experiences. His creative practice spans branding, digital design, social media creatives, and visual identity systems, always guided by a strong sense of clarity and purpose.


              </p>
              <p className="text-lg md:text-xl leading-relaxed text-primary-text/70 font-light font-body">
                To Devendra, design is the intersection of creativity and communication. Every project is approached with curiosity, strategic thinking, and attention to detail—ensuring that each visual not only looks striking but also tells a meaningful story. Through thoughtful design, he aims to create experiences that resonate, inspire, and leave a lasting impression.
              </p>
            </div>

            {/* Disciplines list */}
            <div className="grid grid-cols-2 gap-3">
              {['Brand Identity', 'UI / UX Design', 'Packaging Design', 'Logo Systems', 'Social Media', 'Motion Design'].map(d => (
                <div key={d} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-accent-primary" aria-hidden="true" />
                  <span className="font-label text-[10px] uppercase tracking-[0.15em] text-primary-text/50">{d}</span>
                </div>
              ))}
            </div>

            {/* Signature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="pt-8 border-t border-border-primary/20 flex flex-col space-y-2"
            >
              <span className="signature-font text-5xl text-primary-text opacity-90 select-none">Devendra Surve</span>
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-primary-text/40 font-headline font-bold">
                Graphic Designer
              </span>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* ── SECTION 2: Design Philosophy ───────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-24 py-12 bg-section-surface text-primary-text">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: customEase }}
          className="max-w-7xl mx-auto grid grid-cols-12 gap-8 items-center"
        >
          <div className="col-span-12 lg:col-span-7 h-[400px] lg:h-[500px] overflow-hidden rounded-2xl shadow-xl bg-section-surface">
            <ProtectedImage
              alt="A detail shot illustrating the design philosophy — precision, craft, and visual rhythm"
              className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-700"
              src={images.philosophy}
              loading="lazy"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="col-span-12 lg:col-span-5 flex flex-col space-y-6 lg:pl-12"
          >
            <h3 className="text-2xl lg:text-3xl font-bold tracking-tight font-headline text-primary-text">
              01. Design Philosophy
            </h3>
            <p className="max-w-md font-body text-lg leading-relaxed text-secondary-text">
              Design begins with understanding — not just the brief, but the emotion behind it. Every project is an exercise in restraint: knowing what to include, what to strip away, and how to make what remains feel inevitable.
            </p>
            <div className="w-12 h-1 bg-accent-primary/30" aria-hidden="true" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── SECTION 3: Process & Craft ──────────────────────────────────────── */}
      <section className="px-8 md:px-12 lg:px-24 py-24 bg-section-surface">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: customEase }}
          className="max-w-7xl mx-auto grid grid-cols-12 gap-8 items-center"
        >
          <div className="col-span-12 lg:col-span-7 h-[500px] overflow-hidden rounded-2xl shadow-xl">
            <ProtectedImage
              alt="A creative studio detail representing process, iteration, and craft"
              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
              src={images.resilience}
              loading="lazy"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="col-span-12 lg:col-span-5 flex flex-col space-y-6 lg:pl-12"
          >
            <h3 className="text-3xl font-bold tracking-tight text-primary-text font-headline uppercase italic">
              02. Process &amp; Craft
            </h3>
            <p className="text-primary-text/60 max-w-md font-body text-lg leading-relaxed">
              Every great design is the result of relentless iteration. From rough sketches to refined systems, the process is where the real work happens — testing, questioning, and refining until the solution feels not just correct, but right.
            </p>
            <div className="w-12 h-1 bg-accent-primary/30" aria-hidden="true" />
            <Link
              to="/projects"
              className="group flex items-center gap-3 font-headline text-[10px] uppercase tracking-[0.2em] text-accent-primary/60 hover:text-accent-primary transition-colors w-fit"
              aria-label="View portfolio"
            >
              View Portfolio
              <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  )
}
