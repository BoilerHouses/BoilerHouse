import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EditClub = () => {
  const { clubId } = useParams(); // Assuming you're passing the club ID in the URL
  const navigate = useNavigate();
  const [culture, setCulture] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClubData = async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://127.0.0.1:8000/api/clubs/${clubId}/`, {
        headers: {
          Authorization: token,
        },
      });
      const club = response.data;
      setCulture(club.culture);
      setTimeCommitment(club.time_commitment);
    };
    
    fetchClubData();
  }, [clubId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("token");
    try {
      await axios.put(`http://127.0.0.1:8000/api/clubs/${clubId}/`, {
        culture,
        time_commitment: timeCommitment,
      }, {
        headers: {
          Authorization: token,
        },
      });
      setIsLoading(false);
      navigate(`/clubs/${clubId}/`); // Navigate back to the club detail page after submission
    } catch (error) {
      setIsLoading(false);
      alert("Error updating club information");
    }
  };

  return (
    <div className="flex items-center justify-center my-14">
      <Card className="w-full max-w-md">
        <CardContent>
          <Typography variant="h5" component="h2" className="mb-4 text-center">
            Edit Club
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Culture"
              value={culture}
              onChange={(e) => setCulture(e.target.value)}
              className="bg-white !my-3.5"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="Time Commitment"
              value={timeCommitment}
              onChange={(e) => setTimeCommitment(e.target.value)}
              className="bg-white !my-3.5"
              InputLabelProps={{
                shrink: true,
              }}
            />
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
};

export default EditClub;
