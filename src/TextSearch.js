import React from 'react';
import { useNavigate } from "react-router-dom";
import SearchIcon from './search.svg';
import './App.css';
import { useEffect, useState } from "react";
import Movie from './Movie';
import axios from 'axios';
import Button from '@mui/material/Button';
import RingLoader from "react-spinners/RingLoader";


const API_KEY = '0cb0cf970fcbb3d0a9b2403923eceae9';
const API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}`;


const TextSearch = () => {
    const navigate = useNavigate();

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [openAIResults, setOpenAIResults] = useState([]);
  

  
    useEffect(() => {
      searchMovies('');
    }, []);

    //OpenAI API 
    const getMovieTitlesFromStory = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                "https://api.openai.com/v1/engines/text-davinci-002/completions",
                {
                prompt: `Which movie is this? ${searchValue}. List few possible movie titles. Important: List only the title names! Use only the next structure Example: ;- The Avengers ;- Avengers: Age of Ultron ;- Avengers: Infinity War. Use ";-" before each title `,
                max_tokens: 50, // 50 tokens per title (up to 3 titles)
                n: 3, // return up to 3 titles
                },
                {
                headers: {
                    Authorization: `Bearer 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`,
                    "Content-Type": "application/json",
                },
                }
            );
          const titles = response.data.choices[0].text;
          const delimiter = ";-";
          const titleList = titles.split(delimiter).slice(1, 4).map((title) => title.trim());
          setOpenAIResults(titleList);
          setLoading(false);
          searchMovies(titleList.join(";-"));
        } catch (error) {
          console.error("error:" + error);
        }
    };

    const searchMovies = async (titles) => {
        const movieTitles = titles.split(";-");
        console.log("movieTitles:", movieTitles);
        const results = [];
        for (let i = 1; i < movieTitles.length; i++) {
          const response = await fetch(`${API_URL}&query=${encodeURIComponent(movieTitles[i])}`);
          const data = await response.json();
          console.log("data:", data);
          results.push(...data.results);
        }
        console.log("results:", results);
        setMovies(results);
    };




      return (
        <div className="app">
          <h1>The Movie App</h1>
          
          <div className="buttons">
            <Button
                className='button'
                variant="contained"
                onClick={() => navigate('/')}
            >
                Search by Title
            </Button>
            <Button
              className='button'
              variant="contained"
              onClick={() => navigate('/chatai')}
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
            <img
              src={SearchIcon}
              alt="search"
              onClick={() => getMovieTitlesFromStory()}
            />
          </div>
          {openAIResults.length > 0 && (
            <div className="openai-results">
              <h2>Possible Movie Titles:</h2>
              <ul>
                {openAIResults.map((title, index) => (
                  <li key={index} onClick={() => searchMovies(title)}>
                    {title}
                  </li>
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