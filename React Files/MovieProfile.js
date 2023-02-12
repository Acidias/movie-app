import React, { useState, useEffect } from 'react'
import './popup.css'
import axios from 'axios';
import RingLoader from "react-spinners/RingLoader";

const MovieProfile = ({ movie, close }) => {
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generateStory() {
      try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
          model: 'text-davinci-003',
          prompt: `Write a story about "${movie.Title}" movie`,
          temperature: 0.5,
          max_tokens: 500,
        }, {
          headers: {
            'Authorization': `Bearer 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`,
            'Content-Type': 'application/json',
          },
        });
        setStory(response.data.choices[0].text);
        setLoading(false);
      } catch (error) {
        console.error('error:' + error);
      }
    }

    generateStory();
  }, [movie.Title]);

  return (
    <div className='overlay'>
      <div className='modalContainer'>
        <button className="closeButton" onClick={close}>Close</button>
        <h1 className="modalTitle">{movie.Title}</h1>
        <img className="modalImage" src={movie.Poster} alt={movie.Title} />
        {loading ? <RingLoader color="#36d7b7" /> : <p>{story}</p>}
      </div>
    </div>
  );
};

export default MovieProfile;
