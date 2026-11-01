import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, Shield, Sparkles, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#05070B] border-t border-gray-900 text-gray-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-600/30">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                i<span className="text-red-500">Movies</span>
              </span>
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              iMovies is India’s premier next-generation cinema ticket booking platform.
              Experience unmatched visual clarity with IMAX 4K, Dolby Atmos audio, and real-time interactive seat reservation.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-[11px] font-semibold text-red-400">
                <Sparkles className="w-3 h-3" /> 100% Real-Time Availability
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[11px] font-semibold text-emerald-400">
                <Shield className="w-3 h-3" /> SSL Secured Checkout
              </span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">
              Explore Movies
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/movies?status=now_showing" className="hover:text-red-400 transition-colors">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link to="/movies?status=coming_soon" className="hover:text-red-400 transition-colors">
                  Coming Soon
                </Link>
              </li>
              <li>
                <Link to="/movies?genre=Sci-Fi" className="hover:text-red-400 transition-colors">
                  Sci-Fi & Action
                </Link>
              </li>
              <li>
                <Link to="/movies?genre=Drama" className="hover:text-red-400 transition-colors">
                  Drama & Thriller
                </Link>
              </li>
              <li>
                <Link to="/theatres" className="hover:text-red-400 transition-colors">
                  Find Theatres
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/my-bookings" className="hover:text-red-400 transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <a href="#cancellation" onClick={(e) => { e.preventDefault(); alert("Cancellation Policy: Full refund for cancellations made prior to show start time."); }} className="hover:text-red-400 transition-colors">
                  Cancellation Policy
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => { e.preventDefault(); alert("iMovies FAQs: Real-time seat locking holds your seats for 5 minutes during checkout."); }} className="hover:text-red-400 transition-colors">
                  FAQs & Help
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Terms of Service: Standard cinema admission terms apply."); }} className="hover:text-red-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Privacy Policy: Your data and payments are strictly confidential."); }} className="hover:text-red-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Lower Parel, Mumbai, Maharashtra 400013, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>+91 (022) 2456-7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>support@imovies.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-900/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} iMovies Entertainment Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for cinema lovers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
