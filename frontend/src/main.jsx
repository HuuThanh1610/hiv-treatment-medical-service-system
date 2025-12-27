/**
 * main.jsx - Entry point của React application
 *
 * Chức năng:
 * - Bootstrap React app với createRoot
 * - StrictMode cho development warnings
 * - Import global CSS styles
 * - Render App component vào DOM
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // Global CSS styles
import App from './App.jsx'  // Main App component

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
