import React, { useState, useEffect } from "react";
import "./popup.css";
import axios from "axios";
import RingLoader from "react-spinners/RingLoader";
import Button from "@mui/material/Button";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import AnalyzeIcon from "@mui/icons-material/Analytics"; // Importing the Icon for Analyse button
import { Line } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

const MovieProfile = () => {
   let { title } = useParams(); // getting title from URL parameter
   console.log(title);

   const location = useLocation();
   const movie = location.state.movie;

   const [story, setStory] = useState("");
   const [loading, setLoading] = useState(true);
   const [actors, setActors] = useState([]);
   const [analyzedData, setAnalyzedData] = useState([]);

   const handleAnalyze = async () => {
      try {
         const response = await axios.get(
            `http://localhost:8000/analyse_subtitle/?tmdb_id=${movie.id}`
         );
         console.log(response);
         if (response.data.avg_sentiments) {
            setLoading(false);
            setAnalyzedData(response.data.avg_sentiments);
         }
      } catch (error) {
         console.error("Error analyzing subtitle: " + error);
      }
   };

   const data = {
      labels: Array.from({ length: analyzedData.length }, (_, i) => i + 1),
      datasets: [
         {
            label: "Sentiment Scores",
            data: analyzedData,
            fill: true,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
         },
      ],
   };

   useEffect(() => {
      async function generateStory() {
         try {
            const response = await axios.post(
               "https://api.openai.com/v1/engines/text-davinci-002/completions",
               {
                  prompt: `Write a story about ${movie.title} movie, which was released in ${movie.release_date}`,
                  temperature: 0.9,
                  max_tokens: 500,
               },
               {
                  headers: {
                     Authorization: `Bearer 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`,
                     "Content-Type": "application/json",
                  },
               }
            );
            setStory(response.data.choices[0].text);
            setLoading(false);
         } catch (error) {
            console.error("error:" + error);
         }
      }
      async function fetchActors() {
         try {
            const response = await axios.get(
               `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=0cb0cf970fcbb3d0a9b2403923eceae9`
            );
            setActors(response.data.cast.slice(0, 8));
         } catch (error) {
            console.error("error:" + error);
         }
      }

      generateStory();
      fetchActors();
   }, [movie.title]);

   return (
      <div className="overlay">
         <div className="modalContainer">
            <div className="modalHeader">
               <span className="modalTitle">{movie.title}</span>
               <span>({movie.release_date.slice(0, 4)})</span>
            </div>

            <div className="posterAndActors">
               <div className="left">
                  <img
                     src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                     alt={movie.title}
                  />
               </div>
               <div className="right">
                  <div className="actors">
                     <h2>Actors</h2>
                     {actors.map((actor) => (
                        <div className="actor">
                           <p>{actor.name}</p>
                        </div>
                     ))}
                  </div>

                  <h2>Sentiment Analysis</h2>
                  <Line
                     data={data}
                     options={{
                        scales: {
                           x: {
                              beginAtZero: true,
                              ticks: {
                                 stepSize: 5, // will ensure ticks are created at multiples of 5
                              },
                           },
                        },
                     }}
                  />

                  {/* {loading ? <RingLoader /> : <Line data={data} />} */}

                  <div>
                     <Button
                        style={{ marginTop: "10px" }}
                        variant="contained"
                        endIcon={<LiveTvIcon />}
                        onClick={() => {
                           const title = movie.title.replace(/ /g, "-");
                           window.open(
                              `https://solarmovie.pe/search/${title}/`,
                              "_blank"
                           );
                        }}
                     >
                        Watch
                     </Button>
                     <Button
                        style={{ marginTop: "10px", marginLeft: "10px" }} // Adjust the margin for styling
                        variant="contained"
                        endIcon={<AnalyzeIcon />} // Adding an Icon for the Analyse button
                        onClick={handleAnalyze} // Calling the handleAnalyze function on button click
                     >
                        Analyse
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default MovieProfile;
