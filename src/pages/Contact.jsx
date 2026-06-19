import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { submitContactForm } from '../firebase/services/contactService'
import Dropdown from '../components/ui/dropdown-01'

const projectOptions = [
  { value: 'Brand Identity', label: 'Brand Identity',    description: 'Logo, colours & visual system' },
  { value: 'UI Design',      label: 'UI / UX Design',   description: 'Web & app interface design' },
  { value: 'Packaging',      label: 'Packaging Design',  description: 'Product & packaging visuals' },
  { value: 'Social Media',   label: 'Social Media',      description: 'Content & campaign design' },
  { value: 'Motion Design',  label: 'Motion Design',     description: 'Animation & video graphics' },
  { value: 'Other',          label: 'Other / Unsure',   description: 'Let\'s figure it out together' },
]

const contactInfo = [
  { icon: 'location_on', label: 'Studio',     detail: 'karjat, Maharashtra, India' },
  { icon: 'mail',        label: 'Email',      detail: 'dsurve415@gmail.com' },
  { icon: 'schedule',    label: 'Availability', detail: 'Open to projects for 2026' },
]

export default function Contact() {
  const customEase = [0.16, 1, 0.3, 1]
  const [formData, setFormData] = useState({ name: '', email: '', project: 'Brand Identity', message: '' })
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ state: 'submitting', message: '' })
    try {
      await submitContactForm(formData)
      setStatus({ state: 'success', message: 'Message sent! I\'ll be in touch very soon.' })
      setFormData({ name: '', email: '', project: 'Brand Identity', message: '' })
    } catch {
      setStatus({ state: 'error', message: 'Something went wrong. Please try again.' })
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  return (
    <main className="pt-40 pb-24 px-6 md:px-12 lg:px-24">
      <Helmet>
        <title>Contact | Devendra Surve</title>
        <meta name="description" content="Get in touch with Devendra Surve to discuss brand identity, UI design, packaging, social media, or any creative project." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-label text-[10px] tracking-[0.3em] uppercase text-accent-primary mb-4 block"
          >
            Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: customEase }}
            className="font-headline font-extrabold text-6xl md:text-8xl leading-[0.9] tracking-tighter uppercase text-primary-text"
          >
            LET'S CREATE <br />
            <span className="italic font-light text-accent-primary">SOMETHING GREAT</span>
          </motion.h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: customEase }}
            className="flex flex-col gap-12"
          >
            <p className="font-body text-xl md:text-2xl text-primary-text/60 leading-relaxed max-w-md">
              Whether you have a fully formed brief or just an idea — I'd love to hear it. Let's figure out the rest together.
            </p>

            <div className="flex flex-col gap-8">
              {contactInfo.map(info => (
                <div key={info.label} className="flex items-start gap-6 group">
                  <div className="w-12 h-12 rounded-full border border-border-primary/20 flex items-center justify-center text-accent-primary group-hover:bg-accent-primary-primary-primary group-hover:text-on-accent transition-all duration-300">
                    <span className="material-symbols-outlined">{info.icon}</span>
                  </div>
                  <div>
                    <span className="font-label text-[10px] tracking-[0.2em] uppercase text-accent-primary/60 block mb-1">{info.label}</span>
                    <p className="font-body text-lg text-primary-text">{info.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social links placeholder */}
            <div className="flex flex-wrap gap-4 pt-4">
              {[
                { name: 'Behance', url: '#' },
                { name: 'Dribbble', url: '#' },
                { name: 'Instagram', url: 'https://www.instagram.com/devendra__15_?igsh=MXhubTlwdmpzeHpseA==' },
                { name: 'LinkedIn', url: '#' }
              ].map(s => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-headline text-[9px] uppercase tracking-[0.2em] text-primary-text/70 hover:text-primary-text hover:border-border-primary/50 hover:bg-primary-text/5 transition-all border border-border-primary/20 px-4 py-2 rounded-full cursor-pointer"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: customEase }}
            className="bg-card-surface/40 backdrop-blur-xl border border-border-primary/10 p-8 md:p-12 rounded-2xl shadow-2xl flex flex-col gap-8 relative"
            onSubmit={handleSubmit}
          >
            {status.message && (
              <div className={`p-4 rounded-lg font-body text-sm ${
                status.state === 'success'
                  ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {status.message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Full Name</label>
                <input
                  id="name" type="text" value={formData.name} onChange={handleChange}
                  placeholder="Your name" required disabled={status.state === 'submitting'}
                  className="bg-page-surface/50 border border-border-primary/20 rounded-lg p-4 font-body text-primary-text placeholder:text-primary-text/10 focus:border-accent-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Email Address</label>
                <input
                  id="email" type="email" value={formData.email} onChange={handleChange}
                  placeholder="you@email.com" required disabled={status.state === 'submitting'}
                  className="bg-page-surface/50 border border-border-primary/20 rounded-lg p-4 font-body text-primary-text placeholder:text-primary-text/10 focus:border-accent-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <Dropdown
              id="project"
              label="Project Type"
              options={projectOptions}
              value={formData.project}
              onChange={value => setFormData(prev => ({ ...prev, project: value }))}
              disabled={status.state === 'submitting'}
            />

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Message</label>
              <textarea
                id="message" rows={4} value={formData.message} onChange={handleChange}
                placeholder="Tell me about your project, timeline, and what you're hoping to create…"
                required disabled={status.state === 'submitting'}
                className="bg-page-surface/50 border border-border-primary/20 rounded-lg p-4 font-body text-primary-text placeholder:text-primary-text/10 focus:border-accent-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(200, 169, 107, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={status.state === 'submitting'}
              className="bg-accent-primary text-on-accent font-headline font-bold uppercase tracking-[0.2em] py-5 rounded-full transition-all shadow-xl mt-4 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              aria-label="Send your message"
            >
              {status.state === 'submitting' ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" />
                  SENDING…
                </>
              ) : 'Send Message'}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </main>
  )
}
