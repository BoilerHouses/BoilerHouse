// ViewProfile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate, NavLink, useNavigate, useParams } from "react-router-dom";

const ViewProfile = () => {
 // Hardcoded user data
 const navigate = useNavigate()
 const { userId } = useParams();
 const [user, setUser] = useState({
   name: 'John Doe',
   email: 'john.doe@example.com',
   bio: 'A passionate student majoring in Computer Science. Loves coding and outdoor adventures.',
   grad_year: 2025,
   major: ['Computer Science'],
   profile_picture: 'https://via.placeholder.com/120', // Sample profile image URL
   interests: ['Jai']
 })
 const [loading, setLoading] = useState(false);
   useEffect(() => {
       const fetchProfile = async () => {
           const token = localStorage.getItem("token")
           if (token){
               const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
                   headers:{
                       'Authorization': token,
                   },
                   params:{
                        username:userId
                   }
               })
               console.log(response.data)
               setUser(response.data)
           }
       }
       fetchProfile()
   }, [])


   if (loading){
       return <div>Loading..</div>
   }
   else{
   return (
       <div className="relative border rounded-lg p-6 max-w-full mx-auto bg-gray-100 shadow-md">
       {/* Edit Profile Button */}
       <button className="absolute top-4 right-4 bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
       onClick={() => {navigate('/edit_profile')}}>
           Edit Profile
       </button>


       <div className="flex items-center mb-4">
           <img src={user.profile_picture} alt="Profile" className="w-24 h-24 rounded-full mr-6" /> {/* Increased size */}
           <h1 className="text-4xl font-bold">{user.name}</h1> {/* Increased font size */}
       </div>

       <p className="italic mb-4">{user.bio}</p>
       <div className="text-gray-800">
           <p>
           <strong>Major:</strong> {user.major.join(', ')}
           </p>
           <p>
           <strong>Graduation Year:</strong> {user.grad_year}
           </p>
           <p>
           <strong>Interests:</strong> {user.interests.join(', ')}
           </p>
       </div>
       <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-200"
        onClick={() => {
            localStorage.removeItem('token')
            navigate('/')}}>
           Log Out
        </button>
       </div>
   );}
};


export default ViewProfile;