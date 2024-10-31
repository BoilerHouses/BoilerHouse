import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EditClub = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [culture, setCulture] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClubData = async () => {
      if (!clubId) {
        console.error("Club ID is undefined");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://127.0.0.1:8000/api/club/${clubId}/edit/`, {
          headers: {
            Authorization: token,
          }
        });
        const clubData = response.data;
        setCulture(clubData.culture);
        setTimeCommitment(clubData.time_commitment);
        setTargetAudience(clubData.target_audience);
      } catch (error) {
        console.error("Error fetching club data:", error);
        if (error.response && error.response.status === 403) {
          alert("You don't have permission to edit this club");
          navigate(`/club/${clubId}`);
        }
      }
    };

    fetchClubData();
  }, [clubId, navigate]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/club/update/`, {
        club_id: clubId,
        culture: culture,
        time_commitment: timeCommitment,
        targetedAudience: targetAudience,
      }, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        setIsLoading(false);
        navigate(`/club/${clubId}`);
      } else {
        setIsLoading(false);
        console.error("Server error:", response.data);
        alert("Error updating club information: " + response.data.error);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error updating club information:", error);
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
            <FormControl fullWidth className="bg-white !my-3.5">
              <InputLabel id="time-commitment-label">Time Commitment (per week)</InputLabel>
              <Select
                labelId="time-commitment-label"
                value={timeCommitment}
                onChange={(e) => setTimeCommitment(e.target.value)}
                label="Time Commitment (per week)"
              >
                <MenuItem value={"1-5 hours"}>1-5 hours</MenuItem>
                <MenuItem value={"6-10 hours"}>6-10 hours</MenuItem>
                <MenuItem value={"11-15 hours"}>11-15 hours</MenuItem>
                <MenuItem value={"16+ hours"}>16+ hours</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Target Audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
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