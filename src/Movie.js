import React from 'react'

const Movie = ({ movie }) => {
  return (
    <div className="movie">
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
  )
}

export default Movie