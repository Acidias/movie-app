import React from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "./search.svg";
import "./App.css";
import { useEffect, useState } from "react";
import Movie from "./Movie";
import axios from "axios";
import Button from "@mui/material/Button";
import RingLoader from "react-spinners/RingLoader";

const REACT_APP_URL = process.env.REACT_APP_URL;

const TextSearch = () => {
   const navigate = useNavigate();

   const [movies, setMovies] = useState([]);
   const [loading, setLoading] = useState(false);
   const [searchValue, setSearchValue] = useState("");
   const [openAIResults, setOpenAIResults] = useState([]);

   const handleSearch = async () => {
      try {
         const response = await fetch(
            `${REACT_APP_URL}/api/openai_movie_titles/`,
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({
                  searchValue: searchValue,
               }),
            }
         );

         if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
         }

         const data = await response.json();
         console.log("data:", data);
         console.log("data.movie_details:", data.movie_details);
         setMovies(data.movie_details);
      } catch (error) {
         console.error("Fetch error:", error);
      }
   };

   return (
      <div className="app">
         <h1>The Movie App</h1>

         <div className="buttons">
            <Button
               className="button"
               variant="contained"
               onClick={() => navigate("/")}
            >
               Search by Title
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
               placeholder="Type details about the movie you wish to find...."
               value={searchValue}
               onChange={(e) => setSearchValue(e.target.value)}
            />
            <img src={SearchIcon} alt="search" onClick={handleSearch} />
         </div>
         {openAIResults.length > 0 && (
            <div className="openai-results">
               <h2>Possible Movie Titles:</h2>
               <ul>
                  {openAIResults.map((title, index) => (
                     <li key={index}>{title}</li>
                  ))}
               </ul>
            </div>
         )}
         <div>
            {loading ? (
               <RingLoader color="#36d7b7" />
            ) : movies?.length > 0 ? (
               <div className="container">
                  {movies.map((movie) => (
                     <Movie movie={movie} />
                  ))}
               </div>
            ) : (
               <div className="empty">
                  <h2>No movies found</h2>
               </div>
            )}
         </div>
      </div>
   );
};

export default TextSearch;
