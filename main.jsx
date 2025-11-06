import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import App from './App.jsx'
import './styles/global.css'

// Initialize AOS
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true,
  mirror: false,
  offset: 100
})

AOS.init({
  duration: 800,           // Animation duration in milliseconds
  easing: 'ease-in-out',   // Easing function
  once: true,              // Whether animation should happen only once
  mirror: false,           // Whether elements should animate out while scrolling past them
  offset: 100              // Offset (in px) from the original trigger point
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)