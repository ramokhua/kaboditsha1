import React from 'react';
import Layout from '../components/layout/Layout';

const ContactPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-[#2C1810] mb-6">Contact Us</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-[#B45F3A] mb-4">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="font-medium text-gray-800">Toll Free</p>
                    <p className="text-gray-600">0800 600 737</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-xl">📧</span>
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <a href="mailto:kaboditsha.lms@gmail.com" className="text-[#B45F3A] hover:underline">
                      kaboditsha.lms@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="font-medium text-gray-800">Head Office</p>
                    <p className="text-gray-600">Gaborone, Botswana</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-[#B45F3A] mb-4">Support Hours</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700">Monday - Friday</span>
                  <span className="font-medium">8:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700">Saturday</span>
                  <span className="font-medium">9:00 AM - 1:00 PM</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-[#F5E6D3] rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Emergency Support:</strong> For urgent land allocation inquiries, 
                  please contact your local Land Board office directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;