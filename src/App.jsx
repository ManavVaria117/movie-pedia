import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || false;
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  return (
    <Router>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-center mb-6">
              <Link to="/" className="text-blue-600 hover:underline dark:text-blue-400">
                Back to Movies
              </Link>
            </div>
            <Routes>
              <Route path="/" element={<Home darkMode={darkMode} />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
            </Routes>
          </div>
        </main>
        <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4">
            <p>Movie data provided by <a href="https://www.omdbapi.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OMDb API</a></p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
