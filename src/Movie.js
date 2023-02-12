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
            <p>{movie.Year}</p>
        </div>
        <div>
            <img src={movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.jp/400x400.png'} alt={movie.Title} />
        </div>
        <div>
            <span>{movie.Type}</span>
            <h2>{movie.Title}</h2>
        </div>
      </div>
      {selectedMovie && <MovieProfile movie={movie} close={close}/>}
    </div>
  )
}

export default Movie
