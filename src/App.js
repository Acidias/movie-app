import React from "react";
import { useEffect, useState } from "react";
import Popup from 'reactjs-popup';
import './App.css';
import SearchIcon from './search.svg';
import Movie from './Movie';
import MovieProfile from './MovieProfile';

const API_URL =`${process.env.REACT_APP_API_KEY}`

const App = () => {
    const [movies, setMovies] = useState([]);
    const [searchValue, setSearchValue] = useState('');

    const searchMovies = async (title) => {
        const response = await fetch(`${API_URL}&s=${title}`);
        const data = await response.json();

        setMovies(data.Search);
    }
    useEffect(() => {
        searchMovies('avengers');
    }, []);

    return (
        <div className="app">
            <h1>My Movie App</h1>

            <div className="search">
                <input
                    type="text"
                    placeholder="Search for a movie..."
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
                            <Movie movie = {movie}/>
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