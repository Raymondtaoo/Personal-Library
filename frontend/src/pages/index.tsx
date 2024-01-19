import React from 'react';
import NavBar from '../components/NavBar';

const Home: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <NavBar />
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mt-10">Welcome to My Book Library</h1>
        <p className="text-xl text-gray-600 mt-4">Your personal digital bookshelf</p>
        
        <div className="mt-10">
          <img src="/library-banner.png" alt="Library Banner" className="mx-auto" /> 
        </div>

        <div className="mt-10 p-4">
          <h2 className="text-3xl font-semibold text-gray-700">Explore Our Collections</h2>
          <p className="text-lg text-gray-600 mt-2">Discover a variety of books from multiple genres</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Example Book Categories */}
            <div className="bg-white shadow rounded p-4 hover:bg-gray-200">
              <h3 className="font-semibold">Fiction</h3>
              <p>Immerse in the world of imagination and creativity.</p>
            </div>
            <div className="bg-white shadow rounded p-4 hover:bg-gray-200">
              <h3 className="font-semibold">Non-Fiction</h3>
              <p>Explore real stories, biographies, and factual content.</p>
            </div>
            <div className="bg-white shadow rounded p-4 hover:bg-gray-200">
              <h3 className="font-semibold">Sci-Fi & Fantasy</h3>
              <p>Step into the realms of science fiction and fantasy worlds.</p>
            </div>
            {/* Add more categories as needed */}
          </div>
        </div>

        <div className="mt-10 p-4 bg-white shadow rounded">
          <h2 className="text-3xl font-semibold text-gray-700">Why Choose Our Library?</h2>
          <p className="text-lg text-gray-600 mt-2">We offer a unique and personalized book-reading experience.</p>
          {/* Add more content about your library's features and benefits */}
        </div>
      </div>
    </div>
  );
};

export default Home;
