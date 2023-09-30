import React from "react";
import { useEffect, useState } from "react";
import './App.css';
import SearchIcon from './search.svg';
import { HiOutlineSwitchVertical } from "react-icons/hi";
import Movie from './Movie';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TextSearch from "./TextSearch";
import ChatAI from "./ChatAI";
import TitleSearch from "./TitleSearch";

const API_KEY = '0cb0cf970fcbb3d0a9b2403923eceae9';
const API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}`;

const App = () => {
const [movies, setMovies] = useState([]);
const [searchValue, setSearchValue] = useState('');

const searchMovies = async (title) => {
  const response = await fetch(`${API_URL}&query=${encodeURIComponent(title)}`);
  const data = await response.json();
  
  setMovies(data.results);
}
;
useEffect(() => {
  searchMovies('avengers');
}, []);

return (
<div className="app" style={{padding: '0', paddingTop: '4rem'}}>
 
      <Router>
        <Routes>
          <Route path="/" element={<TitleSearch />} />
          <Route path="/textsearch" element={<TextSearch />} />
          <Route path="/chatai" element={<ChatAI />} />
        </Routes>
      </Router>
</div>
);
}

export default App;