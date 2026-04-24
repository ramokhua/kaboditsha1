import React from 'react';
import Layout from '../components/layout/Layout';

const AboutPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-[#2C1810] mb-6">About KaboDitsha</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-[#B45F3A] mb-3">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                KaboDitsha is dedicated to digitizing Botswana's land allocation process, 
                making it transparent, efficient, and accessible to all citizens.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#B45F3A] mb-3">The Problem</h2>
              <p className="text-gray-700 leading-relaxed">
                Botswana's land allocation system has long suffered from manual paper-based 
                processes, leading to 17-year backlogs, 64% ineligible applications, and 
                complete lack of transparency for applicants.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#B45F3A] mb-3">Our Solution</h2>
              <p className="text-gray-700 leading-relaxed">
                KaboDitsha provides an online platform where citizens can submit applications, 
                track their queue position in real-time, upload documents, and receive 
                automatic notifications—eliminating the need for office visits.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#B45F3A] mb-3">Impact So Far</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>60,000+ applications processed in test environment</li>
                <li>44 Land Boards integrated (12 Main + 32 Subordinate)</li>
                <li>Real-time queue tracking with FIFO fairness</li>
                <li>Automated email and in-app notifications</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;