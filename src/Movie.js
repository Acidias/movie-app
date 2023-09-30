import React from 'react'
import { useEffect, useState } from "react";
import MovieProfile from './MovieProfile';

const Movie = ({ movie }) => {
  const [selectedMovie, setSelectedMovie] = useState(false);

  const close = () => {
    setSelectedMovie(false);
  }

  return (
    <div>
      <div className="movie" onClick={() => setSelectedMovie(true)}>
        <div>
          <p>{movie.release_date}</p>
        </div>
        <div>
          <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
        </div>
        <div>
          <h2>{movie.title}</h2>
        </div>
      </div>
      {selectedMovie && <MovieProfile movie={movie} close={close} />}
    </div>
  )
}

export default Movie
