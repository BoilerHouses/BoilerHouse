import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { NavLink } from "react-router-dom";

import axios from "axios";

const ViewClubs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState([])
    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    useEffect(() => {    
        const fetchProfile = async () => {
          const token = localStorage.getItem("token");
          if (token) {
            const response = await axios.get("http://127.0.0.1:8000/api/clubs/", {
              headers: {
                Authorization: token,
              },
              params: {
                approved: 'True'
              }
            });
            console.log(response.data)
            setData(response.data.clubs)
          }
        };
        fetchProfile();
      }, []);
      
      if (filteredData.length > 0) {
        return (
            <div className="container mx-auto p-5 max-w-3xl">
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 mb-5 border border-gray-300 rounded"  
            />
            <div className="grid grid-cols-2 gap-5 overflow-y-auto max-h-96">
                {filteredData.map(item => (
                <div
                    key={item.name}
                    className="relative h-48 rounded-lg bg-cover bg-center border border-gray-600	"
                    style={{ backgroundImage: `url("${item.icon}")` }}
                >
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-center p-2 rounded-b-lg">
                    <span>{item.name}</span>
                    </div>
                </div>
                ))}
            </div>
            </div>
        );
      } else {
        return  (
            <div className="container mx-auto p-5 max-w-3xl">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 mb-5 border border-gray-300 rounded"  
                />
                <div className="flex justify-center h-screen">
                     <p className="text-black text-center font-bold rounded-md">No clubs found matching criteria</p>
                </div>
            </div>
        );
      }
    };
export default ViewClubs;