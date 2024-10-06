import React from 'react';
import {motion} from 'framer-motion';

const LandingPage = () => {

      
  return (
    <div className="bg-white min-h-screen text-black">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-9xl font-bold mb-8">
            Find your
        </h1>
        <h2 className="text-9xl font-bold mb-8">
            <span className="text-yellow-500">House</span><span className="text-black">.</span>
        </h2>    
        <div className="grid md:grid-cols-3 gap-12">
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-500">Reviews</h2>
            <ul className="list-disc list-inside text-white">
              <li>Example</li>
            </ul>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-500">Why Choose Us?</h2>
            <ul className="list-disc list-inside text-white">
              <li>example</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <a href="/register" className="bg-yellow-500 text-black font-bold py-3 px-8 rounded-full hover:bg-yellow-600 transition duration-300">
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
export default LandingPage;