import React, { useState, useEffect } from 'react';
import {useParams, useNavigate} from 'react-router-dom'
import axios from 'axios'
const Questions = ({ questions }) => {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const [answers, setAnswers] = useState({});
  const [questionSet, setQuestionSet] = useState([]);

  const handleChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  useEffect(() => {
    // Fetch club information when the component loads
    const token = localStorage.getItem("token");
    axios
      .get(`http://127.0.0.1:8000/api/club/questions/fetch`, {
        headers: {
          Authorization: token,
        },
        params: {
          club: clubId,
        },
      })
      .then((response) => {
        setQuestionSet(response.data.questions)
      })
      .catch((error) => {
        console.error("There was an error fetching the club data!", error);
      });
  }, [clubId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredQuestions = questions.filter((q) => q.required);
    const emptyRequired = requiredQuestions.some((q, index) => !answers[index]);

    if (emptyRequired) {
      alert("Please answer all required questions.");
    } else {
      alert("Form submitted!");
      console.log(answers);
    }
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

export default Questions;
