import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";

import axios from 'axios';
import { NavigateBeforeTwoTone } from '@mui/icons-material';

const OfficerAnswers = () => {
  const [qaData, setQaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { clubId, username } = useParams(); 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/club/officer/answers/${clubId}/${username}/`); // Replace with your endpoint
        setQaData(response.data); // Assuming response.data is an array of { question, answer }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Questions and Answers</h1>
      <div className="space-y-4">
        {qaData.map((item, index) => (
          <div key={index} className="p-4 border rounded shadow">
            <h2 className="font-semibold">{item.question}</h2>
            <p>{item.answer}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate(`/club/${clubId}`)}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Back to Home
      </button>
    </div>
  );
};

export default OfficerAnswers;
