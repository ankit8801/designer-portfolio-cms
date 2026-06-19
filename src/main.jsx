import React, { Profiler } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'

import { ThemeProvider } from './context/ThemeContext'

const onRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) => {
  if (window.logReactProfile) {
    window.logReactProfile(id, phase, actualDuration, baseDuration, startTime, commitTime, interactions);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Profiler id="AppRoot" onRender={onRenderCallback}>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </Profiler>
    </HelmetProvider>
  </React.StrictMode>,
)
