import { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import {Link} from 'react-router-dom';

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="z-50 sticky top-0 w-full backdrop-blur shadow-2xl-md text-text border-b border-[rgb(var(--color-border))]  shadow-sm">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link to="/"><div className="text-2xl hover:drop-shadow-[0_0_0.75rem_#9333ea] cursor-pointer font-bold">VidMeet</div></Link>
        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center font-medium">
          <li><Link to="/#hero" className="hover:text-[rgb(var(--color-primary))] transition">Home</Link></li>
          <li><Link to="/#feature" className="hover:text-[rgb(var(--color-primary))] transition">Features</Link></li>
          <li><Link to="/#about" className="hover:text-[rgb(var(--color-primary))] transition">About</Link></li>
          <li>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </li>
          <li>
            <Link to="/Vidmeet"><button className="btn btn-primary">Join Meeting</button></Link>
          </li>
        </ul>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center space-x-3">
          <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={toggleMenu} className="theme-toggle">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul className="md:hidden px-6 pb-4 space-y-3 font-medium">
          <li onClick={toggleMenu} ><Link to="/#hero" className="block hover:text-[rgb(var(--color-primary))]">Home</Link></li>
          <li onClick={toggleMenu}><Link to="/#feature" className="block hover:text-[rgb(var(--color-primary))]">Features</Link></li>
          <li onClick={toggleMenu}><Link to="/#about" className="block hover:text-[rgb(var(--color-primary))]">About</Link></li>
          <li onClick={toggleMenu}><Link to="/Vidmeet"><button className="btn btn-primary w-full">Join Meeting</button></Link></li>
        </ul>
      )}
    </header>
  );
}
