import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Assuming you're using react-router for navigation
import axios from 'axios';
import {
  CircularProgress,
  Typography,
  Box,
  Chip,
  Avatar
} from '@mui/material';

const ClubInformation = () => {
  const { clubId } = useParams(); // Get club ID from the route parameters
  const [clubData, setClubData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch club information when the component loads
    axios.get(`http://127.0.0.1:8000/api/club/`, {
        params: {
            club_id: clubId
        }
    })
      .then((response) => {
        setClubData(response.data.club);
        console.log(response.data.club)
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the club data!", error);
        setIsLoading(false);
      });
  }, [clubId]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!clubData) {
    return <Typography variant="h6">Club not found!</Typography>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      {/* Club Icon */}
      <Avatar
        src={clubData.icon}
        alt={clubData.name}
        sx={{ width: 120, height: 120, marginBottom: 4 }}
      />

      {/* Club Name */}
      <Typography variant="h3" component="h1" gutterBottom>
        {clubData.name}
      </Typography>

      {/* Club Description */}
      <Typography variant="h6" gutterBottom>
        {clubData.description}
      </Typography>

      {/* Interests */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
        {clubData.interests && clubData.interests.map((interest, index) => (
          <Chip key={index} label={interest} sx={{ margin: '4px' }} />
        ))}
      </Box>

      {/* Officers and Members */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Officers: {clubData.officers.length}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Members: {clubData.members.length}
      </Typography>
    </Box>
  );
};

export default ClubInformation;
