import React, { useState } from 'react';

const Questions = ({ questions }) => {
  const [answers, setAnswers] = useState({});

  const handleChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

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
      {questions.map((question, index) => (
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
