import React from "react";
import { useEffect, useState } from "react";
import MovieProfile from "./MovieProfile";
import { Link } from "react-router-dom";

const Movie = ({ movie }) => {
   return (
      <div className="movie">
         <Link
            to={{
               pathname: `/movie/${movie.id}`,
               state: {
                  movie: movie,
               },
            }}
            key={movie.id}
         >
            <div>
               <p>{movie.release_date}</p>
            </div>
            <div>
               <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
               />
            </div>
            <div>
               <h2>{movie.title}</h2>
            </div>
         </Link>
      </div>
   );
};

export default Movie;
