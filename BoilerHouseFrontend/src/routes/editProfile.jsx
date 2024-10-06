import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Alert,
  Chip,
  Box,
  CircularProgress,
} from "@mui/material";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

const EditProfile = () => {
    const navigate = useNavigate()
    const [name, setName] = useState(null)
    const [username, setUserName] = useState(null)
    const [bio, setBio] = useState(null)
    const [grad_year, setGradYear] = useState(null)
    const [majors, setMajors] = useState([])
    const [major, setMajor] = useState("")
    const [interest, setInterest] = useState("")
    const [interests, setInterests] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [tagCount, setTagCount] = useState([])
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageURL, setSelectedImageURL] = useState(null);


  const handleImageChange = (event) => {
    const file = event.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setSelectedImageURL(imageUrl);
        setSelectedImage(file)
     }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token")
            if (token){
                const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
                    headers:{
                        'Authorization': token
                    }
                })
                let user = response.data
                user.major.forEach((majorElement) => {
                    let a = majors.filter((key, tag) => key == majorElement)
                    if (a.length > 0) {
                        return
                    }
                    setMajors((prevTags) => [...prevTags, (tagCount, majorElement)]);
                    setTagCount(tagCount + 1)
                })
                user.interests.forEach((interestElement) => {
                    let a = interests.filter((key, tag) => key == interestElement)
                    if (a.length > 0) {
                        return
                    }
                    setInterests((prevTags) => [...prevTags, (tagCount, interestElement)]);
                    setTagCount(tagCount + 1)
                })
                setUserName(user.email)
                setBio(user.bio)
                setGradYear(user.grad_year)
                setName(user.name)
            }
        }
        fetchProfile()
    }, [])


    const handleAddTag = (event) => {
        if (event.key === 'Enter' && major) {
            let a = majors.filter((key, tag) => key == major)
            if (a.length > 0) {
              setMajor('')
              return
            }
            setMajors((prevTags) => [...prevTags, (tagCount, major)]);
            setTagCount(tagCount + 1)
            setMajor('');
        }
    };

    const handleAddInterest = (event) => {
      if (event.key === 'Enter' && interest) {
          let a = interests.filter((key, tag) => key == interest)
          if (a.length > 0) {
            setInterest('')
            return
          }
          setInterests((prevTags) => [...prevTags, (tagCount, interest)]);
          setTagCount(tagCount + 1)
          setInterest('');
      }
  };

    const handleDeleteTag = (tagToDelete) => {
        setMajors((prevTags) => prevTags.filter((key, tag) => tag !== tagToDelete));
    };

    const handleDeleteInterest = (tagToDelete) => {
      setInterests((prevTags) => prevTags.filter((key, tag) => tag !== tagToDelete));
  };

    const handleSubmit = (event) => {
      event.preventDefault(); // Prevent page refresh
      setIsLoading(true)
      if (majors.length == 0) {
        alert("Must Enter a Major!")
        setIsLoading(false)
        return
      }
      const formData = new FormData();
      if (selectedImage != null) {
        formData.append('profile_picture', selectedImage)
      }
      majors.filter((key, tag) => key).forEach((i, e) => {
        formData.append(`major[${e}]`, i)
      })
      interests.filter((key, tag) => key).forEach((i, e) => {
        formData.append(`interest[${e}]`, i)
      })
      formData.append('name', name);
      formData.append('bio', bio);
      formData.append('grad_year', grad_year)
      axios.defaults.headers.common["Authorization"] = localStorage.getItem("token")
      axios.post("http://127.0.0.1:8000/api/user/edit/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((res) => {
        setIsLoading(false);
        navigate('/profile')
      })
      // Catch errors if any
      .catch((err) => {
        setIsLoading(false);
        alert("error")
      })
    }
    const handleNameChange = (event) => {
      setName(event.target.value)
    }
    const handleBioChange = (event) => {
      setBio(event.target.value)
    }
    const handleYearChange = (event) => {
      const year = parseInt(event.target.value, 10)
      if (isNaN(year)) {
        alert("Grad Year must be a number")
        setGradYear(2026)
      } else {
        setGradYear(event.target.value)
      }
    }
    const handleMajorChange = (event) => {
      setMajor(event.target.value)
    }

    const handleInterestChange = (event) => {
      setInterest(event.target.value)
    }

    const handleStopSubmission = (event) => {
      if (event.key == 'Enter') {
        event.preventDefault()
      }
      
    }

    return (
        <div className="flex items-center justify-center my-14">
          <Card className="w-full max-w-md">
            <CardContent>
              <Typography variant="h5" component="h2" className="mb-4 text-center">
                Edit Profile
              </Typography>
              <p className="text-gray-700 mb-2">User: {username}</p>
              <form onSubmit={handleSubmit}  onKeyDown={handleStopSubmission} className="space-y-4">
                <TextField
                  fullWidth
                  label="Enter your new Name..."
                  name="name"
                  value={name}
                  onChange={handleNameChange}
                  className="bg-white !my-3.5"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Enter a new bio..."
                  name="bio"
                  value={bio}
                  onChange={handleBioChange}
                  className="bg-white !my-3.5"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Enter your new Graduation Year..."
                  name="grad_year"
                  value={grad_year}
                  onChange={handleYearChange}
                  className="bg-white !mt-3.5"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Enter your Majors..."
                  name="majors"
                  value={major}
                  onKeyDown={handleAddTag}
                  onChange={handleMajorChange}
                  className="bg-white !mt-3.5"
                />
                <Box sx={{ mt: 1, display:  'flex', flexWrap: 'wrap' }}>
                {majors.map((key, tag) => (
                    <Chip
                        key={tag}
                        label={key}
                        onDelete={() => handleDeleteTag(tag)}
                        sx={{
                            backgroundColor: 'gray',
                            color: 'black',
                            borderRadius: '16px',
                            margin: '4px',
                        }}
                    />
                ))}
              </Box>
              <TextField
                  fullWidth
                  label="Enter your Interests..."
                  name="interests"
                  value={interest}
                  onKeyDown={handleAddInterest}
                  onChange={handleInterestChange}
                  className="bg-white !mt-3.5"
                />
                <Box sx={{ mt: 1, display:  'flex', flexWrap: 'wrap' }}>
                {interests.map((key, tag) => (
                    <Chip
                        key={tag}
                        label={key}
                        onDelete={() => handleDeleteInterest(tag)}
                        sx={{
                            backgroundColor: 'gray',
                            color: 'black',
                            borderRadius: '16px',
                            margin: '4px',
                        }}
                    />
                ))}
              </Box>
              <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h6">Upload a Profile Picture</Typography>
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
      <label htmlFor="upload-button">
        <Button variant="contained" component="span">
          Upload Image
        </Button>
      </label>
    </Box>
              <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  className="mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
}
export default EditProfile;