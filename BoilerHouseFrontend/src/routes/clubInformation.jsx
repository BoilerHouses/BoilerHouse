import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress, Typography, Box, Chip, Avatar, Button } from "@mui/material";

const ClubInformation = () => {
  const navigate = useNavigate();
  const { clubId } = useParams(); // Get club ID from the route parameters
  const [clubData, setClubData] = useState(null);
  const [joined, setJoined] = useState(false);
  const [officer, setOfficer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const defaultPhotos = [
    "https://mauconline.net/wp-content/uploads/10-Tips-for-Marketing-to-College-Students-New.jpg",
    "https://impactgroupmarketing.com/Portals/0/xBlog/uploads/2023/1/3/Myproject(20).jpg",
    "https://concept3d.com/wp-content/uploads/2024/03/Group-of-college-friends-each-of-whom-represents-different-college-student-personas.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRuvDNp209LLZ3LjcuzRgX3vaacod7mOuX9w&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2dVbLMzlaeJnL5C6RpZ8HLRECJhH6ILEGKg&s",
    "https://img.freepik.com/free-photo/wide-angle-shot-single-tree-growing-clouded-sky-during-sunset-surrounded-by-grass_181624-22807.jpg",
    "https://st.depositphotos.com/2001755/3622/i/450/depositphotos_36220949-stock-photo-beautiful-landscape.jpg",
  ];

  useEffect(() => {
    // Fetch club information when the component loads
    const token = localStorage.getItem("token");
    axios
      .get(`http://127.0.0.1:8000/api/club/`, {
        headers: {
          Authorization: token,
        },
        params: {
          club_id: clubId,
        },
      })
      .then((response) => {
        setClubData(response.data.club);
        setIsLoading(false);
        setJoined(response.data.joined);
        setOfficer(response.data.officer);
        console.log(response.data.officer);
      })
      .catch((error) => {
        console.error("There was an error fetching the club data!", error);
        setIsLoading(false);
      });
  }, [clubId]);

  const handleMemberProfile = (event) => {
    if (
      event.target
        .getAttribute("index")
        .substring(event.target.getAttribute("index").length - 3) === "..."
    ) {
      return;
    }
    navigate(`/profile/${event.target.getAttribute("index")}`);
  };

  const handleMemberAdd = (event) => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://127.0.0.1:8000/api/club/join/approval/`, {
        headers: {
          Authorization: token,
        },
        params: {
          user: event.target
            .getAttribute("index")
            .substring(0, event.target.getAttribute("index").length - 3),
          club: clubId,
          approved: "Y",
        },
      })
      .then((response) => {
        window.location.reload();
      })
      .catch((error) => {
        console.error("There was an error with approval!", error);
        setIsLoading(false);
      });
  };

  const handleMemberDel = (event) => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://127.0.0.1:8000/api/club/join/approval/`, {
        headers: {
          Authorization: token,
        },
        params: {
          user: event.target
            .getAttribute("index")
            .substring(0, event.target.getAttribute("index").length - 3),
          club: clubId,
          approved: "N",
        },
      })
      .then((response) => {
        window.location.reload();
      })
      .catch((error) => {
        console.error("There was an error with approval!", error);
        setIsLoading(false);
      });
  };

  const handleApproval = (event) => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://127.0.0.1:8000/api/club/approve/`, {
        headers: {
          Authorization: token,
        },
        params: {
          club_id: clubId,
        },
      })
      .then((response) => {
        console.log(response.data.club);
        setClubData(response.data.club);
        setIsLoading(false);
        alert("success");
        navigate(`/clubs`);
      })
      .catch((error) => {
        console.error("There was an error fetching the club data!", error);
        setIsLoading(false);
      });
  };

  const handleJoin = (event) => {
    if(clubData.useQuestions) {
      navigate(`/questions/${clubId}`)
      return;
    }
    const token = localStorage.getItem("token");
    axios
      .get(`http://127.0.0.1:8000/api/club/join/`, {
        headers: {
          Authorization: token,
        },
        params: {
          club_name: clubData.name,
        },
      })
      .then((response) => {
        console.log(response.data.club);
        setClubData(response.data.club);
        setJoined(true);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("There was an error joining club!", error);
        alert("There was an error joining club!", error);
        setIsLoading(false);
      });
  };

  const handleDeny = (event) => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://127.0.0.1:8000/api/club/delete/`, {
        headers: {
          Authorization: token,
        },
        params: {
          club_id: clubId,
        },
      })
      .then((response) => {
        setIsLoading(false);
        navigate(`/clubs`);
      })
      .catch((error) => {
        console.error("There was an error fetching the club data!", error);
        setIsLoading(false);
      });
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!clubData) {
    return <Typography variant="h6">Club not found!</Typography>;
  }

  if (clubData.gallery.length == 0) {
    return (
        
        <Box
          sx={{
            padding: 4,
            backgroundColor: '#d0d8da', // Darker light gray background
            minHeight: '100vh', // Full height to cover the page
          }}
        >
          <div className='relative'>
            <button className={!clubData.is_approved ? "bg-green-500 absolute top-4 right-[5%] text-white font-bold py-2 px-4 rounded hover:bg-green-600" : "hidden"  }
                onClick={handleApproval}>
                Approve 
              </button>
              <button className={(clubData.is_approved && joined) ? "bg-green-500 absolute top-4 right-[5%] text-white font-bold py-2 px-4 rounded hover:bg-green-600" : "hidden"  }
                onClick={handleJoin}>
                Join Club 
              </button>
              <button className={(officer && joined && clubData.is_approved) ? "bg-blue-500 absolute top-10 right-[5%] text-white font-bold py-2 px-4 rounded hover:bg-blue-600" : "hidden"  }
                onClick={(event) => {navigate(`/createQuestions/${clubId}`)}}>
                Edit Questionnaire 
              </button>
              <button className={!clubData.is_approved ? "bg-red-500 absolute top-4 right-[13%] text-white font-bold py-2 px-4 rounded hover:bg-red-600" : "hidden"  }
                onClick={handleDeny}>
                Deny
              </button>
          </div>
          {/* Club Icon */}
          <Avatar
            src={clubData.icon}
            alt={clubData.name}
            sx={{
              width: 120,
              height: 120,
              marginBottom: 4,
              border: '2px solid #d1d5db', // Light border around avatar
            }}
          />
    
          {/* Club Name */}
          <Typography variant="h3" component="h1" gutterBottom color="black">
            {clubData.name}
          </Typography>
    
          {/* Club Description */}
          <Typography variant="h6" gutterBottom color="black">
            {clubData.description}
          </Typography>

          {/* Club Culture */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
            Culture:
          </Typography>
          <Typography variant="body1" gutterBottom color="black">
            {clubData.culture || "No culture information provided."}
          </Typography>

          {/* Club Time Commitment */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
            Time Commitment:
          </Typography>
          <Typography variant="body1" gutterBottom color="black">
            {clubData.time_commitment || "No time commitment information provided."}
          </Typography>
    
          {/* Interests */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
            Tags:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
            {clubData.interests && clubData.interests.map((interest, index) => (
              <Chip
                key={index}
                label={interest}
                sx={{ margin: '4px', backgroundColor: '#facc15', color: 'black' }} // Yellow-500
              />
            ))}
          </Box>
          
          {/* Officers Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
            Officers ({clubData.officers.length}):
          </Typography>
          
          <div className="overflow-y-auto max-h-60 w-1/4 bg-white rounded-lg shadow-md pl-3 p-2">
            {clubData.officers.map((profile, index) => (
              <div
                index={profile[3]}
                key={index}
                onClick={handleMemberProfile}
                className="flex items-center bg-gray-100 rounded-lg p-2 mb-2 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500"
                style={{ maxWidth: 'calc(100% - 8px)', overflow: 'hidden' }} // Prevent overflow
              >
                <img
                  index={profile[3]}
                  src={profile[2] || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7mMNz8YCBvYmnr3BQUPX__YsC_WtDuAevwg&s'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                />
                <span className="ml-4 text-black font-semibold"  index={profile[3]}>{profile[1]}</span>
              </div>
            ))}
          </div>
    
          {/* Members Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
            Members ({clubData.members.length}):
          </Typography>
          <div className="overflow-y-auto max-h-60 w-1/4 bg-white rounded-lg shadow-md pl-3 p-2">
            {clubData.members.map((profile, index) => (
              <div
                index={profile[3]}
                key={index}
                onClick={handleMemberProfile}
                className="flex items-center bg-gray-100 rounded-lg p-2 mb-2 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500"
                style={{ maxWidth: 'calc(100% - 8px)', overflow: 'hidden' }} // Prevent overflow
              >
                <img
                  index={profile[3]}
                  src={profile[2] || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7mMNz8YCBvYmnr3BQUPX__YsC_WtDuAevwg&s'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                />
                <span className="ml-4 text-black font-semibold" index={profile[3]}>{profile[1]}</span>
              </div>
            ))}
          </div>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black" className={(officer && clubData.pending_members.length>0) ? 'black' : 'hidden'}>
        Pending Members ({clubData.pending_members.length}):
      </Typography>
      <div className={(officer && clubData.pending_members.length>0) ? "overflow-y-auto max-h-60 w-1/4 bg-white rounded-lg shadow-md pl-3 p-2" : 'hidden'}>
        {clubData.pending_members.map((profile, index) => (
          <div
            index={profile[3]}
            key={index}
            onClick={handleMemberProfile}
            className="flex items-center bg-gray-100 rounded-lg p-2 mb-2 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500"
            style={{ maxWidth: 'calc(100% - 8px)', overflow: 'hidden' }} // Prevent overflow
          >
            <img
              index={profile[3]}
              src={profile[2] || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7mMNz8YCBvYmnr3BQUPX__YsC_WtDuAevwg&s'}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
            />
            <span className="ml-4 text-black font-semibold" index={profile[3]}>{profile[1]}</span>
            <button className={"bg-green-500 right-[13%] ml-5 px-1 py-1 text-white font-bold rounded hover:bg-green-600"}
              index={profile[3] + '...'}
              onClick={handleMemberAdd}>
                Approve
            </button>
            <button className={"bg-red-500 right-[13%] ml-5 px-1 py-1 text-white font-bold rounded hover:bg-red-600"}
                index={profile[3] + '...'}
                onClick={handleMemberDel}>
                Deny
            </button>
          </div>
        ))}
      </div>
          {/* Photos Gallery Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
            Photo Gallery
          </Typography>
          <div className="overflow-x-auto bg-gray-200 p-4 rounded-lg w-1/1">
            <div className="flex space-x-4">
              {defaultPhotos && defaultPhotos.map((photo, index) => (
                <div key={index} className="min-w-[200px]">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="rounded-lg shadow-md h-[150px] object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
        </Box>
      );
  }

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#d0d8da", // Darker light gray background
        minHeight: "100vh", // Full height to cover the page
      }}
    >
      <div className="relative">
        <button
          className={
            !clubData.is_approved
              ? "bg-green-500 absolute top-4 right-[5%] text-white font-bold py-2 px-4 rounded hover:bg-green-600"
              : "hidden"
          }
          onClick={handleApproval}
        >
          Approve
        </button>
        <button
          className={
            clubData.is_approved && !joined
              ? "bg-green-500 absolute top-4 right-[5%] text-white font-bold py-2 px-4 rounded hover:bg-green-600"
              : "hidden"
          }
          onClick={handleJoin}
        >
          Join Club
        </button>
        <button
          className={
            !clubData.is_approved
              ? "bg-red-500 absolute top-4 right-[13%] text-white font-bold py-2 px-4 rounded hover:bg-red-600"
              : "hidden"
          }
          onClick={handleDeny}
        >
          Deny
        </button>
      </div>
      {/* Club Icon */}
      <Avatar
        src={clubData.icon}
        alt={clubData.name}
        sx={{
          width: 120,
          height: 120,
          marginBottom: 4,
          border: "2px solid #d1d5db", // Light border around avatar
        }}
      />

      {/* Create meetings section*/}
      <div className="absolute right-4">
        <Button
          variant="contained"
          color="primary"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Create New Meeting
        </Button>
      </div>

      {/* Club Culture */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
        Culture:
      </Typography>
      <Typography variant="body1" gutterBottom color="black">
        {clubData.culture || "No culture information provided."}
      </Typography>

      {/* Club Time Commitment */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
        Time Commitment:
      </Typography>
      <Typography variant="body1" gutterBottom color="black">
        {clubData.time_commitment || "No time commitment information provided."}
      </Typography>

      

      {/* Interests */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
        Tags:
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", mt: 2 }}>
        {clubData.interests &&
          clubData.interests.map((interest, index) => (
            <Chip
              key={index}
              label={interest}
              sx={{
                margin: "4px",
                backgroundColor: "#facc15",
                color: "black",
              }} // Yellow-500
            />
          ))}
      </Box>

      {/* Officers Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
        Officers ({clubData.officers.length}):
      </Typography>

      <div className="overflow-y-auto max-h-60 w-1/4 bg-white rounded-lg shadow-md pl-3 p-2">
        {clubData.officers.map((profile, index) => (
          <div
            index={profile[3]}
            key={index}
            onClick={handleMemberProfile}
            className="flex items-center bg-gray-100 rounded-lg p-2 mb-2 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500"
            style={{ maxWidth: "calc(100% - 8px)", overflow: "hidden" }} // Prevent overflow
          >
            <img
              index={profile[3]}
              src={
                profile[2] ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7mMNz8YCBvYmnr3BQUPX__YsC_WtDuAevwg&s"
              }
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
            />
            <span className="ml-4 text-black font-semibold" index={profile[3]}>
              {profile[1]}
            </span>
          </div>
        ))}
      </div>

      {/* Members Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
        Members ({clubData.members.length}):
      </Typography>
      <div className="overflow-y-auto max-h-60 w-1/4 bg-white rounded-lg shadow-md pl-3 p-2">
        {clubData.members.map((profile, index) => (
          <div
            index={profile[3]}
            key={index}
            onClick={handleMemberProfile}
            className="flex items-center bg-gray-100 rounded-lg p-2 mb-2 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500"
            style={{ maxWidth: "calc(100% - 8px)", overflow: "hidden" }} // Prevent overflow
          >
            <img
              index={profile[3]}
              src={
                profile[2] ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7mMNz8YCBvYmnr3BQUPX__YsC_WtDuAevwg&s"
              }
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
            />
            <span className="ml-4 text-black font-semibold" index={profile[3]}>
              {profile[1]}
            </span>
          </div>
        ))}
      </div>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ mt: 4 }}
        color="black"
        className={
          officer && clubData.pending_members.length > 0 ? "black" : "hidden"
        }
      >
        Pending Members ({clubData.pending_members.length}):
      </Typography>
      <div
        className={
          officer && clubData.pending_members.length > 0
            ? "overflow-y-auto max-h-60 w-1/4 bg-white rounded-lg shadow-md pl-3 p-2"
            : "hidden"
        }
      >
        {clubData.pending_members.map((profile, index) => (
          <div
            index={profile[3]}
            key={index}
            onClick={handleMemberProfile}
            className="flex items-center bg-gray-100 rounded-lg p-2 mb-2 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500"
            style={{ maxWidth: "calc(100% - 8px)", overflow: "hidden" }} // Prevent overflow
          >
            <img
              index={profile[3]}
              src={
                profile[2] ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7mMNz8YCBvYmnr3BQUPX__YsC_WtDuAevwg&s"
              }
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
            />
            <span className="ml-4 text-black font-semibold" index={profile[3]}>
              {profile[1]}
            </span>
            <button
              className={
                "bg-green-500 right-[13%] ml-5 px-1 py-1 text-white font-bold rounded hover:bg-green-600"
              }
              index={profile[3] + "..."}
              onClick={handleMemberAdd}
            >
              Approve
            </button>
            <button
              className={
                "bg-red-500 right-[13%] ml-5 px-1 py-1 text-white font-bold rounded hover:bg-red-600"
              }
              index={profile[3] + "..."}
              onClick={handleMemberDel}
            >
              Deny
            </button>
          </div>
        ))}
      </div>

      {/* Photos Gallery Section */}
      <div className={clubData.gallery.length == 0 ? "" : "hidden"}>
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
          Photo Gallery
        </Typography>
        <div className="overflow-x-auto bg-gray-200 p-4 rounded-lg w-1/1">
          <div className="flex space-x-4">
            {defaultPhotos &&
              defaultPhotos.map((photo, index) => (
                <div key={index} className="min-w-[200px]">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="rounded-lg shadow-md h-[150px] object-cover"
                  />
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className={clubData.gallery.length > 0 ? "" : "hidden"}>
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
          Photo Gallery
        </Typography>
        <div className="overflow-x-auto bg-gray-200 p-4 rounded-lg w-1/1">
          <div className="flex space-x-4">
            {clubData.gallery &&
              clubData.gallery.map((photo, index) => (
                <div key={index} className="min-w-[200px]">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="rounded-lg shadow-md h-[150px] object-cover"
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </Box>
  );
};

export default ClubInformation;
