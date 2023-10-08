import React from "react";
import { useEffect, useState } from "react";
import "./App.css";
import SearchIcon from "./search.svg";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import Movie from "./Movie";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TextSearch from "./TextSearch";
import ChatAI from "./ChatAI";
import TitleSearch from "./TitleSearch";
import MovieProfile from "./MovieProfile";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const App = () => {
   return (
      <div className="app" style={{ padding: "0", paddingTop: "4rem" }}>
         <Router>
            <Routes>
               <Route path="/" element={<TitleSearch />} />
               <Route path="/textsearch" element={<TextSearch />} />
               <Route path="/chatai" element={<ChatAI />} />
               <Route path="/movie/:id" element={<MovieProfile />} />{" "}
            </Routes>
         </Router>
      </div>
   );
};

export default App;
