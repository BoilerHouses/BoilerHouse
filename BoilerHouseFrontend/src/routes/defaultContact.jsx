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

const DefaultContact = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [culture, setCulture] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  const [email, setEmail] = useState(""); // New state for email
  const [emailError, setEmailError] = useState(""); // New state for email error
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
          },
        });
        const clubData = response.data;
        setCulture(clubData.culture);
        setTimeCommitment(clubData.time_commitment);
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      setEmailError(""); // Clear any existing error if email is valid
    }

    setIsLoading(true);

    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/club/update/`,
        {
          club_id: clubId,
          culture: culture,
          time_commitment: timeCommitment,
          email: email,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

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
            Update Contact Info
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Club Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
              className="bg-white !my-3.5"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="Club Phone Number"
              value={culture}
              onChange={(e) => setCulture(e.target.value)}
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

export default DefaultContact;
