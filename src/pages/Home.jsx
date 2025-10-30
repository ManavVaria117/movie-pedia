import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const OMDB_BASE_URL = import.meta.env.VITE_OMDB_API_URL || 'https://www.omdbapi.com';

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

  const fetchMovies = async (query = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        apikey: OMDB_API_KEY,
        s: query || 'movie',  // Default search term if none provided
        type: 'movie',
        page: page
      };
      
      console.log('Making OMDb API request to:', OMDB_BASE_URL);
      const response = await axios.get(OMDB_BASE_URL, { params });
      
      if (response.data && response.data.Response === 'True') {
        const moviesData = response.data.Search.map(movie => ({
          id: movie.imdbID,
          title: movie.Title,
          poster_path: movie.Poster !== 'N/A' ? movie.Poster : null,
          release_date: movie.Year || 'N/A',
          vote_average: 0,  // OMDb doesn't provide this in search results
          overview: '',     // Will be fetched when movie is selected
          backdrop_path: null  // Will be fetched when movie is selected
        }));
        
        setMovies(moviesData);
      } else {
        setMovies([]);
        setError(response.data?.Error || 'No movies found. Try a different search term.');
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid API key. Please check your OMDb API key in the .env file.');
      } else if (err.response?.status === 404) {
        setError('The requested resource could not be found.');
      } else if (err.response?.status === 429) {
        setError('API request limit reached. OMDb has a daily limit on free tier.');
      } else {
        setError(err.message || 'Failed to fetch movies. Please try again later.');
      }
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError(
          <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-yellow-600 dark:text-yellow-400 font-medium mb-2">
              Connection Error
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Unable to connect to the movie database. Please check your internet connection.
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {err.message}
            </div>
          </div>
        );
      } else if (err.response?.status === 403) {
        setError(
          <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-red-600 dark:text-red-400 font-medium mb-2">
              Authentication Failed (403 Forbidden)
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              There was an issue with the API key or your subscription. Please verify:
              <ul className="list-disc list-inside mt-2 text-left">
                <li>Your RapidAPI key is correct and active</li>
                <li>You're subscribed to the Movies Database API</li>
                <li>Your subscription hasn't expired</li>
              </ul>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              API Host: {RAPIDAPI_HOST}
            </div>
          </div>
        );
      } else if (err.response?.status === 429) {
        const retryAfter = err.response?.headers?.['retry-after'] || 'a few';
        setError(
          <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-orange-600 dark:text-orange-400 font-medium mb-2">
              Rate Limit Exceeded (429 Too Many Requests)
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              You've made too many requests to the API. Please wait {retryAfter} seconds and try again.
            </div>
          </div>
        );
      } else {
        setError(
          <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-red-600 dark:text-red-400 font-medium mb-2">
              Error {err.response?.status || 'Unknown Error'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {err.response?.data?.message || 'Failed to fetch movies. Please try again later.'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {err.message}
            </div>
          </div>
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSearch = (query) => {
    const searchQuery = query.trim();
    setSearchQuery(searchQuery);
    
    if (searchQuery === '') {
      fetchMovies();
    } else {
      // Reset movies before new search to show loading state
      setMovies([]);
      fetchMovies(searchQuery);
    }
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
            <div className="text-red-500 text-lg">
              {typeof error === 'string' ? error : error}
            </div>
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
