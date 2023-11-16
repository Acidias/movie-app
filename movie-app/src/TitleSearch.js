import React from "react";
import { useEffect, useState } from "react";
import "./App.css";
import SearchIcon from "./search.svg";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import Movie from "./Movie";
import { useNavigate } from "react-router-dom";
import RingLoader from "react-spinners/RingLoader";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";

const REACT_APP_URL = process.env.REACT_APP_URL;

const TitleSearch = () => {
   const navigate = useNavigate();
   const auth = getAuth();
   const user = auth.currentUser;
   const [movies, setMovies] = useState([]);
   const [searchValue, setSearchValue] = useState("");

   const searchMovies = async (title) => {
      const response = await fetch(
         `${REACT_APP_URL}/api/search/${encodeURIComponent(title)}/`
      );
      const data = await response.json();
      setMovies(data.results);
   };

   useEffect(() => {
      searchMovies("avengers");
   }, []);

   return (
      <div className="app">
         <h1>The Movie App</h1>
         <h3>Welcome {user?.displayName}</h3>
         <div className="buttons">
            <Button
               className="button"
               variant="contained"
               onClick={() => navigate("/textsearch")}
            >
               Search by Text
            </Button>

            <Button
               className="button"
               variant="contained"
               onClick={() => navigate("/chatai")}
            >
               Ask AI Chatbot
            </Button>
         </div>
         <div className="search">
            <input
               type="text"
               placeholder="Search for a movie by Title...."
               value={searchValue}
               onChange={(e) => setSearchValue(e.target.value)}
            />
            <img
               src={SearchIcon}
               alt="search"
               onClick={() => searchMovies(searchValue)}
            />
         </div>
         {movies?.length > 0 ? (
            <div className="container">
               {movies.map((movie) => {
                  return (
                     <Link
                        to={{
                           pathname: `/movie/${movie.id}`,
                           state: { movie },
                        }}
                        key={movie.id}
                     >
                        <Movie movie={movie} />
                     </Link>
                  );
               })}
            </div>
         ) : (
            <div className="empty">
               <h2>No movies found</h2>
            </div>
         )}
      </div>
   );
};

export default TitleSearch;
