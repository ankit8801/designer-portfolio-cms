import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { getProjectById, getNextProject } from '../firebase/services/projectService'
import ProjectGallery from '../components/blocks/ProjectGallery'
import { ProtectedImage } from '../components/ui/ProtectedImage'

// ── Block renderers ────────────────────────────────────────────────────────────

function TextBlock({ block }) {
  return (
    <div className="max-w-3xl mx-auto">
      <p className="font-body text-xl md:text-2xl text-primary-text/80 leading-relaxed whitespace-pre-line">
        {block.content}
      </p>
    </div>
  )
}

function ImageBlock({ block }) {
  return (
    <div className="max-w-5xl mx-auto">
      <figure>
        <div className="w-full rounded-2xl overflow-hidden shadow-2xl">
          <ProtectedImage
            src={block.url}
            alt={block.caption || 'Project image'}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
        {block.caption && (
          <figcaption className="mt-4 text-center font-label text-[10px] uppercase tracking-[0.25em] text-primary-text/30">
            {block.caption}
          </figcaption>
        )}
      </figure>
    </div>
  )
}

function PhotoGridBlock({ block }) {
  if (!block.images?.length) return null
  if (block.images.length === 1) return <ImageBlock block={{ url: block.images[0].url, caption: block.images[0].caption }} />

  const mediaItems = block.images.map((img, i) => ({
    id: i + 1,
    type: 'image',
    title: img.caption || `View ${i + 1}`,
    desc: img.caption || '',
    url: img.url,
    width: img.width || 0,
    height: img.height || 0
  }))

  return (
    <div className="max-w-7xl mx-auto -mx-6 md:-mx-12">
      <ProjectGallery
        title=""
        description=""
        mediaItems={mediaItems}
        layout={block.layout || 'bento'}
        gap={block.gap || 'medium'}
      />
    </div>
  )
}

function VideoBlock({ block }) {
  return (
    <div className="max-w-5xl mx-auto">
      <figure>
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-surface-lowest">
          <iframe
            src={block.url}
            title={block.caption || 'Video'}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
        {block.caption && (
          <figcaption className="mt-4 text-center font-label text-[10px] uppercase tracking-[0.25em] text-primary-text/30">
            {block.caption}
          </figcaption>
        )}
      </figure>
    </div>
  )
}

function EmbedBlock({ block }) {
  return (
    <div className="max-w-5xl mx-auto">
      <figure>
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-surface-lowest border border-border-primary/10">
          <iframe
            src={block.url}
            title={block.caption || 'Embed'}
            className="w-full h-full border-none"
            loading="lazy"
          />
        </div>
        {block.caption && (
          <figcaption className="mt-4 text-center font-label text-[10px] uppercase tracking-[0.25em] text-primary-text/30">
            {block.caption}
          </figcaption>
        )}
      </figure>
    </div>
  )
}

