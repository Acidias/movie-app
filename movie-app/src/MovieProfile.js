import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import AnalyzeIcon from "@mui/icons-material/Analytics";
import { Line } from "react-chartjs-2";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "./MovieProfile.css";
import io from "socket.io-client";
import { useRef } from "react";

const MovieProfile = () => {
   const location = useLocation();
   const { id } = useParams();
   const navigate = useNavigate();
   const socket = useRef(null);

   const [analyzedData, setAnalyzedData] = useState([]);

   const initialMovie = location.state ? location.state.movie : null;
   const [sentiments, setSentiments] = useState([]);
   const [averagedDataset, setAveragedDataset] = useState([]);

   const [movie, setMovie] = useState(initialMovie);
   const [error, setError] = useState(null);
   const [story, setStory] = useState("");
   const [loading, setLoading] = useState(true);
   const [actors, setActors] = useState([]);
   useEffect(() => {
      const handleOffline = () => {
         if (socket.current) {
            socket.current.close();
            socket.current = null;
         }
      };

      window.addEventListener("offline", handleOffline);
      return () => {
         window.removeEventListener("offline", handleOffline);
      };
   }, []);
   useEffect(() => {
      return () => {
         if (socket.current) {
            socket.current.close();
            socket.current = null;
         }
      };
   }, []);
   function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
   }
   function averageData(data, subsetSize = 5) {
      let averages = [];

      for (let i = 0; i < data.length; i += subsetSize) {
         const subset = data.slice(i, i + subsetSize);
         const average =
            subset.reduce((acc, val) => acc + val, 0) / subset.length;
         averages.push(clamp(average, 0, 10));
      }
      console.log("averages:", averages);

      return averages;
   }

   const resetData = () => {
      setSentiments([]);
      setAnalyzedData([]);
      if (socket.current) {
         socket.current.close();
         socket.current = null;
      }
   };

   const handleAnalyze = async () => {
      try {
         const response = await axios.get(
            `http://localhost:8000/analyse_subtitle/?tmdb_id=${movie.id}`
         );
         console.log(response);
         if (response.data.file_path) {
            if (!socket.current) {
               socket.current = new WebSocket(
                  "ws://localhost:8000/ws/sentiment/"
               );

               socket.current.onopen = (event) => {
                  console.log("Connected to the WebSocket");
                  // Send the file_path as soon as the connection is open
                  socket.current.send(
                     JSON.stringify({ file_path: response.data.file_path })
                  );
               };

               socket.current.onmessage = (event) => {
                  const data = JSON.parse(event.data);

                  if (data.type && data.type === "end") {
                     console.log("Analyzed all the data", analyzedData);
                     const averagedData = averageData(analyzedData);

                     setAveragedDataset(averagedData);
                     console.log(
                        "averagedData:",
                        averagedData.length,
                        " ",
                        averagedData
                     );
                     socket.current.close();
                     return;
                  }

                  const newSentiment = {
                     score: data.avg_sentiment[0],
                     reason: data.avg_sentiment[1],
                  };

                  setSentiments((prevData) => [...prevData, newSentiment]);

                  // Update the analyzedData state with the new score
                  setAnalyzedData((prevData) => [
                     ...prevData,
                     newSentiment.score,
                  ]);
               };
            } else {
               // If socket is already established, send the file_path
               socket.current.send(
                  JSON.stringify({ file_path: response.data.file_path })
               );
            }
         }
      } catch (error) {
         console.error("Error analyzing subtitle: " + error);
      }
   };
   const chartData =
      averagedDataset.length > 0 ? averagedDataset : analyzedData;

   const data = {
      labels: Array.from({ length: analyzedData.length }, (_, i) => i + 1),
      datasets: [
         {
            label: "Sentiment Scores",
            data: chartData,
            fill: true,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
         },
      ],
   };
   const options = {
      scales: {
         x: {
            beginAtZero: true,
            ticks: {
               stepSize: 1,
            },
         },
         y: {
            min: 0,
            max: 10,
            beginAtZero: true,
            ticks: {
               stepSize: 1,
            },
         },
      },
      plugins: {
         legend: {
            display: false,
         },
         datalabels: {
            align: "end",
            anchor: "end",
            display: true,
         },
      },
   };
   useEffect(() => {
      if (!movie) {
         const fetchMovie = async () => {
            try {
               const url = `http://localhost:8000/api/movie/${id}/`;
               const response = await axios.get(url);
               setMovie(response.data.movie_details);
               setActors(response.data.actors);
            } catch (err) {
               console.error("Error fetching movie:", err);
               setError(err);
            }
         };

         fetchMovie();
      }
   }, [id]);

   if (error) {
      return <div>Error: {error.message}</div>;
   }

   if (!movie) {
      return <div>Loading...</div>;
   }

   return (
      <div className="movieProfile">
         <div className="movieHeader">
            <Button
               className="modalClose"
               onClick={() => {
                  if (socket.current) {
                     socket.current.close();
                     socket.current = null;
                  }
                  navigate(-1);
               }}
            >
               Back
            </Button>
            <span className="modalTitle">{movie.title}</span>
            <span>({movie.release_date.slice(0, 4)})</span>
         </div>

         <div className="moviePoster">
            <img
               src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
               alt={movie.title}
            />
         </div>

         <div className="actors">
            <h2>Actors</h2>
            {actors.map((actor) => (
               <div className="actor" key={actor.id}>
                  <p>{actor.name}</p>
               </div>
            ))}
         </div>

         <div className="analyst">
            <h2>Sentiment Analysis</h2>
            <Line data={data} options={options} />
         </div>

         <div className="buttons">
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
               style={{ marginTop: "10px", marginLeft: "10px" }}
               variant="contained"
               endIcon={<AnalyzeIcon />}
               onClick={() => {
                  resetData();
                  handleAnalyze();
               }}
            >
               Analyse
            </Button>
         </div>

         <div className="sentimentDetails">
            <h2>Sentiment Details</h2>
            <ul>
               {sentiments
                  .slice()
                  .reverse()
                  .map((sentiment, index) => (
                     <li key={index}>
                        <strong>Score:</strong> {sentiment.score} -{" "}
                        <strong>Reason:</strong> {sentiment.reason}
                     </li>
                  ))}
            </ul>
         </div>
      </div>
   );
};

export default MovieProfile;
