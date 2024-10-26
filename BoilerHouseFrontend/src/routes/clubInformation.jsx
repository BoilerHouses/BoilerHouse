import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

import {
  CircularProgress,
  Typography,
  Box,
  Chip,
  Avatar,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from "@mui/material";

import { DatePicker, TimePicker } from "@mui/x-date-pickers";

const ClubInformation = () => {
  const navigate = useNavigate();
  const today = dayjs();
  const sixPM = dayjs().hour(18).minute(0);

  const { clubId } = useParams(); // Get club ID from the route parameters
  const [clubData, setClubData] = useState(null);
  const [joined, setJoined] = useState(false);
  const [officer, setOfficer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [getMeetingError, setGetMeetingError] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const [meetingMenu, setMeetingMenu] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [editMeeting, setEditMeeting] = useState(false);

  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState(sixPM);
  const [endTime, setEndTime] = useState(sixPM.add(1, "hour"));
  const [meetingName, setMeetingName] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingAgenda, setMeetingAgenda] = useState("");
  const [isLoadingEditMeeting, setIsLoadingEditMeeting] = useState(false);
  const [isLoadingDeleteMeeting, setIsLoadingDeleteMeeting] = useState(false);

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
      })
      .catch((error) => {
        console.error("There was an error fetching the club data!", error);
        setIsLoading(false);
      });

    axios({
      // create account endpoint
      url: "http://127.0.0.1:8000/api/clubs/getMeetingTimes/",
      method: "GET",

      // params
      params: {
        clubId: clubId,
      },
    })
      .then((response) => {
        const data = response.data;
        if (data.length >= 0) {
          let meetings = response.data;

          meetings.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            if (dateA.getTime() !== dateB.getTime()) {
              return dateA - dateB;
            }
            const timeA = new Date(`${a.date} ${a.time}`);
            const timeB = new Date(`${b.date} ${b.time}`);
            if (timeA.getTime() !== timeB.getTime()) {
              return dateA - dateB;
            }
            return a.id - b.id;
          });

          let startInd = 1;
          for (let i = startInd; i < meetings.length; i++) {
            if (new Date(meetings[i].date) < new Date()) {
              startInd++;
            }
          }
          meetings = meetings.slice(startInd - 1);
          setMeetings(meetings);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching meetings!", error);
        setGetMeetingError(true);
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
      .then(() => {
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
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error("There was an error with approval!", error);
        setIsLoading(false);
      });
  };

  const handleApproval = () => {
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

  const handleJoin = () => {
    if (clubData.useQuestions) {
      navigate(`/questions/${clubId}`);
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

  const handleDeny = () => {
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
      .then(() => {
        setIsLoading(false);
        navigate(`/clubs`);
      })
      .catch((error) => {
        console.error("There was an error fetching the club data!", error);
        setIsLoading(false);
      });
  };

  const goToCreateMeeting = () => {
    navigate(`/club/${clubId}/createMeeting`);
  };

  const handleCardClick = (meeting) => {
    setMeetingMenu(true);
    setSelectedMeeting(meeting);
    setMeetingName(meeting.meetingName);
    setMeetingLocation(meeting.meetingLocation);
    setMeetingAgenda(meeting.meetingAgenda);
    setStartDate(dayjs(meeting.date));
    setStartTime(dayjs(meeting.startTime, "h:mm a"));
    setEndTime(dayjs(meeting.endTime, "h:mm a"));
  };

  const handleClose = () => {
    setMeetingMenu(false);
  };

  const handleUpdateMeeting = (e) => {
    e.preventDefault();

    if (timeError) {
      return;
    }

    // create new meeting object and replace the old one
    const newMeeting = {
      id: selectedMeeting.id,
      meetingName: meetingName,
      meetingLocation: meetingLocation,
      meetingAgenda: meetingAgenda,
      date: startDate.format("MM/DD/YY"),
      startTime: startTime.format("h:mm a"),
      endTime: endTime.format("h:mm a"),
    };

    const index = meetings.findIndex((meeting) => meeting.id === newMeeting.id);
    if (index !== -1) {
      meetings[index] = newMeeting;
    }

    let newMeetings = JSON.stringify(meetings);

    setIsLoadingEditMeeting(true);
    axios({
      url: "http://127.0.0.1:8000/api/clubs/setMeetingTimes/",
      method: "GET",

      // params
      params: {
        clubId: clubId,
        meetings: newMeetings,
      },
    })
      // success
      .then(() => {
        setIsLoadingEditMeeting(false);

        // resort the meetings
        meetings.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          const timeA = new Date(`${a.date} ${a.time}`);
          const timeB = new Date(`${b.date} ${b.time}`);
          if (timeA.getTime() !== timeB.getTime()) {
            return dateA - dateB;
          }
          return a.id - b.id;
        });

        closeEditMeeting();
      })

      // Catch errors if any
      .catch((err) => {
        setIsLoadingEditMeeting(false);
        console.log(err);
        const serverAlert = document.querySelector("#server-error-alert");
        serverAlert.classList.remove("hidden");
      });
  };

  // delete a meeting
  const deleteMeeting = () => {
    const index = meetings.findIndex(
      (meeting) => meeting.id === selectedMeeting.id
    );
    if (index == -1) {
      return;
    }

    meetings.splice(index, 1);
    let newMeetings = JSON.stringify(meetings);

    setIsLoadingDeleteMeeting(true);
    axios({
      url: "http://127.0.0.1:8000/api/clubs/setMeetingTimes/",
      method: "GET",

      // params
      params: {
        clubId: clubId,
        meetings: newMeetings,
      },
    })
      // success
      .then(() => {
        setIsLoadingDeleteMeeting(false);

        // resort the meetings
        meetings.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          const timeA = new Date(`${a.date} ${a.time}`);
          const timeB = new Date(`${b.date} ${b.time}`);
          if (timeA.getTime() !== timeB.getTime()) {
            return dateA - dateB;
          }
          return a.id - b.id;
        });

        closeEditMeeting();
      })

      // Catch errors if any
      .catch((err) => {
        setIsLoadingDeleteMeeting(false);
        console.log(err);
        const serverAlert = document.querySelector("#server-error-alert");
        serverAlert.classList.remove("hidden");
      });
  };

  const handleMeetingNameChange = (event) => {
    setMeetingName(event.target.value);
  };
  const handleMeetingLocationChange = (event) => {
    setMeetingLocation(event.target.value);
  };
  const handleMeetingAgendaChange = (event) => {
    setMeetingAgenda(event.target.value);
  };

  const handleStartDateChange = (newValue) => {
    setStartDate(newValue);
  };

  useEffect(() => {
    validateTimeRange();
  }, [startTime]);

  useEffect(() => {
    validateTimeRange();
  }, [endTime]);

  const validateTimeRange = () => {
    if (endTime.isBefore(startTime)) {
      setTimeError(true);
    } else {
      setTimeError(false);
    }
  };

  const handleStartTimeChange = (newValue) => {
    setStartTime(newValue);
  };

  const handleEndTimeChange = (newValue) => {
    setEndTime(newValue);
  };

  const openEditMeeting = () => {
    setEditMeeting(true);
    handleClose();
  };

  const closeEditMeeting = () => {
    setEditMeeting(false);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!clubData) {
    return <Typography variant="h6">Club not found!</Typography>;
  }

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#d0d8da",
        minHeight: "100vh",
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
            officer
              ? "bg-green-500 absolute top-20 right-[5%] text-white font-bold py-2 px-4 rounded hover:bg-green-600"
              : "hidden"
          }
          onClick={goToCreateMeeting}
        >
          Create Meeting
        </button>

        <button
          className={
            officer && clubData.is_approved && joined
              ? "bg-blue-500 absolute top-30 right-[15%] text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
              : "hidden"
          }
          onClick={() => {
            navigate(`/createQuestions/${clubId}`);
          }}
        >
          Edit Questionnaire
        </button>

        <button
          className={
            officer && clubData.is_approved
              ? "bg-blue-500 absolute top-10 right-[5%] text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
              : "hidden"
          }
          onClick={() => {
            navigate(`/club/${clubId}/edit`);
          }}
        >
          Edit Culture and Time Commitment
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

      {/* list of meetings*/}
      <Box
        className="w-1/3 absolute right-0 h-[400px] overflow-y-scroll mr-12 mt-32"
        sx={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          backgroundColor: "#f9f9f9",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h6">List of Meetings</Typography>
        {getMeetingError ? (
          <Typography>
            An error occurred while fetching meetings. Please try again later.
          </Typography>
        ) : meetings.length === 0 ? (
          <Typography>No meetings to display</Typography>
        ) : (
          meetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="mb-4 bg-white shadow-md hover:shadow-lg transition-shadow"
              sx={{ padding: "2px", borderRadius: "8px" }}
              onClick={() => handleCardClick(meeting)}
            >
              <CardContent>
                <Typography variant="h6" component="div">
                  {meeting.meetingName}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {meeting.meetingLocation}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {meeting.date} {meeting.startTime} - {meeting.endTime}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* view meeting info*/}
      <Dialog open={meetingMenu} onClose={handleClose}>
        <DialogTitle>{selectedMeeting?.meetingName}</DialogTitle>
        <DialogContent>
          <Typography>Location: {selectedMeeting?.meetingLocation}</Typography>
          <Typography>Date: {selectedMeeting?.date}</Typography>
          <Typography>
            Time: {selectedMeeting?.startTime} - {selectedMeeting?.endTime}
          </Typography>
          <Typography>Agenda: {selectedMeeting?.meetingAgenda}</Typography>
          <Typography>Meeting Id: {selectedMeeting?.id}</Typography>
        </DialogContent>
        <DialogActions>
          <div className={officer ? "" : "hidden"}>
            <Button
              color="primary"
              onClick={openEditMeeting}
              variant="contained"
            >
              Edit
            </Button>
          </div>
          <Button onClick={handleClose} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* edit meeting info*/}
      <Dialog open={editMeeting} onClose={closeEditMeeting}>
        <DialogContent className="overflow-y-auto" dividers>
          <Card className="w-full">
            <CardContent>
              <Typography
                variant="h5"
                component="h2"
                className="mb-4 text-center"
              >
                Update Meeting
              </Typography>
              <form onSubmit={handleUpdateMeeting} className="space-y-4">
                <TextField
                  fullWidth
                  required
                  value={meetingName}
                  label="Meeting Name"
                  name="Meeting Name"
                  onChange={handleMeetingNameChange}
                  className="bg-white !my-3.5"
                />
                <TextField
                  fullWidth
                  required
                  value={meetingLocation}
                  label="Meeting Location"
                  name="Meeting Location"
                  onChange={handleMeetingLocationChange}
                  className="bg-white !my-3.5"
                />
                <TextField
                  fullWidth
                  multiline
                  value={meetingAgenda}
                  label="Agenda"
                  name="Agenda"
                  onChange={handleMeetingAgendaChange}
                  className="bg-white !my-3.5"
                />

                <DatePicker
                  label="Select Day of Meeting"
                  required
                  disablePast
                  onChange={handleStartDateChange}
                  defaultValue={startDate}
                  className="mb-4"
                />

                <TimePicker
                  label="Start Time"
                  defaultValue={startTime}
                  maxTime={endTime}
                  onChange={handleStartTimeChange}
                />
                <TimePicker
                  label="End Time"
                  defaultValue={endTime}
                  minTime={startTime}
                  onChange={handleEndTimeChange}
                />

                <div id="server-error-alert" className="hidden">
                  <Alert severity="error">
                    A server error occurred. Please try again later.
                  </Alert>
                </div>

                <div className="flex items-center justify-center">
                  <Button
                    color="error"
                    variant="contained"
                    onClick={deleteMeeting}
                  >
                    {isLoadingDeleteMeeting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Delete Meeting"
                    )}
                  </Button>
                  <Button type="submit" color="primary" variant="contained">
                    {isLoadingEditMeeting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Confirm Edits"
                    )}
                  </Button>
                  <Button
                    onClick={closeEditMeeting}
                    color="primary"
                    variant="contained"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
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
            ? "overflow-y-auto max-h-60 w-1/3 bg-white rounded-lg shadow-md pl-3 p-2"
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
            <button
              className={
                profile[4]
                  ? "bg-orange-200 right-[13%] ml-5 px-1 py-1 text-white font-bold rounded hover:bg-orange-300"
                  : "hidden"
              }
              index={profile[3] + "..."}
              onClick={() => {
                navigate(`/answers/${clubId}/${profile[3]}`);
              }}
            >
              View Questionnaire Answers
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
