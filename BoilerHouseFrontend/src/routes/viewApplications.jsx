import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  CircularProgress,
  Typography,
  Box,
  Chip,
  Avatar
} from '@mui/material';

const ViewApplications = () => {
    const [clubList, setClubList] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        // Fetch club information when the component loads
        axios.defaults.headers.common["Authorization"] = localStorage.getItem("token")
        axios.get(`http://127.0.0.1:8000/api/clubs/`, {
          params: {
            approved: 'False'
          }
        })  
        .then((response) => {
          setClubList(response.data.clubs);
          console.log(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("There was an error fetching the club data!", error);
          setIsLoading(false);
        });
      }, []);

      const handleClub = (event) => {
        navigate(`/club/${event.target.getAttribute('index')}`)
      }
    
      if (isLoading) {
        return <CircularProgress />;
      }
      return (
        <div className="flex flex-col items-center justify-center">
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
                Clubs Applications ({clubList.length}):
            </Typography>
                {clubList.map((club) => (
                    <div
                        index={club.k}
                        key={club.k}
                        className="flex items-center bg-gray-100 rounded-lg p-2 mb-2 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500 w-[90%]"
                        style={{ maxWidth: 'calc(100% - 8px)', overflow: 'hidden' }} // Prevent overflow
                        onClick={handleClub}
                    >
                        <img
                            src={club.icon || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7mMNz8YCBvYmnr3BQUPX__YsC_WtDuAevwg&s'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                        />
                        <span className="ml-4 text-black font-semibold">Club:</span>
                        <span className="ml-4 text-black">{club.name}</span>
                        <span className="ml-4 text-black font-semibold">Owner:</span>
                        <span className="ml-4 text-black">{club.owner}</span>
                    </div>
                ))}
        </div>
    );
    
}
export default ViewApplications;