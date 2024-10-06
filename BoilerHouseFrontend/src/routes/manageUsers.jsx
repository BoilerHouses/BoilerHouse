import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';








const ManageUsers = () => {
const [searchTerm, setSearchTerm] = useState('');
const navigate = useNavigate();
const [users, setUsers] = useState([]);
const [error, setError] = useState(false)


// fetch all users when view loads
useEffect(() => {
  const token = localStorage.getItem('token')
  if (token){
      axios.get('http://127.0.0.1:8000/api/getAllUsers', {
          headers:{
              'Authorization':token
          }
      })
      .then(response => {
          setUsers(response.data)
      })
      .catch(err => {
          setError(true)
      })
  }
  else {
       console.log("here")
       setError(true)
  }
}, [])












// Filter users based on the search term
const filteredUsers = users.filter(
  (user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
);




// Function to handle deleting a user
const handleDelete = (email) => {
  const userConfirmed = window.confirm("Are you sure you want to delete this user?");
  if (userConfirmed) {
      const token = localStorage.getItem('token')
      if (token){
          axios.get('http://127.0.0.1:8000/api/deleteUser', {
              params:{
                  username:email
              },
              headers:{
                  'Authorization':token
              },
          })
          .then(response => {
              const newUsers = users.filter((user) => user.username != email)
              setUsers(newUsers)
          })
          .catch(err => {
              console.log(err)
          })
      }
  }
};




// Function to handle row click
const handleRowClick = (user) => {
      navigate(`/profile/${user.username}`)
};


const UnauthorizedMessage = () => {
   return (
     <div className="h-screen flex items-center justify-center bg-gray-100">
       <div className="bg-red-600 text-white text-2xl p-10 rounded-lg text-center">
         You are not authorized to view this page
       </div>
     </div>
   );
 };


 if (error){
   return UnauthorizedMessage()
 }
 else {


return (
  <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          marginBottom: '20px',
          fontSize: '16px',
          outline: 'none',
        }}
      />




      {/* User List */}
      <div style={{ borderRadius: '10px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', padding: '10px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Action</th>
              <th></th> {/* Empty header for delete button */}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.username}
                  style={{
                    borderRadius: '10px',
                    backgroundColor: '#f9f9f9',
                    marginBottom: '10px',
                    padding: '12px',
                    cursor: 'pointer', // Makes the row look clickable
                  }}
                  onClick={() => handleRowClick(user)} // Handle row click
                >
                  <td style={{ padding: '12px', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                    {user.name}
                  </td>
                  <td style={{ padding: '12px' }}>{user.username}</td>
                  <td style={{ padding: '12px', borderTopRightRadius: '10px', borderBottomRightRadius: '10px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click when delete is clicked
                        handleDelete(user.username);
                      }}
                      style={{
                        backgroundColor: 'red',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'gray', padding: '20px' }}>
                  No users found
                </td>
              </tr>)
            }
          </tbody>
        </table>
      </div>
    </div>
  </div>
);}
};




export default ManageUsers;

