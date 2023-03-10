import React from "react";
import { useEffect, useState } from "react";
import Popup from 'reactjs-popup';
import './App.css';
import SearchIcon from './search.svg';
import Movie from './Movie';
import MovieProfile from './MovieProfile';

//Please use your own API key! Not mine!
const API_URL = 'http://www.omdbapi.com?apikey=224d8082';

const App = () => {
  const [movies, setMovies] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(false);

  const searchMovies = async (title) => {
    const response = await fetch(`${API_URL}&s=${title}`);
    const data = await response.json();

    setMovies(data.Search);
  }

  useEffect(() => {
    searchMovies('avengers');
  }, []);

  const handleClick = (id) => {
    setSelectedMovie(id);
  }

  return (
    <div className="app">
      <h1>My Movie App</h1>

      <div className="search">
        <input
          type="text"
          placeholder="Search for a movie...."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <img
          src={SearchIcon}
          alt="search"
          onClick={() => searchMovies(searchValue)}
        />

      </div>
      {movies?.length > 0
        ? (
          <div className="container">
            {movies.map(movie => (
              <Movie movie={movie} onClick={() => handleClick(movie.imdbID)} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h2>No movies found</h2>
          </div>
        )
      }

    </div>
  );
}

export default App;