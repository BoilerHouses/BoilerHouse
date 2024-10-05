import { useState } from "react";
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
import { NavLink, useNavigate } from "react-router-dom";


const CreateProfile = () => {
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [grad_year, setGradYear] = useState("")
    const [majors, setMajors] = useState([])
    const [major, setMajor] = useState("")
    const [interest, setInterest] = useState("")
    const [interests, setInterests] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [tagCount, setTagCount] = useState([])

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
      console.log(event)
      setIsLoading(true)
      console.log(name)
    }
    const handleNameChange = (event) => {
      setName(event.target.value)
    }
    const handleBioChange = (event) => {
      setBio(event.target.value)
    }
    const handleYearChange = (event) => {
      setGradYear(event.target.value)
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
                Create Profile
              </Typography>
              <form onSubmit={handleSubmit}  onKeyDown={handleStopSubmission} className="space-y-4">
                <TextField
                  fullWidth
                  label="Enter your Name..."
                  name="name"
                  value={name}
                  required={true}
                  onChange={handleNameChange}
                  className="bg-white !my-3.5"
                />
                <TextField
                  fullWidth
                  label="Enter a bio..."
                  name="bio"
                  value={bio}
                  onChange={handleBioChange}
                  className="bg-white !my-3.5"
                />
                <TextField
                  fullWidth
                  label="Enter your Graduation Year..."
                  name="grad_year"
                  value={grad_year}
                  required={true}
                  onChange={handleYearChange}
                  className="bg-white !mt-3.5"
                />
                <TextField
                  fullWidth
                  label="Enter your Majors..."
                  name="majors"
                  value={major}
                  required={true}
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
export default CreateProfile;