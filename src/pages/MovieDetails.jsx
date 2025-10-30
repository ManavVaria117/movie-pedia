import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowLeftIcon, PlayIcon, StarIcon } from '@heroicons/react/24/outline';

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const OMDB_API_URL = import.meta.env.VITE_OMDB_API_URL || 'https://www.omdbapi.com';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || false;
  });
  const [similarMovies, setSimilarMovies] = useState([]);

  const fetchSimilarMovies = async (title) => {
    try {
      // First search for movies with similar title
      const searchResponse = await axios.get(OMDB_API_URL, {
        params: {
          apikey: OMDB_API_KEY,
          s: title,
          type: 'movie',
          page: 1
        }
      });

      if (searchResponse.data.Response === 'True') {
        // Filter out the current movie and limit to 5 similar movies
        const filteredMovies = searchResponse.data.Search
          .filter(movie => movie.imdbID !== id)
          .slice(0, 5);
        
        // Fetch full details for each similar movie
        const detailedMovies = await Promise.all(
          filteredMovies.map(async (movie) => {
            const detailResponse = await axios.get(OMDB_API_URL, {
              params: {
                apikey: OMDB_API_KEY,
                i: movie.imdbID,
                plot: 'short'
              }
            });
            return detailResponse.data;
          })
        );
        
        setSimilarMovies(detailedMovies);
      }
    } catch (error) {
      console.error('Error fetching similar movies:', error);
      // Don't show error to user for similar movies
      setSimilarMovies([]);
    }
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(OMDB_API_URL, {
          params: {
            apikey: OMDB_API_KEY,
            i: id,  // OMDb uses 'i' parameter for movie ID (IMDb ID)
            plot: 'full'  // Get full plot instead of short
          }
        });
        
        if (response.data.Response === 'True') {
          // Log the complete API response for debugging
          console.log('OMDb API Response:', response.data);
          
          // Use the raw OMDb data directly
          const movieData = {
            ...response.data,
            // Map OMDb fields to match our expected structure
            title: response.data.Title,
            overview: response.data.Plot,
            poster_path: response.data.Poster !== 'N/A' ? response.data.Poster : null,
            release_date: response.data.Released,
            runtime: response.data.Runtime,
            vote_average: response.data.imdbRating,
            imdbRating: response.data.imdbRating,
            imdbVotes: response.data.imdbVotes,
            imdbID: response.data.imdbID,
            Type: response.data.Type,
            DVD: response.data.DVD,
            BoxOffice: response.data.BoxOffice,
            Production: response.data.Production,
            Website: response.data.Website,
            Response: response.data.Response,
            // Handle genre as both array (for compatibility) and string (for OMDb)
            genres: response.data.Genre ? response.data.Genre.split(', ').map(genre => ({ name: genre })) : [],
            Genre: response.data.Genre,
            // Handle other OMDb specific fields
            Rated: response.data.Rated,
            Director: response.data.Director,
            Writer: response.data.Writer,
            Actors: response.data.Actors,
            Language: response.data.Language,
            Country: response.data.Country,
            Awards: response.data.Awards,
            Ratings: response.data.Ratings,
            Metascore: response.data.Metascore,
            totalSeasons: response.data.totalSeasons,
            // Keep the original response for reference
            _raw: response.data
          };
          
          setMovie(movieData);
          
          // Fetch similar movies after setting the main movie data
          if (movieData.Title) {
            fetchSimilarMovies(movieData.Title);
          }
        } else {
          throw new Error(response.data.Error || 'Movie not found');
        }
      } catch (err) {
        console.error('Error fetching movie details:', err);
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          setError(
            <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg max-w-2xl mx-auto my-8">
              <div className="text-yellow-600 dark:text-yellow-400 font-medium text-lg mb-3">
                Connection Error
              </div>
              <div className="text-gray-700 dark:text-gray-300 mb-4">
                We're having trouble connecting to the movie database. This might be due to network restrictions in your region.
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="font-medium text-gray-800 dark:text-gray-200 mb-3">Try these solutions:</div>
                <div className="list-decimal list-inside space-y-2 text-left pl-4">
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
                </div>
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

  if (!movie) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
        <p className="text-red-500 text-lg mb-4">Movie not found</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
          <Link 
            to="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
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

  // OMDb doesn't provide trailer links directly
  const trailerUrl = movie.trailer || null;

  // Debug function to log complete movie data
  const logMovieData = () => {
    console.log('Complete Movie Data:', movie);
    console.log('Similar Movies:', similarMovies);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Debug button - can be removed in production */}
      <button 
        onClick={logMovieData}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50"
        title="View API Data in Console"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
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
                  movie.Poster && movie.Poster !== 'N/A'
                    ? movie.Poster
                    : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNzUwIiB2aWV3Qm94PSIwIDAgNTAwIDc1MCI+CiAgPHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI3NTAiIGZpbGw9IiNlNWU1ZTUiLz4KICA8dGV4dCB4PSIyNTAiIHk9IjM3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0jOTk5Ij5ObyBQb3N0ZXIgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4='
                }
                alt={movie.Title || 'Movie poster'}
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
                    {movie.Title} 
                    <span className="text-gray-500 dark:text-gray-400 font-normal">
                      ({movie.Year})
                    </span>
                  </h1>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                      <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {movie.imdbRating || 'N/A'} / 10
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {movie.Runtime || 'N/A'}
                    </span>
                  </div>
                  
                  {movie.Genre && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.Genre.split(', ').map((genre, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-sm font-medium rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Plot</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {movie.Plot || 'No plot available.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {movie.Director && movie.Director !== 'N/A' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Director</h4>
                          <p className="text-gray-700 dark:text-gray-300">{movie.Director}</p>
                        </div>
                      )}
                      
                      {movie.Writer && movie.Writer !== 'N/A' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Writer</h4>
                          <p className="text-gray-700 dark:text-gray-300">{movie.Writer}</p>
                        </div>
                      )}
                      
                      {movie.Actors && movie.Actors !== 'N/A' && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cast</h4>
                          <p className="text-gray-700 dark:text-gray-300">{movie.Actors}</p>
                        </div>
                      )}
                      
                      {movie.Country && movie.Country !== 'N/A' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Country</h4>
                          <p className="text-gray-700 dark:text-gray-300">{movie.Country}</p>
                        </div>
                      )}
                      
                      {movie.Language && movie.Language !== 'N/A' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Language</h4>
                          <p className="text-gray-700 dark:text-gray-300">{movie.Language}</p>
                        </div>
                      )}
                      
                      {movie.Rated && movie.Rated !== 'N/A' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rated</h4>
                          <p className="text-gray-700 dark:text-gray-300">{movie.Rated}</p>
                        </div>
                      )}
                      
                      {movie.Released && movie.Released !== 'N/A' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Released</h4>
                          <p className="text-gray-700 dark:text-gray-300">{movie.Released}</p>
                        </div>
                      )}
                      
                      {movie.Runtime && movie.Runtime !== 'N/A' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Runtime</h4>
                          <p className="text-gray-700 dark:text-gray-300">{movie.Runtime}</p>
                        </div>
                      )}
                      
                      {movie.BoxOffice && movie.BoxOffice !== 'N/A' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Box Office</h4>
                          <p className="text-gray-700 dark:text-gray-300">{movie.BoxOffice}</p>
                        </div>
                      )}
                      
                      {movie.Production && movie.Production !== 'N/A' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Production</h4>
                          <p className="text-gray-700 dark:text-gray-300">{movie.Production}</p>
                        </div>
                      )}
                      
                      {movie.Awards && movie.Awards !== 'N/A' && movie.Awards !== 'N/A' && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Awards</h4>
                          <p className="text-gray-700 dark:text-gray-300">{movie.Awards}</p>
                        </div>
                      )}
                      
                      {movie.Ratings && movie.Ratings.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Ratings</h4>
                          <div className="space-y-2">
                            {movie.Ratings.map((rating, index) => (
                              <div key={index} className="flex items-center">
                                <span className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {rating.Source}:
                                </span>
                                <span className="text-gray-700 dark:text-gray-300">
                                  {rating.Value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto">
                  {movie.Website && movie.Website !== 'N/A' && (
                    <a
                      href={movie.Website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlayIcon className="h-5 w-5 mr-2" />
                      Visit Website
                    </a>
                  )}
                  {movie.imdbID && (
                    <a
                      href={`https://www.imdb.com/title/${movie.imdbID}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <span className="font-bold mr-1">IMDb</span> Page
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Similar Movies */}
          <div className="p-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Similar Movies
            </h2>
            {similarMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {similarMovies.map(movie => (
                  <Link 
                    key={movie.imdbID} 
                    to={`/movie/${movie.imdbID}`}
                    className="block group"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={
                          movie.Poster && movie.Poster !== 'N/A' 
                            ? movie.Poster
                            : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNzUwIiB2aWV3Qm94PSIwIDAgNTAwIDc1MCI+CiAgPHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI3NTAiIGZpbGw9IiNlNWU1ZTUiLz4KICA8dGV4dCB4PSIyNTAiIHk9IjM3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0jOTk5Ij5ObyBQb3N0ZXIgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4='
                        }
                        alt={movie.Title || 'Movie poster'}
                        className="w-full h-auto rounded-lg transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNzUwIiB2aWV3Qm94PSIwIDAgNTAwIDc1MCI+CiAgPHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI3NTAiIGZpbGw9IiNlNWU1ZTUiLz4KICA8dGV4dCB4PSIyNTAiIHk9IjM3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0jOTk5Ij5ObyBQb3N0ZXIgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4=';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <PlayIcon className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300" />
                      </div>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {movie.Title}
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
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No similar movies found.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
