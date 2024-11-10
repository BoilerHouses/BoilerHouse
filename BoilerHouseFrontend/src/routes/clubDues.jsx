import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ClubDues = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [dues, setDues] = useState(""); // State to hold club dues amount
  const [clubDueName, setClubDueName] = useState(""); // State to hold due name
  const [clubDueDate, setClubDueDate] = useState(""); // State to hold due date
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
        console.log(clubData);
        if (clubData) {
          setDues(clubData.clubDues ? clubData.clubDues.toString() : "");
          setClubDueName(clubData.dueName || ""); // Pre-fill if data is available
          setClubDueDate(clubData.dueDate || ""); // Pre-fill if data is available
        }
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

    // Validate inputs
    if (!clubDueName || isNaN(dues) || dues === "" || parseFloat(dues) < 0 || !clubDueDate) {
      alert("Please enter valid values for all fields.");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/club/${clubId}/clubDues`,
        {
          club_id: clubId,
          dueName: clubDueName,
          clubDues: parseFloat(dues), // Convert to a float to ensure numeric value
          dueDate: clubDueDate,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.status === 200) {
        alert(response.data.message); // Display success message from backend
        setIsLoading(false);
        navigate(`/club/${clubId}`);
      } else {
        setIsLoading(false);
        console.error("Server error:", response.data);
        alert("Error updating club dues: " + response.data.error);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error updating club dues:", error);
      alert("Error updating club dues");
    }
  };

  return (
    <div className="flex items-center justify-center my-14">
      <Card className="w-full max-w-md">
        <CardContent>
          <Typography variant="h5" component="h2" className="mb-4 text-center">
            Update Club Dues
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Due Name"
              value={clubDueName}
              onChange={(e) => setClubDueName(e.target.value)}
              className="bg-white !my-3.5"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="Club Dues"
              type="number" // Set input type to number to restrict non-numeric input
              value={dues} // Display current dues value
              onChange={(e) => setDues(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              className="bg-white !my-3.5"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="Due Date"
              type="date" // Set input type to date for a date picker
              value={clubDueDate}
              onChange={(e) => setClubDueDate(e.target.value)}
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
                "Set Dues"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubDues;
