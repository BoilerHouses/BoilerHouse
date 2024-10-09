import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Chip,
  Box,
} from "@mui/material";

const ClubApplication = () => {
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interest, setInterest] = useState("");
  const [interests, setInterests] = useState([]);
  const [tagCount, setTagCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageURL, setSelectedImageURL] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
      if (file && file.size <= 5120) {
        const imageUrl = URL.createObjectURL(file);
        setSelectedImageURL(imageUrl);
        setSelectedImage(file)
     } else {
      alert('File too large or could not be found!')
     }
    };

  const handleClubNameChange = (e) => {
    setClubName(e.target.value);
  };

  const handleAddInterest = (event) => {
    if (event.key === "Enter" && interest) {
      let a = interests.filter((key) => key === interest);
      if (a.length > 0) {
        setInterest("");
        return;
      }
      setInterests((prevTags) => [...prevTags, interest]);
      setTagCount(tagCount + 1);
      setInterest("");
    }
  };

  const handleDeleteInterest = (tagToDelete) => {
    setInterests((prevTags) => prevTags.filter((_, tag) => tag !== tagToDelete));
  };

  const handleInterestChange = (event) => {
    setInterest(event.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate an API call
    setTimeout(() => {
      alert(`Club Name: ${clubName}, Description: ${description}`);
      setIsLoading(false);
    }, 1500);
  };

  const handleStopSubmission = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-500 to-white p-8" style={{ paddingTop: "2rem" }}>
      {/* Large Heading for Club Application */}
      <Typography
        variant="h2"
        component="h1"
        className="font-bold mb-6 text-center"
        style={{ fontSize: "4rem", letterSpacing: "2px", color: "black", fontWeight: "900", marginTop: "2rem" }}
      >
        Club Application
      </Typography>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} onKeyDown={handleStopSubmission} className="w-full max-w-lg">
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Club Name"
              variant="filled"
              value={clubName}
              onChange={handleClubNameChange}
              InputLabelProps={{
                style: { color: "white", fontSize: "1.2rem" },
              }}
              InputProps={{
                style: {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "white",
                },
              }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Club Description"
              variant="filled"
              value={description}
              onChange={handleDescriptionChange}
              multiline
              rows={4}
              InputLabelProps={{
                style: { color: "white", fontSize: "1.2rem" },
              }}
              InputProps={{
                style: {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "white",
                },
              }}
              required
            />
          </Grid>

          {/* Interest Input Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Enter your Interests..."
              name="interests"
              value={interest}
              onKeyDown={handleAddInterest}
              onChange={handleInterestChange}
              variant="filled"
              InputLabelProps={{
                style: { color: "white", fontSize: "1.2rem" },
              }}
              InputProps={{
                style: {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "white",
                },
              }}
            />
            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap" }}>
              {interests.map((key, tag) => (
                <Chip
                  key={tag}
                  label={key}
                  onDelete={() => handleDeleteInterest(tag)}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                    color: "black",
                    borderRadius: "16px",
                    margin: "4px",
                  }}
                />
              ))}
            </Box>
            <input
              accept="image/*"
              type="file"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="upload-button"
            />
      
      {selectedImageURL && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <img
            src={selectedImageURL}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
          />
        </Box>
      )}
      <label htmlFor="upload-button" >
        <Button variant="contained" component="span" sx={{display: 'flex', justifyContent: 'center'}}>
          Upload Image
        </Button>
      </label>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
              className="mt-4"
              style={{
                backgroundColor: "#ff4081",
                fontSize: "1.2rem",
                padding: "12px",
              }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Submit Application"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default ClubApplication;