function BlockRenderer({ block }) {
  switch (block.type) {
    case 'text':       return <TextBlock block={block} />
    case 'image':      return <ImageBlock block={block} />
    case 'photo_grid': return <PhotoGridBlock block={block} />
    case 'video':      return <VideoBlock block={block} />
    case 'embed':      return <EmbedBlock block={block} />
    default:           return null
  }
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ProjectDetails() {
  const { id } = useParams()
  const customEase = [0.16, 1, 0.3, 1]
  const [project, setProject] = useState(null)
  const [nextProject, setNextProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProjectById(id)
        setProject(data)

        // Fetch adjacent project for "Next Project" strip using targeted query
        if (data && data.createdAt) {
          const next = await getNextProject(data.createdAt)
          setNextProject(next)
        }
      } catch (err) {
        console.error('Failed to load project', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen pt-48 pb-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent-primary/20 border-t-accent rounded-full animate-spin" />
          <span className="font-headline font-bold uppercase tracking-widest text-primary-text/50 text-xs">Loading…</span>
        </div>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="min-h-screen pt-48 pb-24 px-8 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-5xl text-accent-primary/30 mb-6">search_off</span>
        <h1 className="font-headline font-extrabold text-4xl mb-4 text-primary-text uppercase">Project Not Found</h1>
        <p className="font-body text-primary-text/50 mb-8 max-w-md">This project doesn't exist in the current portfolio.</p>
        <Link to="/projects" className="px-8 py-3 rounded-full border border-accent-primary text-accent-primary font-headline text-xs tracking-widest hover:bg-accent-primary-primary hover:text-on-accent transition uppercase">
          Return to Projects
        </Link>
      </main>
    )
  }

  return (
    <main>
      <Helmet>
        <title>{`${project.title} | Devendra Surve`}</title>
        <meta name="description" content={`${project.title} — a ${project.category} project by Devendra Surve.`} />
        <meta property="og:title" content={`${project.title} | Devendra Surve`} />
        <meta property="og:description" content={`${project.title} — a ${project.category} project by Devendra Surve.`} />
        <meta property="og:image" content={project.thumbnail} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${project.title} | Devendra Surve`} />
        <meta name="twitter:description" content={`${project.title} — a ${project.category} project by Devendra Surve.`} />
        <meta name="twitter:image" content={project.thumbnail} />
        <link rel="canonical" href={`https://devendrasurve.com/projects/${project.id}`} />
      </Helmet>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <header className="relative pt-48 pb-24 px-6 md:px-12 overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-end justify-between gap-12">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <Link to="/projects" className="font-label text-[9px] uppercase tracking-[0.3em] text-primary-text/30 hover:text-accent-primary transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                Projects
              </Link>
              <span className="text-primary-text/20">·</span>
              <span className="category-pill">{project.category}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: customEase }}
              className="font-headline font-extrabold text-[10vw] md:text-[6vw] leading-[0.88] tracking-tight uppercase mb-6 text-primary-text"
            >
              {project.title.split(' ').map((word, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {i === 1 ? <span className="italic font-light opacity-75">{word}</span> : word}
                </span>
              ))}
            </motion.h1>
          </div>

          {/* Scroll indicator */}
          <div className="hidden lg:flex flex-col items-center gap-4 pb-4" aria-hidden="true">
            <span className="vertical-text font-label text-[9px] tracking-[0.3em] uppercase text-accent-primary/30">SCROLL TO EXPLORE</span>
            <div className="w-px h-24 bg-accent-primary/20 relative overflow-hidden">
              <motion.div
                animate={{ y: [0, 96, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 left-0 w-full h-1/2 bg-accent-primary"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── Cover Image ─────────────────────────────────────────────────────── */}
      {project.thumbnail && (
        <section className="px-0 md:px-8 mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: customEase }}
            className="relative w-full aspect-[21/9] md:rounded-2xl overflow-hidden group shadow-2xl"
          >
            <ProtectedImage
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
              src={project.thumbnail}
              alt={`Cover image for ${project.title}`}
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-page-surface/60 via-transparent to-transparent" />
          </motion.div>
        </section>
      )}

      {/* ── Content Blocks ───────────────────────────────────────────────────── */}
      {project.blocks && project.blocks.length > 0 && (
        <section className="px-6 md:px-12 space-y-20 mb-24">
          {project.blocks.map((block, idx) => {
            const isWide = block.type === 'photo_grid' || block.type === 'video' || block.type === 'embed'
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, ease: customEase }}
                className={isWide ? '-mx-6 md:-mx-12' : 'max-w-[1400px] mx-auto'}
              >
                <BlockRenderer block={block} />
              </motion.div>
            )
          })}
        </section>
      )}

      {/* ── Next Project CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 bg-section-surface border-t border-border-primary/10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="font-label text-[10px] uppercase tracking-[0.4em] text-accent-primary/50 mb-2 block">Continue Exploring</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-5xl uppercase tracking-tighter text-primary-text">
              Next Project
            </h2>
          </div>
          {nextProject ? (
            <Link
              to={`/projects/${nextProject.id}`}
              className="group flex items-center gap-6 bg-card-surface/50 border border-border-primary/10 rounded-2xl p-4 hover:border-accent-primary/20 transition duration-400 min-w-[280px]"
              aria-label={`View next project: ${nextProject.title}`}
            >
              {nextProject.thumbnail && (
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <ProtectedImage src={nextProject.thumbnail} alt={nextProject.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="category-pill text-[8px] mb-2 inline-block">{nextProject.category}</span>
                <p className="font-headline font-bold text-sm uppercase tracking-wide text-primary-text line-clamp-2">{nextProject.title}</p>
              </div>
              <span className="material-symbols-outlined text-accent-primary/30 group-hover:text-accent-primary-primary group-hover:translate-x-1 transition shrink-0">arrow_forward</span>
            </Link>
          ) : (
            <Link
              to="/projects"
              className="group flex items-center gap-3 font-headline text-[11px] uppercase tracking-[0.2em] text-accent-primary/60 hover:text-accent-primary transition-colors"
              aria-label="View all projects"
            >
              View All Projects
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          )}
        </div>
      </section>
    </main>
  )
}
