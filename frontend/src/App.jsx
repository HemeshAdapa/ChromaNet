import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { GitBranch, Palette, Sun, Moon } from 'lucide-react';
import Home from './pages/Home';
import About from './pages/About';
import Upload from './pages/Upload';
import Result from './pages/Result';
import Gallery from './pages/Gallery';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <nav className="navbar">
        <div className="flex items-center gap-2">
          <Palette color="#a78bfa" size={32} />
          <span className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>ChromaNet</span>
        </div>
        
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>About</NavLink>
          <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Colorize</NavLink>
          <NavLink to="/gallery" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Gallery</NavLink>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }} 
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <a href="https://github.com/placeholder" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', borderRadius: '8px', color: 'var(--text-primary)' }}>
            <GitBranch size={18} /> GitHub
          </a>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/result" element={<Result />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </div>

      <footer>
        <p>© {new Date().getFullYear()} ChromaNet Project - Deep Learning Based Image Colorization using AutoEncoder and GAN.</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Developed for Final Year Project.</p>
      </footer>
    </Router>
  );
}

export default App;
