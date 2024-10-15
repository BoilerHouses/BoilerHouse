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
    const [searchTerm, setSearchTerm] = useState('')
    const filteredClubs = clubList.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const navigate = useNavigate()
    useEffect(() => {
        // Fetch club information when the component loads
        setIsLoading(true)
        axios.defaults.headers.common["Authorization"] = localStorage.getItem("token")
        axios.get(`http://127.0.0.1:8000/api/clubs/`, {
          params: {
            approved: 'False'
          }
        })  
        .then((response) => {
          setClubList(response.data.clubs);
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
      if(filteredClubs.length == 0) {
        return(
            <div className="flex flex-col items-center justify-center">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-[75%] p-3 mb-5 border border-gray-300 rounded mt-5"  
                    />
                    <div className="flex justify-center h-screen">
                        <p className="text-black text-center font-bold rounded-md">No clubs that match search criteria are pending approval</p>
                    </div>
                </div>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center">
            <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-[75%] p-3 mb-5 border border-gray-300 rounded mt-5"  
                    />
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
                Clubs Applications ({filteredClubs.length}):
            </Typography>
                {filteredClubs.map((club) => (
                    <div
                        index={club.k}
                        key={club.k}
                        className="flex items-center bg-gray-100 rounded-lg p-2 mb-2 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500 w-[90%]"
                        style={{ maxWidth: 'calc(100% - 8px)', overflow: 'hidden' }} // Prevent overflow
                        onClick={handleClub}
                    >
                        <img
                            index={club.k}
                            src={club.icon || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7mMNz8YCBvYmnr3BQUPX__YsC_WtDuAevwg&s'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                        />
                        <span className="ml-4 text-black font-semibold" index={club.k}>Club:</span>
                        <span className="ml-4 text-black" index={club.k}>{club.name}</span>
                        <span className="ml-4 text-black font-semibold" index={club.k}>Owner:</span>
                        <span className="ml-4 text-black" index={club.k}>{club.owner}</span>
                    </div>
                ))}
        </div>
    );
    
}
export default ViewApplications;