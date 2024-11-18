// ViewProfile.js
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Availability from "./availability";


const ViewProfile = () => {
  // Hardcoded user data
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "A passionate student majoring in Computer Science. Loves coding and outdoor adventures.",
    grad_year: 2025,
    major: ["Computer Science"],
    profile_picture: "https://via.placeholder.com/120", // Sample profile image URL
    interests: ["Jai"],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedUsers, setRecommendedUsers] = useState([])
  const threshold = 0.1

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      if (token) {
        const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
          headers: {
            Authorization: token,
          },
          params: {
            username: userId,
          },
        });
        setUser(response.data);
        
        axios.get(`http://127.0.0.1:8000/api/recommendations/users/`, {
          headers: {
            Authorization: token,
          }
        })
        .then((response) => {
          setRecommendedUsers(response.data.user_list)
        })
        .catch((error) => {
          console.error("There was an error fetching the reccomended users!", error);
        });
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleViewMeetings = () => {
    navigate("/upcoming_meetings");
  };

  if (isLoading) {
    return <div>Loading..</div>;
  } else {
    return (
      <div className={recommendedUsers[userId] >= threshold ? `relative border rounded-lg p-6 max-w-full mx-auto bg-yellow-${100 + (100 * Math.round(Math.round( ((recommendedUsers[userId] - threshold) * (400 / (1 - threshold)))) / 100))} shadow-md` : "relative border rounded-lg p-6 max-w-full mx-auto bg-gray-100 shadow-md"}>
        {/* Edit Profile Button */}
        <button
          className={
            localStorage.getItem("username") == userId
              ? "absolute top-4 right-4 bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600"
              : "hidden"
          }
          onClick={() => {
            navigate("/edit_profile");
          }}
        >
          Edit Profile
        </button>

        <div className="flex items-center mb-4">
          <img
            src={
              user.profile_picture ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7mMNz8YCBvYmnr3BQUPX__YsC_WtDuAevwg&s"
            }
            alt="Profile"
            className="w-24 h-24 rounded-full mr-6"
          />{" "}
          {/* Increased size */}
          <h1 className="text-4xl font-bold">{user.name}</h1>{" "}
          {/* Increased font size */}
        </div>

        <p className="italic mb-4">{user.bio}</p>
        <p className={recommendedUsers[userId] > threshold ? "italic mb-4" : "hidden"}>This user has similar interests to you!</p>
        <p className={userId in recommendedUsers ? "italic mb-4" : "hidden"}>{`Your similarity score is: ${((1 + recommendedUsers[userId]) * 100).toFixed(2)}`}</p>
        <p className={recommendedUsers[userId] > threshold ? "italic mb-4" : "hidden"}>{`Get in contact with ${user.name} at ${user.email}`}</p>


        <div className="text-gray-800">
          <p>
            <strong>Major:</strong> {user.major.join(", ")}
          </p>
          <p>
            <strong>Graduation Year:</strong> {user.grad_year}
          </p>
          <p>
            <strong>Interests:</strong> {user.interests.join(", ")}
          </p>
        </div>

        <div className="flex justify-center">
          <p>
            <strong className={localStorage.getItem("username") == userId ? "text-xl flex text-center mb-4" : "hidden"}>
              Set Availabilty
            </strong>
          </p>
        </div>
        <div className={localStorage.getItem("username") == userId ? "" : "hidden"}>
            <Availability/>
        </div>        
        <button
          className={
            localStorage.getItem("username") == userId
              ? "absolute top-20 right-4 bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
              : "hidden"
          }
          visibility={(localStorage.getItem("username") === userId).toString()}
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
        >
          Log Out
        </button>
        <button
          className={
            localStorage.getItem("username") == userId
              ? "bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
              : "hidden"
          }
          visibility={(localStorage.getItem("username") === userId).toString()}
          onClick={() => {
            const token = localStorage.getItem("token")
            axios.get(`http://127.0.0.1:8000/api/recommendations/clubs/`, {
              headers: {
                Authorization: token,
              }
            })
            .then((response) => {
              console.log(response.data.club_list)
            })
            .catch((error) => {
              console.error("There was an error fetching the reccomended users!", error);
            });
          }}
        >
          Reccomend
        </button>

        {/* New button for viewing upcoming meetings */}
        <button
          className={
            localStorage.getItem("username") == userId
            ? "absolute top-36 right-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
            : "hidden"
          }
          onClick={handleViewMeetings}
        >
          View Upcoming Meetings
        </button>
      </div>
    );
  }
};

export default ViewProfile;
