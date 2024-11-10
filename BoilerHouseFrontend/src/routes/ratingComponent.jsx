import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Rating, Box } from "@mui/material";
import axios from "axios";
const RatingForm = ({clubId}) => {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = {
        review: review,
        rating: rating
    }
    axios
      .post(`http://127.0.0.1:8000/api/rating/create/${clubId}/`, data, {
        headers: {
          Authorization: token,
        }
        
      })
      .then((response) => {
        console.log(response);
        navigate(0);
      })
      .catch((error) => {
        console.error("There was an error creating your rating!", error);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="w-2/3 mx-auto p-6 bg-gray-100 mt-10 rounded-lg shadow-md">
      <Box className="mb-4">
        <TextField
          label="Review"
          multiline
          minRows={3}
          variant="outlined"
          fullWidth
          value={review}
          onChange={(e) => setReview(e.target.value)}
          required
        />
      </Box>

      <Box className="flex items-center mb-4">
        <label className="mr-4 text-lg font-semibold">Rating:</label>
        <Rating
          name="star-rating"
          value={rating}
          precision={0.5}
          onChange={(event, newValue) => setRating(newValue)}
          className="text-yellow-500"
        />
        <span className="ml-2 text-lg font-semibold">{rating}</span>
      </Box>

      <Button type="submit" variant="contained" color="primary" fullWidth className="mt-4">
        Submit Rating
      </Button>
    </form>
  );
};

export default RatingForm;
