import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../context/DarkModeContext';
import NotificationBell from '../notifications/NotificationBell';
import { Moon, Sun } from 'lucide-react';
import logo from '../../kaboditshaLogo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const getDashboardLink = () => {
    return '/dashboard'
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(user ? [
      { name: 'Dashboard', path: getDashboardLink() },
      ...(user.role === 'APPLICANT' ? [{ name: 'Apply', path: '/apply' }] : []),
      ...(user.role === 'MANAGER' ? [
        { name: 'Audit Trail', path: '/manager/audit' }
      ] : []),
      { name: 'Profile', path: '/profile' }
    ] : [])
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-[#8B4513]/20 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={logo} 
              alt="KaboDitsha Logo" 
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link dark:text-gray-300 dark:hover:text-white transition-colors ${isActive(link.path) ? 'nav-link-active dark:text-[#B45F3A]' : ''}`}
              >
                {link.name}
              </Link>
            ))}
            
            {user && <NotificationBell />}
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
            </button>
            
            {user ? (
              <button
                onClick={handleLogout}
                className="btn-secondary px-4 py-2 text-sm dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="nav-link dark:text-gray-300">Login</Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Dark Mode Toggle for Mobile */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
            </button>
            <button
              className="text-2xl text-[#2C1810] dark:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#8B4513]/20 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link px-2 dark:text-gray-300 ${isActive(link.path) ? 'nav-link-active dark:text-[#B45F3A]' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {user && (
                <div className="px-2 py-2">
                  <NotificationBell />
                </div>
              )}
              
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="btn-secondary w-full text-center dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Logout
                </button>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    to="/login"
                    className="nav-link px-2 dark:text-gray-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;