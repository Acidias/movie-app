import React from "react";
import { useEffect, useState } from "react";
import "./App.css";
import SearchIcon from "./search.svg";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import Movie from "./Movie";
import {
   BrowserRouter as Router,
   Routes,
   Route,
   Navigate,
} from "react-router-dom";
import TextSearch from "./TextSearch";
import ChatAI from "./ChatAI";
import TitleSearch from "./TitleSearch";
import MovieProfile from "./MovieProfile";
import { Chart, registerables } from "chart.js";
import { firebaseConfig } from "./firebaseConfig";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Login from "./Login";

Chart.register(...registerables);

initializeApp(firebaseConfig);

const App = () => {
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
         if (user) {
            setIsAuthenticated(true);
         } else {
            setIsAuthenticated(false);
         }
         setIsLoading(false);
      });
   });

   if (isLoading) {
      return <div>Loading...</div>;
   }

   const ProtectedRoute = ({ children }) => {
      if (!isAuthenticated) {
         return <Navigate to="/login" />;
      }
      return children;
   };

   return (
      <div className="app" style={{ padding: "0", paddingTop: "4rem" }}>
         <Router>
            <Routes>
               <Route path="/login" element={<Login />} />
               <Route
                  path="/"
                  element={
                     <ProtectedRoute>
                        <TitleSearch />
                     </ProtectedRoute>
                  }
               />
               <Route
                  path="/textsearch"
                  element={
                     <ProtectedRoute>
                        <TextSearch />
                     </ProtectedRoute>
                  }
               />
               <Route
                  path="/chatai"
                  element={
                     <ProtectedRoute>
                        <ChatAI />
                     </ProtectedRoute>
                  }
               />
               <Route
                  path="/movie/:id"
                  element={
                     <ProtectedRoute>
                        <MovieProfile />
                     </ProtectedRoute>
                  }
               />
            </Routes>
         </Router>
      </div>
   );
};

export default App;
