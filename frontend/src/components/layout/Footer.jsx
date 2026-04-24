// src/components/layout/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../kaboditshaLogo.png';

const Footer = () => {
  return (
    <footer className="bg-[#2C1810] text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About with Logo */}
          <div>
            <Link to="/" className="block mb-4">
              <img 
                src={logo} 
                alt="KaboDitsha Logo" 
                className="h-16 w-auto object-contain bg-white/10 p-2 rounded-lg"
              />
            </Link>
            <p className="text-white/80 text-sm leading-relaxed">
              Digitizing Botswana's land allocation process for transparency, 
              efficiency, and accessibility.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-white/70 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-white/70 hover:text-white transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="text-white/70 hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/land-board-directory" className="text-white/70 hover:text-white transition-colors">Land Board Directory</Link></li>
              <li><Link to="/user-manual" className="text-white/70 hover:text-white transition-colors">Application Guide</Link></li>
              <li>
                <a 
                  href="https://www.gov.bw/ministries/ministry-lands-and-agriculture" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Ministry Website
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-white/70">
                <span className="mr-2">📞</span>
                0800 600 737 (Toll Free)
              </li>
              <li className="flex items-center text-white/70">
                <span className="mr-2">📧</span>
                <a href="mailto:kaboditsha.lms@gmail.com" className="hover:text-white transition-colors">
                  kaboditsha.lms@gmail.com
                </a>
              </li>
              <li className="flex items-center text-white/70">
                <span className="mr-2">📍</span>
                Gaborone, Botswana
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60 text-sm">
          <p>© {new Date().getFullYear()} KaboDitsha. All rights reserved.</p>
          <p className="mt-2">Ministry of Lands and Agriculture, Botswana</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;