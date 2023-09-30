import React from "react";
import { useEffect, useState } from "react";
import './App.css';
import SearchIcon from './search.svg';
import { HiOutlineSwitchVertical } from "react-icons/hi";
import Movie from './Movie';
import { useNavigate } from "react-router-dom";
import RingLoader from "react-spinners/RingLoader";
import Button from '@mui/material/Button';

const API_KEY = '0cb0cf970fcbb3d0a9b2403923eceae9';
const API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}`;


const TitleSearch = () => {
    const navigate = useNavigate();

    const [movies, setMovies] = useState([]);
    const [searchValue, setSearchValue] = useState('');

    const searchMovies = async (title) => {
        const response = await fetch(`${API_URL}&query=${encodeURIComponent(title)}`);
        const data = await response.json();
        setMovies(data.results);
    };

    useEffect(() => {
        searchMovies('avengers');
    }, []);

  return (
    <div className="app">

        <h1>The Movie App</h1>
        <div className="buttons">
        <Button
            className='button'
            variant="contained"
            onClick={() => navigate('/textsearch')}
        >
            Search by Text
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
                {movies.map(movie => (
                    <Movie movie={movie} />
                ))}
            </div>
            ) : (
                <div className="empty">
                <h2>No movies found</h2>
                </div>
            )
        }
    </div>
  )
}

export default TitleSearch