import React, { useState, useEffect } from 'react';
import {useParams, useNavigate} from 'react-router-dom'
import axios from "axios";
const Questionnaire = () => {
  const navigate = useNavigate();
  const { clubId } = useParams(); // Get club ID from the route parameters
  const [questions, setQuestions] = useState([{ text: "What's your name?", required: true }]);
  const [on, setOn] = useState(false);

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
        
        if(Array.isArray(response.data.questions)) {
          setQuestions(response.data.questions)
          setOn(response.data.on)
        }
        console.log(questions)
      })
      .catch((error) => {
        console.error("There was an error fetching the club data!", error);
      });
  }, [clubId]);

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].text = value;
    setQuestions(newQuestions);
  };

  const handleRequiredChange = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].required = !newQuestions[index].required;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    if (questions.length >= 15) {
      alert('You can have up to 15 questions!');
      return;
    }
    setQuestions([...questions, { text: '', required: false }]);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = (event) => {
    const token = localStorage.getItem('token')
    const data = {
        club: clubId,
        useQuestions: on,
        questions: questions
    }
    axios.post(`http://127.0.0.1:8000/api/club/questions/save/`, data, {
      headers:{
        'Authorization': token,
      },
      
    })
    .then((response) => {
        alert('Success!')
        navigate(`/club/${clubId}`)
    })
    .catch((error) => {
      console.error("There was an error fetching the club data!", error);
      setIsLoading(false);
    });
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-5 border border-gray-300 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Create a Questionnaire</h1>
      {questions.map((question, index) => (
        <div key={index} className="mb-4 flex items-center">
          <input
            type="text"
            value={question.text}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
            placeholder={`Question ${index + 1}`}
            maxLength={250} // Set character limit here
            className="w-full p-2 border border-gray-300 rounded mb-2 mr-2"
          />
          <label className="flex items-center mr-2">
            <input
              type="checkbox"
              checked={question.required}
              onChange={() => handleRequiredChange(index)}
              className="mr-1"
            />
            Required
          </label>
          <button
            onClick={() => removeQuestion(index)}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={addQuestion}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        + Add Question
      </button>
      <button className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition my-5"
        onClick={handleSubmit}>
        Submit
      </button>
      <label className="flex items-center mr-2">
        <input
          type="checkbox"
          checked={on}
          onChange={() => setOn(!on)}
          className="mr-1"
        />
        Require Questionnaire to Join Club
      </label>
    </div>
  );
};

export default Questionnaire;
