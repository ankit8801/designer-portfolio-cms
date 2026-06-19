import React, { useState, useEffect, memo, Profiler } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeSwitcher } from './ui/ThemeSwitcher'
import { useTheme } from '../context/ThemeContext'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Services', path: '/services' },
  { label: 'About', path: '/about' },
]

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    document.body.style.overflow = ''
  }, [location.pathname])



  const toggleMobile = () => {
    setMobileOpen(prev => {
      document.body.style.overflow = !prev ? 'hidden' : ''
      return !prev
    })
  }

  const themes = [
    { id: 'light', icon: 'light_mode', label: 'Light' },
    { id: 'dark', icon: 'dark_mode', label: 'Dark' },
    { id: 'system', icon: 'desktop_windows', label: 'System' },
  ]

  const onRenderCallback = (id, phase, actualDuration) => {
    if (window.logReactProfile) window.logReactProfile(id, phase, actualDuration, 0, 0, 0, []);
  };

  return (
    <>
      <Profiler id="NavbarRoot" onRender={onRenderCallback}>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 w-full z-[60] transition-colors duration-300 border-b ${scrolled ? 'bg-page-surface/90 backdrop-blur-xl border-border-primary/10' : 'bg-page-surface/40 backdrop-blur-none border-transparent'}`}
      >
        <div className="flex justify-between items-center w-full px-6 md:px-12 py-4 md:py-6 max-w-[1920px] mx-auto">
          <Link to="/" className="text-xl md:text-2xl font-bold tracking-[0.1em] text-primary-text font-headline" aria-label="Devendra Surve Home">
            Devendra Surve
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12 font-headline tracking-[0.05em] uppercase text-sm font-medium">
            {navLinks.map(link => (
              <motion.div key={link.path} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link
                  to={link.path}
                  className={`transition-colors duration-300 ${
                    location.pathname === link.path
                      ? 'text-accent-primary border-b border-accent-primary pb-1'
                      : 'text-primary-text hover:text-accent-primary'
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <ThemeSwitcher />

            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(200, 169, 107, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/contact"
                className="bg-accent-primary text-on-accent px-6 md:px-8 py-2 md:py-3 rounded-full font-headline text-xs md:text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-[filter] duration-200 shadow-lg inline-block"
              >
                Hire Me
              </Link>
            </motion.div>
          </div>

        </div>
      </motion.nav>
      </Profiler>

      {/* Mobile Hamburger */}
      <div className={`md:hidden fixed top-4 right-6 z-[100] flex items-center justify-center ${mobileOpen ? 'bg-primary-text/40' : 'bg-primary-text/60'} backdrop-blur-md rounded-full p-1 border border-accent-primary/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-[background-color] duration-200`}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center p-2 text-page-surface hover:text-accent-primary transition-colors active:scale-95 duration-200"
          onClick={toggleMobile}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          <span className="material-symbols-outlined text-3xl">{mobileOpen ? 'close' : 'menu'}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] flex flex-col pointer-events-auto bg-page-surface/90 backdrop-blur-xl pt-24 pb-8 px-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-6 font-headline tracking-widest text-xl font-medium uppercase mb-12">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                >
                  <Link
                    to={link.path}
                    className={`block transition-colors duration-200 border-b border-border-primary/10 pb-4 ${
                      location.pathname === link.path
                        ? 'text-accent-primary'
                        : 'text-primary-text hover:text-accent-primary'
                    }`}
                    onClick={toggleMobile}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile Theme Selection */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mt-auto mb-8"
            >
              <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-secondary-text mb-4">Appearance</h3>
              <div className="flex flex-col gap-1 bg-section-surface rounded-2xl p-2 border border-border-primary/10">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-colors ${
                      theme === t.id ? 'bg-page-surface text-primary-text shadow-sm' : 'text-primary-text/60 hover:text-primary-text hover:bg-page-surface/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 font-headline text-sm uppercase tracking-widest">
                      <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                      {t.label}
                    </div>
                    {theme === t.id && <span className="material-symbols-outlined text-[16px] text-accent-primary">check</span>}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="w-full"
            >
              <Link
                to="/contact"
                className="block text-center w-full bg-accent-primary text-on-accent px-12 py-4 rounded-full font-headline text-sm font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-[filter,transform] duration-200 shadow-xl"
                onClick={toggleMobile}
              >
                Hire Me
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default memo(Navbar)
