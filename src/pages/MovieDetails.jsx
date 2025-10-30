import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowLeftIcon, PlayIcon, StarIcon } from '@heroicons/react/24/outline';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL = 'https://api.themoviedb.org/3';

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || false;
  });

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [movieResponse, similarResponse] = await Promise.all([
          axios.get(`${API_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos`),
          axios.get(`${API_URL}/movie/${id}/similar?api_key=${API_KEY}&page=1`)
        ]);
        
        setMovie(movieResponse.data);
        setSimilarMovies(similarResponse.data.results.slice(0, 5)); // Get top 5 similar movies
      } catch (err) {
        console.error('Error fetching movie details:', err);
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          setError(
            <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg max-w-2xl mx-auto my-8">
              <div className="text-yellow-600 dark:text-yellow-400 font-medium text-lg mb-3">
                Connection Error
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We're having trouble connecting to the movie database. This might be due to network restrictions in your region.
              </p>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="font-medium text-gray-800 dark:text-gray-200 mb-3">Try these solutions:</p>
                <ol className="list-decimal list-inside space-y-2 text-left pl-4">
                  <li className="flex items-start">
                    <span className="mr-2">🔌</span>
                    <span>Connect to a different network or use a VPN service</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">🔄</span>
                    <span>Check your internet connection and try again</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">⏱️</span>
                    <span>Wait a few minutes and refresh the page</span>
                  </li>
                </ol>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          );
        } else {
          setError('Failed to fetch movie details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <Link 
          to="/" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">Movie not found</p>
        <Link 
          to="/" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const trailer = movie.videos?.results.find(video => 
    video.site === 'YouTube' && video.type === 'Trailer'
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Movies
        </Link>
      </div>

      {/* Movie Details */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
        >
          {/* Movie Header */}
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={
                  movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNzUwIiB2aWV3Qm94PSIwIDAgNTAwIDc1MCI+CiAgPHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI3NTAiIGZpbGw9IiNlNWU1ZTUiLz4KICA8dGV4dCB4PSIyNTAiIHk9IjM3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0jOTk5Ij5ObyBQb3N0ZXIgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4='
                }
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNzUwIiB2aWV3Qm94PSIwIDAgNTAwIDc1MCI+CiAgPHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI3NTAiIGZpbGw9IiNlNWU1ZTUiLz4KICA8dGV4dCB4PSIyNTAiIHk9IjM3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0jOTk5Ij5ObyBQb3N0ZXIgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4=';
                }}
              />
            </div>
            
            <div className="p-8 md:w-2/3">
              <div className="flex flex-col h-full">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {movie.title} 
                    <span className="text-gray-500 dark:text-gray-400 font-normal">
                      ({new Date(movie.release_date).getFullYear()})
                    </span>
                  </h1>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                      <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {movie.vote_average?.toFixed(1)} / 10
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {movie.runtime} min
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres?.map(genre => (
                      <span 
                        key={genre.id}
                        className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-sm font-medium rounded-full"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {movie.overview || 'No overview available.'}
                  </p>
                </div>
                
                <div className="mt-auto">
                  {trailer && (
                    <a
                      href={`https://www.youtube.com/watch?v=${trailer.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <PlayIcon className="h-5 w-5 mr-2" />
                      Watch Trailer
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Similar Movies */}
          {similarMovies.length > 0 && (
            <div className="p-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                Similar Movies
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {similarMovies.map(movie => (
                  <Link 
                    key={movie.id} 
                    to={`/movie/${movie.id}`}
                    className="block group"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                            : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNzUwIiB2aWV3Qm94PSIwIDAgNTAwIDc1MCI+CiAgPHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI3NTAiIGZpbGw9IiNlNWU1ZTUiLz4KICA8dGV4dCB4PSIyNTAiIHk9IjM3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0jOTk5Ij5ObyBQb3N0ZXIgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4='
                        }
                        alt={movie.title}
                        className="w-full h-auto rounded-lg transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNzUwIiB2aWV3Qm94PSIwIDAgNTAwIDc1MCI+CiAgPHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI3NTAiIGZpbGw9IiNlNWU1ZTUiLz4KICA8dGV4dCB4PSIyNTAiIHk9IjM3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0jOTk5Ij5ObyBQb3N0ZXIgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4=';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <PlayIcon className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300" />
                      </div>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white truncate">
                      {movie.title}
                    </h3>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {movie.vote_average?.toFixed(1)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
