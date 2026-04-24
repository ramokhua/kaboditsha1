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
              <li><Link to="/" className="text-white/70 hover:text-white">Home</Link></li>
              <li><Link to="/about" className="text-white/70 hover:text-white">About</Link></li>
              <li><Link to="/contact" className="text-white/70 hover:text-white">Contact</Link></li>
              <li><Link to="/faq" className="text-white/70 hover:text-white"><a href="/faq" className="hover:text-[#B45F3A] transition-colors">FAQ</a></Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/70 hover:text-white">Land Board Directory</a></li>
              <li><a href="#" className="text-white/70 hover:text-white">Application Guide</a></li>
              <li><a href="#" className="text-white/70 hover:text-white">Required Documents</a></li>
              <li><a href="#" className="text-white/70 hover:text-white">Ministry Website</a></li>
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
                support@kaboditsha.gov.bw
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
          <p className="mt-2">Ministry of Land Management, Water and Sanitation Services</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;