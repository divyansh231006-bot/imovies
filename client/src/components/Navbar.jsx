import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film,
  Search,
  Ticket,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  ChevronDown,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'Theatres', path: '/theatres' },
    { name: 'My Bookings', path: '/my-bookings', requiresAuth: true }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#080B11]/95 backdrop-blur-md border-b border-gray-800/80 shadow-2xl py-3'
          : 'bg-gradient-to-b from-[#080B11]/90 via-[#080B11]/60 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                i<span className="text-red-500">Movies</span>
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 -mt-1">
                Cinema Redefined
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              if (link.requiresAuth && !isAuthenticated) return null;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white bg-red-600/10 border border-red-500/20 text-red-400 font-semibold shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex items-center relative flex-1 max-w-xs lg:max-w-sm"
          >
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search movies, actors, directors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161F30]/80 border border-gray-700/60 focus:border-red-500 rounded-full pl-10 pr-4 py-1.5 text-xs text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
            />
          </form>

          {/* User / Auth Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#161F30] border border-gray-700/60 hover:border-red-500/50 transition-all text-sm font-medium text-gray-200"
                >
                  <div className="w-7 h-7 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate text-xs">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#161F30] border border-gray-700/80 shadow-2xl py-2 z-50 text-sm animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-800">
                      <p className="font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-700/30">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/my-bookings"
                      className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-red-600/10 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-red-400" />
                      My Bookings
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-gray-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-950/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-colors hover:bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-600/25 transition-all hover:scale-[1.02]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/60"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-gray-800 px-4 pt-3 pb-6 mt-3 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161F30] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
            />
          </form>

          {navLinks.map((link) => {
            if (link.requiresAuth && !isAuthenticated) return null;
            return (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-red-600/10 hover:text-red-400"
              >
                {link.name}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20"
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}

          <div className="border-t border-gray-800 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-950/20 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  className="w-full text-center py-2 rounded-xl text-sm font-semibold text-gray-300 bg-gray-800/80"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-2 rounded-xl text-sm font-bold bg-red-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
