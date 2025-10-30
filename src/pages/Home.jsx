import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL = 'https://api.themoviedb.org/3';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || false;
  });

  useEffect(() => {
    // Toggle dark mode class on body
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const fetchMovies = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      
      let url;
      if (query) {
        url = `${API_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
      } else {
        url = `${API_URL}/movie/popular?api_key=${API_KEY}`;
      }
      
      const response = await axios.get(url);
      setMovies(response.data.results);
    } catch (err) {
      console.error('Error fetching movies:', err);
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError(
          <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-yellow-600 dark:text-yellow-400 font-medium mb-2">
              Connection Error
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Unable to connect to the movie database. This might be due to network restrictions.
            </p>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Try these solutions:</p>
              <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Connect to a different network</li>
                <li>Use a VPN service</li>
                <li>Check your internet connection</li>
                <li>Try again in a few minutes</li>
              </ol>
            </div>
          </div>
        );
      } else {
        setError('Failed to fetch movies. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchMovies(query);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">
          Discover Movies
        </h1>
        
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-700 rounded-lg h-80"></div>
                <div className="mt-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => fetchMovies(searchQuery)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : movies.length > 0 ? (
          <>
            <h2 className="text-2xl font-semibold mb-6 dark:text-white">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Popular Movies'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              No movies found. Try a different search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
