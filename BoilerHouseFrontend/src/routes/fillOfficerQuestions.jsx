import React, { useState, useEffect } from 'react';
import {useParams, useNavigate} from 'react-router-dom'
import axios from 'axios'
const OfficerQuestions = ({ questions }) => {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const [answers, setAnswers] = useState({});
  const [questionSet, setQuestionSet] = useState([]);
  const [pairSet, setPairSet] = useState([]);

  const handleChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
    let a = pairSet
    a[index].answer = value
    setPairSet(a)
  };

  useEffect(() => {
    // Fetch club information when the component loads
    const token = localStorage.getItem("token");
    axios
      .get(`http://127.0.0.1:8000/api/club/officer/${clubId}/questions/get/`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        console.log(response.data)
        setQuestionSet(response.data.questions)
        let pairSet = []
        response.data.questions.forEach(element => {
            pairSet.push({question: element.text, answer: ''})
        });
        setPairSet(pairSet)
      })
      .catch((error) => {
        console.error("There was an error fetching the club data!", error);
        alert("There was an error fetching the club data!")
      });
  }, [clubId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(pairSet)
    const data = {
        response: pairSet
    }
    const token = localStorage.getItem("token");

    axios.post(`http://127.0.0.1:8000/api/club/officer/answers/${clubId}/set/`, data, {
        headers: {
            Authorization: token,
          }
    }).then((response) => {
        navigate(`/club/${clubId}`)
      })
      .catch((error) => {
        alert("There was an error saving your responses!")
      });
    
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {questionSet.map((question, index) => (
        <div key={index} className="flex flex-col">
          <label className="text-lg">
            {index + 1}. {question.text}
            {question.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={answers[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            className="mt-1 p-2 border rounded"
            required={question.required}
          />
        </div>
      ))}
      <button
        type="submit"
        className="mt-4 p-2 bg-blue-500 text-white rounded"
      >
        Submit
      </button>
    </form>
  );
};

export default OfficerQuestions;
