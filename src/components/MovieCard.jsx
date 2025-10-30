import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const posterUrl = movie.poster_path || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNzUwIiB2aWV3Qm94PSIwIDAgNTAwIDc1MCI+CiAgPHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI3NTAiIGZpbGw9IiNlNWU1ZTUiLz4KICA8dGV4dCB4PSIyNTAiIHk9IjM3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Tm8gUG9zdGVyIEF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
  const movieId = movie.id;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className="group overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-blue-500/20 dark:hover:ring-blue-500/30"
    >
      <Link to={`/movie/${movieId}`} className="block">
        <div className="relative pb-150 bg-gray-100 dark:bg-gray-800">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNzUwIiB2aWV3Qm94PSIwIDAgNTAwIDc1MCI+CiAgPHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI3NTAiIGZpbGw9IiNlNWU1ZTUiLz4KICA8dGV4dCB4PSIyNTAiIHk9IjM3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Tm8gUG9zdGVyIEF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white text-sm font-medium bg-blue-500 px-2 py-1 rounded-full">
              View Details
            </span>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border-t-4 border-blue-500">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-500 transition-colors duration-200" title={movie.title}>
            {movie.title}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
              </span>
              {movie.vote_average > 0 && (
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  <svg
                    className="w-3 h-3 text-yellow-400 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-medium">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
