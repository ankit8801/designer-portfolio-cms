import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { loginAdmin, subscribeToAuthChanges, logoutAdmin } from '../firebase/services/authService'
import { fetchProjects, deleteProject } from '../firebase/services/projectService'
import { useNavigate } from 'react-router-dom'
import { fetchContacts } from '../firebase/services/contactService'
import { getSettings, updateSetting } from '../firebase/services/settingsService'
import { uploadFile } from '../firebase/services/storageService'
import { processImageForWeb } from '../utils/imageProcessor'
import ProjectModal from '../components/ProjectModal'
import ImageCropModal from '../components/ImageCropModal'

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [projects, setProjects] = useState([])
  const [contacts, setContacts] = useState([])
  const [currentTab, setCurrentTab] = useState('projects')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editProjectData, setEditProjectData] = useState(null)
  const [settings, setSettings] = useState({})
  const [uploadingSlot, setUploadingSlot] = useState(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [cropImage, setCropImage] = useState(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const navigate = useNavigate()
  const customEase = [0.16, 1, 0.3, 1]

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [projectData, contactData, settingsData] = await Promise.all([
          fetchProjects(),
          fetchContacts(),
          getSettings()
        ])
        setProjects(projectData)
        setContacts(contactData)
        setSettings(settingsData)
      } catch(err) {
        console.error("Error loading data", err)
      }
    }

    const unsubscribe = subscribeToAuthChanges((user) => {
      setIsLoggedIn(!!user)
      setIsAuthChecking(false)
      if (user) {
        loadInitialData()
      } else {
        // Defensive: Clear sensitive state on logout
        setProjects([])
        setContacts([])
        setSettings({})
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      if (email && password) {
        await loginAdmin(email, password)
      }
    } catch (error) {
      // Map error codes to user-friendly messages, but keep the code visible for diagnosis
      const errorMessage = error.code ? `${error.code}: ${error.message}` : 'Invalid credentials'
      setLoginError(errorMessage)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutAdmin()
      // Force navigation to home to clear the history stack and prevent back-button access
      navigate('/', { replace: true })
    } catch (error) {
      console.error(error)
    }
  }

  const handleProjectSuccess = async () => {
    try {
      const data = await fetchProjects()
      setProjects(data)
    } catch (err) {
      console.error("Failed to reload projects", err)
    }
  }

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id)
        const data = await fetchProjects()
        setProjects(data)
      } catch (err) {
        window.alert("Failed to delete: " + err.message)
      }
    }
  }

  const handleEditProject = (project, e) => {
    e.stopPropagation()
    setEditProjectData(project)
    setIsModalOpen(true)
  }

  const handleImageUpdate = (slot, e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setCropImage(reader.result)
      setUploadingSlot(slot)
      setIsCropModalOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropSave = async (blob) => {
    if (!uploadingSlot) return;
    if (!blob) {
      console.error("Upload aborted: No blob provided");
      return;
    }

    setIsCropModalOpen(false);

    try {
      // 1. Process image (no watermark for page assets)
      const processedBlob = await processImageForWeb(blob, { maxWidth: 1920, preserveDimensions: blob.preserveDimensions === true, watermark: { enabled: false } });

      // 2. Upload to Storage
      const path = `page_content/${Date.now()}_${uploadingSlot}.webp`;
      const imageUrl = await uploadFile(processedBlob, path);

      // 3. Update Firestore Settings
      await updateSetting(uploadingSlot, imageUrl);

      // 4. Update Local State
      setSettings(prev => ({ ...prev, [uploadingSlot]: imageUrl }));
      
    } catch (err) {
      console.error("Page Content Upload Error:", err);
      window.alert('Failed to update image: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingSlot(null);
      setCropImage(null);
    }
  };
  // Prevent visual flickers or "Back Button" leaks by showing nothing until auth is confirmed
  const bypassLoginForTesting = false; // Security: Ensure request.auth is populated in Firestore
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-page-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isLoggedIn && !bypassLoginForTesting) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-page-surface relative overflow-hidden">
        <Helmet>
          <title>Admin Login | Devendra Surve</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <div className="absolute top-0 right-0 w-1/2 h-full bg-section-surface -z-10 opacity-30" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-primary/5 rounded-full blur-[120px] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: customEase }}
          className="w-[90%] max-w-md bg-card-surface/40 backdrop-blur-2xl border border-border-primary/10 p-6 md:p-12 rounded-3xl shadow-2xl relative"
        >
          <div className="flex flex-col items-center mb-10 text-center">
            <span className="font-label text-[10px] tracking-[0.4em] uppercase text-accent-primary mb-4 block">Secure Portal</span>
            <h1 className="font-headline font-extrabold text-3xl tracking-tight text-primary-text uppercase leading-none">
              DEVENDRA SURVE
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-lg font-body text-sm text-center">
                {loginError}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="admin-email" className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Identity</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="[EMAIL_ADDRESS]"
                className="w-full bg-page-surface/50 border border-border-primary/20 rounded-xl p-4 font-body text-primary-text placeholder:text-primary-text/5 focus:border-accent-primary focus:outline-none transition-all"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Access Token</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-page-surface/50 border border-border-primary/20 rounded-xl p-4 font-body text-primary-text placeholder:text-primary-text/10 focus:border-accent-primary focus:outline-none transition-all tracking-widest"
                required
                autoComplete="current-password"
              />
            </div>
            <button
               type="submit"
               className="w-full bg-primary-text text-page-surface font-headline font-bold uppercase tracking-[0.2em] py-5 rounded-full hover:bg-accent-primary-primary hover:text-on-accent transition-all duration-500 shadow-xl mt-4 active:scale-95"
            >
              Authenticate
            </button>
          </form>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-page-surface flex">
      <Helmet>
        <title>Dashboard | Devendra Surve Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditProjectData(null); }} 
        onSuccess={handleProjectSuccess} 
        initialData={editProjectData}
      />

      <ImageCropModal 
        isOpen={isCropModalOpen}
        image={cropImage}
        onCancel={() => { setIsCropModalOpen(false); setUploadingSlot(null); setCropImage(null); }}
        onCropComplete={handleCropSave}
      />

      <aside className="w-20 md:w-64 border-r border-border-primary/10 flex flex-col bg-page-surface z-20">
        <div className="p-6 md:p-8 border-b border-border-primary/10 flex justify-center md:justify-start">
          <span className="font-headline font-black text-xl md:text-2xl tracking-tighter text-primary-text">DS.</span>
        </div>
        <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
          {[
            { id: 'projects', icon: 'palette', label: 'Projects' },
            { id: 'content', icon: 'auto_awesome', label: 'Page Content' },
            { id: 'inquiries', icon: 'mail', label: 'Inquiries' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center gap-4 p-3 md:px-4 rounded-xl transition-all group ${
                currentTab === item.id ? 'bg-accent-primary/10 text-accent-primary' : 'text-primary-text/40 hover:bg-primary-text/5 hover:text-primary-text'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {item.icon}
              </span>
              <span className="hidden md:block font-headline text-xs font-bold uppercase tracking-[0.1em]">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border-primary/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 md:px-4 text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="hidden md:block font-headline text-xs font-bold uppercase tracking-[0.1em]">Secure Exit</span>
          </button>
        </div>
      </aside>

      <section className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-20 border-b border-border-primary/10 flex flex-row items-center justify-between px-4 md:px-12 sticky top-0 bg-page-surface/80 backdrop-blur-md z-10">
          <h2 className="font-headline text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-primary-text/60">
            {currentTab === 'projects' ? 'Portfolio Management' : 
             currentTab === 'content' ? 'Global Page Content' : 'Inquiries Management'}
          </h2>
        </header>

        <div className="p-4 md:p-12 lg:p-16 max-w-7xl">
          {currentTab === 'projects' && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                <div>
                  <span className="font-label text-[10px] tracking-[0.3em] uppercase text-accent-primary mb-4 block">Dashboard</span>
                  <h1 className="font-headline font-extrabold text-3xl md:text-6xl tracking-tighter text-primary-text uppercase">Portfolio <span className="italic font-light">Management</span></h1>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-accent-primary text-on-accent px-8 py-4 rounded-full font-headline font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span> Add New Project
                </button>
              </div>

          <div className="bg-card-surface/30 border border-border-primary/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body min-w-[800px] md:min-w-0">
              <thead className="bg-primary-text/5">
                <tr>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40">Project Title</th>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40">Category</th>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40">Date</th>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 text-right">Visibility</th>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-primary-text/80">
                {projects.map((row) => (
                  <tr key={row.id} onClick={() => navigate(`/projects/${row.id}`)} className="hover:bg-primary-text/5 transition-colors group cursor-pointer">
                    <td className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-text/5 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {row.thumbnail ? <img src={row.thumbnail} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-secondary-text/50">palette</span>}
                      </div>
                      <span className="font-headline text-xs font-bold uppercase tracking-wider">{row.title}</span>
                    </td>
                    <td className="p-6 text-sm">{row.category || 'Design'}</td>
                    <td className="p-6 text-sm">
                      {row.createdAt?.seconds ? new Date(row.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-6 text-right">
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-accent-primary/30 text-accent-primary bg-accent-primary/5">
                        Published
                      </span>
                    </td>
                    <td className="p-6 text-right flex justify-end gap-2 items-center">
                       <button onClick={(e) => handleEditProject(row, e)} className="p-2 bg-primary-text/5 hover:bg-accent-primary-primary/20 rounded-lg text-primary-text/60 hover:text-accent-primary transition-colors flex items-center justify-center" title="Edit Project">
                         <span className="material-symbols-outlined text-[16px]">edit</span>
                       </button>
                       <button onClick={(e) => handleDeleteProject(row.id, e)} className="p-2 bg-primary-text/5 hover:bg-red-500/20 rounded-lg text-primary-text/60 hover:text-red-400 transition-colors flex items-center justify-center" title="Delete Project">
                         <span className="material-symbols-outlined text-[16px]">delete</span>
                       </button>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                   <tr>
                     <td colSpan="4" className="p-8 text-center text-primary-text/40 text-sm">
                        No projects found in the archive.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

        {currentTab === 'content' && (
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <span className="font-label text-[10px] tracking-[0.3em] uppercase text-accent-primary mb-4 block">Dashboard</span>
                <h1 className="font-headline font-extrabold text-3xl md:text-6xl tracking-tighter text-primary-text uppercase">Page <span className="italic font-light">Content</span></h1>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Home Page Section */}
              <div className="bg-card-surface/30 border border-border-primary/10 p-8 rounded-3xl space-y-8">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-accent-primary">home</span>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-primary-text">Home Page</h3>
                </div>
                <div className="space-y-4">
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 block">Featured Hero Project</label>
                  <select 
                    value={settings.heroFeaturedProjectId || ''}
                    onChange={async (e) => {
                      const id = e.target.value;
                      try {
                        await updateSetting('heroFeaturedProjectId', id);
                        setSettings(prev => ({ ...prev, heroFeaturedProjectId: id }));
                      } catch (err) {
                        window.alert('Failed to update: ' + err.message);
                      }
                    }}
                    className="w-full bg-page-surface/50 border border-border-primary/20 rounded-xl p-4 font-body text-primary-text focus:border-accent-primary focus:outline-none transition-all appearance-none"
                  >
                    <option value="">None (Show nothing)</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-4">
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 block">Hero Background Image</label>
                  <div className="relative group rounded-2xl overflow-hidden aspect-video bg-primary-text/5 border border-border-primary/10">
                    <img src={settings.homeHero || "/placeholder.webp"} className="w-full h-full object-cover opacity-50" alt="Home Hero" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <label className="cursor-pointer bg-accent-primary text-on-accent px-6 py-3 rounded-full font-headline font-bold text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                        {uploadingSlot === 'homeHero' ? <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">cloud_upload</span>}
                        Update Home Hero
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpdate('homeHero', e)} disabled={uploadingSlot === 'homeHero'} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Page Section */}
              <div className="bg-card-surface/30 border border-border-primary/10 p-8 rounded-3xl space-y-8">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-accent-primary">design_services</span>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-primary-text">Services Page</h3>
                </div>
                <div className="space-y-4">
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 block">Floating Model Image</label>
                  <div className="relative group rounded-2xl overflow-hidden aspect-video bg-primary-text/5 border border-border-primary/10">
                    <img src={settings.servicesModel || "/placeholder.webp"} className="w-full h-full object-contain opacity-50" alt="Services Model" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <label className="cursor-pointer bg-accent-primary text-on-accent px-6 py-3 rounded-full font-headline font-bold text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                        {uploadingSlot === 'servicesModel' ? <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">cloud_upload</span>}
                        Update Services Model
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpdate('servicesModel', e)} disabled={uploadingSlot === 'servicesModel'} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Page Portfolio */}
              <div className="bg-card-surface/30 border border-border-primary/10 p-8 rounded-3xl space-y-10 lg:col-span-2">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-accent-primary">person</span>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-primary-text">About Page Assets</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { id: 'aboutPortrait', label: 'Designer Portrait', default: "/placeholder.webp" },
                    { id: 'aboutPhilosophy', label: 'Process Detail', default: "/placeholder.webp" },
                    { id: 'aboutResilience', label: 'Creative Abstract', default: "/placeholder.webp" }
                  ].map(slot => (
                    <div key={slot.id} className="space-y-4">
                      <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 block">{slot.label}</label>
                      <div className="relative group rounded-2xl overflow-hidden aspect-[4/5] bg-primary-text/5 border border-border-primary/10">
                        <img src={settings[slot.id] || slot.default} className="w-full h-full object-cover opacity-50" alt={slot.label} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <label className="cursor-pointer bg-accent-primary text-on-accent p-3 rounded-full font-headline font-bold text-[8px] uppercase tracking-widest shadow-xl hover:scale-110 transition-all flex items-center justify-center">
                            {uploadingSlot === slot.id ? <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">cloud_upload</span>}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpdate(slot.id, e)} disabled={uploadingSlot === slot.id} />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Watermark Settings */}
              <div className="bg-card-surface/30 border border-border-primary/10 p-8 rounded-3xl space-y-8 lg:col-span-2">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-accent-primary">branding_watermark</span>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-primary-text">Watermark Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 block">Enable Watermark</label>
                    <button 
                      onClick={async () => {
                        const newVal = !settings.enableWatermark;
                        try {
                          await updateSetting('enableWatermark', newVal);
                          setSettings(prev => ({ ...prev, enableWatermark: newVal }));
                        } catch(e) {
                          console.error(e);
                        }
                      }}
                      className={`w-full p-4 rounded-xl border font-headline text-xs uppercase tracking-wider transition-all flex items-center gap-3 ${
                        settings.enableWatermark ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-border-primary/20 bg-page-surface/50 text-primary-text/40'
                      }`}>
                      <span className="material-symbols-outlined text-sm">{settings.enableWatermark ? 'toggle_on' : 'toggle_off'}</span>
                      {settings.enableWatermark ? 'Enabled' : 'Disabled'}
                    </button>
                    <p className="text-[10px] text-primary-text/40 mt-2">Applies to newly uploaded project images. Keeps your work safe from casual saving.</p>
                  </div>
                  <div className="space-y-4">
                    <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 block">Watermark Text</label>
                    <input 
                      type="text" 
                      value={settings.watermarkText !== undefined ? settings.watermarkText : '© Devendra Surve'} 
                      onChange={(e) => setSettings(prev => ({...prev, watermarkText: e.target.value}))}
                      onBlur={async (e) => await updateSetting('watermarkText', e.target.value)}
                      disabled={!settings.enableWatermark}
                      placeholder="© Devendra Surve"
                      className="w-full bg-page-surface/50 border border-border-primary/20 rounded-xl p-4 font-body text-primary-text focus:border-accent-primary focus:outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'inquiries' && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
              <div>
                <span className="font-label text-[10px] tracking-[0.3em] uppercase text-accent-primary mb-4 block">Dashboard</span>
                <h1 className="font-headline font-extrabold text-3xl md:text-6xl tracking-tighter text-primary-text uppercase">Direct <span className="italic font-light">Inquiries</span></h1>
              </div>
            </div>

          <div className="bg-card-surface/30 border border-border-primary/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body min-w-[800px] md:min-w-0">
              <thead className="bg-primary-text/5">
                <tr>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40">Sender</th>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40">Email</th>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40">Message</th>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-primary-text/80">
                {contacts.map((row) => (
                  <tr key={row.id} className="hover:bg-primary-text/5 transition-colors group">
                    <td className="p-6 font-headline text-xs font-bold uppercase tracking-wider">{row.name}</td>
                    <td className="p-6 text-sm text-accent-primary/80 hover:text-accent-primary transition-colors"><a href={`mailto:${row.email}`}>{row.email}</a></td>
                    <td className="p-6 text-sm max-w-sm"><p className="truncate" title={row.message}>{row.message}</p></td>
                    <td className="p-6 text-right text-sm text-primary-text/50">
                      {row.createdAt?.seconds ? new Date(row.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {contacts.length === 0 && (
                   <tr>
                     <td colSpan="4" className="p-8 text-center text-primary-text/40 text-sm">
                        No inquiries received.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
        </div>
      </section>
    </main>
  )
}
