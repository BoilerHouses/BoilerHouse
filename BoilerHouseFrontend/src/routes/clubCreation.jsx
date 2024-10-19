import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Chip,
  Box, Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";


const ClubApplication = () => {
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interest, setInterest] = useState("");
  const [interests, setInterests] = useState([]);
  const [tagCount, setTagCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageURL, setSelectedImageURL] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const navigate = useNavigate();
  const [culture, setCulture] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 5000000000) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImageURL(imageUrl);
      setSelectedImage(file);
    } else {
      alert("File too large or could not be found!");
    }
  };

  const handleGalleryChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 10) {
      alert("You can only upload up to 10 images.");
      return;
    }
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setGalleryImages(files);
    setGalleryPreviews(imagePreviews);
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

  const handleCultureChange = (e) => {
    setCulture(e.target.value);
  };

  const handleTimeCommitmentChange = (e) => {
    setTimeCommitment(e.target.value);
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

  const handleStopSubmission = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent page refresh
    setIsLoading(true);
    if (interests.length === 0) {
      alert("Must Enter at Least One Interest!");
      setIsLoading(false);
      return;
    }
    const formData = new FormData();
    if (selectedImage != null) {
      formData.append("icon", selectedImage);
    } else {
      alert("Must Upload Icon!");
      setIsLoading(false);
      return;
    }

    interests.forEach((interest, index) => {
      formData.append(`interest[${index}]`, interest);
    });
    formData.append("name", clubName);
    formData.append("description", description);
    formData.append("culture", culture);
    formData.append("time_commitment", timeCommitment);
    galleryImages.forEach((image, index) => {
      formData.append(`gallery[${index}]`, image);
    });

    axios.defaults.headers.common["Authorization"] = localStorage.getItem("token");
    axios
      .post("http://127.0.0.1:8000/api/club/save/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setIsLoading(false);
        console.log(res);
        alert("Application Submitted");
        navigate("/clubs");
      })
      .catch((err) => {
        setIsLoading(false);
        const serverAlert = document.querySelector("#server-error-alert");
        serverAlert.classList.remove("hidden");
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  from-yellow-500 to-white p-8" style={{ paddingTop: "2rem" }}>
      <Typography
        variant="h2"
        component="h1"
        className="font-bold mb-6 text-center"
        style={{ fontSize: "4rem", letterSpacing: "2px", color: "black", fontWeight: "900", marginTop: "2rem" }}
      >
        Club Application
      </Typography>

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
                style: { color: "black", fontSize: "1.2rem" },
              }}
              InputProps={{
                style: {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "black",
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
                style: { color: "black", fontSize: "1.2rem" },
              }}
              InputProps={{
                style: {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "black",
                },
              }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Club Culture"
              variant="filled"
              value={culture}
              onChange={handleCultureChange}
              InputLabelProps={{
                style: { color: "black", fontSize: "1.2rem" },
              }}
              InputProps={{
                style: {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "black",
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="filled">
              <InputLabel style={{ color: "black", fontSize: "1.2rem" }}>Time Commitment (per week)</InputLabel>
              <Select
                value={timeCommitment}
                onChange={handleTimeCommitmentChange}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "black",
                }}
              >
                <MenuItem value={"1-5 hours"}>1-5 hours</MenuItem>
                <MenuItem value={"6-10 hours"}>6-10 hours</MenuItem>
                <MenuItem value={"11-15 hours"}>11-15 hours</MenuItem>
                <MenuItem value={"16+ hours"}>16+ hours</MenuItem>
              </Select>
            </FormControl>
          </Grid>

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
                style: { color: "black", fontSize: "1.2rem" },
              }}
              InputProps={{
                style: {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "black",
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
                    backgroundColor: "lightblue",
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
              style={{ display: "none" }}
              id="upload-button"
            />

            {selectedImageURL && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <img
                  src={selectedImageURL}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }}
                />
              </Box>
            )}
            <label htmlFor="upload-button">
              <Button variant="contained" component="span" sx={{ display: "flex", justifyContent: "center" }}>
                Upload Club Icon
              </Button>
            </label>
          </Grid>

          <Grid item xs={12}>
            <input
              accept="image/*"
              multiple
              type="file"
              onChange={handleGalleryChange}
              style={{ display: "none" }}
              id="gallery-upload"
            />
            <label htmlFor="gallery-upload">
              <Button variant="contained" component="span" sx={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                Upload Gallery Images (Max 10)
              </Button>
            </label>

            <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
              {galleryPreviews.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Gallery Preview ${index}`}
                  style={{ width: "150px", height: "150px", margin: "0.5rem", objectFit: "cover", borderRadius: "8px" }}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <div id="server-error-alert" className="hidden">
              <Alert severity="error">
                A server error occurred. Please try again later.
              </Alert>
            </div>
            <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                className="mt-4"
                style={{
                  backgroundColor: "#ff4081",
                  fontSize: "1.2rem",
                  letterSpacing: "1px",
                  fontWeight: "bold",
                  color: "white",
                }}
            >
              {isLoading ? <CircularProgress color="inherit"/> : "Submit"}
            </Button>
          </Grid>
        </Grid>
      </form>

      <NavLink to="/clubs">
        <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: "#fff",
              textDecoration: "underline",
          }}
        >
          Go back to Clubs List
        </Typography>
      </NavLink>
    </div>
  );
};

export default ClubApplication;
