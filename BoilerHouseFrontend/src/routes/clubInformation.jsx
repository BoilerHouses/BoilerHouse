import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import RatingForm from "./ratingComponent";
import {
  CircularProgress,
  Typography,
  Box,
  Chip,
  Avatar,
  Card,
  Rating,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import { DatePicker, TimePicker } from "@mui/x-date-pickers";

const ClubInformation = () => {
  const navigate = useNavigate();
  const today = dayjs();
  const sixPM = dayjs().hour(18).minute(0);

  const { clubId } = useParams();
  const [clubData, setClubData] = useState(null);
  const [joined, setJoined] = useState(false);
  const [pending, setPending] = useState(false);
  const [officer, setOfficer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);
  const [officerCount, setOfficerCount] = useState(0);
  const [meetings, setMeetings] = useState([]);
  const [getMeetingError, setGetMeetingError] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [averageRating, setAverageRating] = useState(2.5);
  const [meetingMenu, setMeetingMenu] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [editMeeting, setEditMeeting] = useState(false);
  const [recommendedUsers, setRecommendedUsers] = useState([]);

  const threshold = 0.2;

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [updatedReview, setUpdatedReview] = useState("");
  const [updatedRating, setUpdatedRating] = useState(0);

  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState(sixPM);
  const [endTime, setEndTime] = useState(sixPM.add(1, "hour"));
  const [meetingName, setMeetingName] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingAgenda, setMeetingAgenda] = useState("");
  const [isLoadingEditMeeting, setIsLoadingEditMeeting] = useState(false);
  const [isLoadingDeleteMeeting, setIsLoadingDeleteMeeting] = useState(false);

  const [mostCommonMajors, setMostCommonMajors] = useState([]);
  const [mostCommonInterests, setMostCommonInterests] = useState([]);
  const [mostCommonGradYears, setMostCommonGradYears] = useState([]);

  const [reccomended, setReccomended] = useState(0.0);

  const [sendEmail, setSendEmail] = useState(false);

  const defaultPhotos = [
    "https://mauconline.net/wp-content/uploads/10-Tips-for-Marketing-to-College-Students-New.jpg",
    "https://impactgroupmarketing.com/Portals/0/xBlog/uploads/2023/1/3/Myproject(20).jpg",
    "https://concept3d.com/wp-content/uploads/2024/03/Group-of-college-friends-each-of-whom-represents-different-college-student-personas.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRuvDNp209LLZ3LjcuzRgX3vaacod7mOuX9w&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2dVbLMzlaeJnL5C6RpZ8HLRECJhH6ILEGKg&s",
    "https://img.freepik.com/free-photo/wide-angle-shot-single-tree-growing-clouded-sky-during-sunset-surrounded-by-grass_181624-22807.jpg",
    "https://st.depositphotos.com/2001755/3622/i/450/depositphotos_36220949-stock-photo-beautiful-landscape.jpg",
    "https://source.boomplaymusic.com/group10/M00/09/11/d0e4e4e7e6a84fe7b53b2222db066c5cH3000W3000_320_320.jpg",
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
        setPending(response.data.pending);
        setDeleted(response.data.deleted);
        setOfficer(response.data.officer);
        setDeletedCount(response.data.deleted_count);
        setOfficerCount(response.data.officer_count);
        setAccepting(response.data.club.acceptingApplications);
        setMostCommonMajors(response.data.common_majors);
        setMostCommonInterests(response.data.common_interests);
        setMostCommonGradYears(response.data.common_grad_years);
        setRecommendedUsers(response.data.user_list);
        let avg = 0;
        if (response.data.club.ratings) {
          response.data.club.ratings.forEach((e) => {
            avg += e.rating;
          });
          avg /= response.data.club.ratings.length;
          setAverageRating(avg.toFixed(2));
        }
      })
      .catch((error) => {
        alert("There was an error fetching the club data!", error);
        console.log(error);
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

          const today = new Date();
          const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

          let startInd = 0;
          for (let i = 0; i < meetings.length; i++) {
            if (new Date(meetings[i].date) < currentDay) {
              startInd++;
            }
          }
          
          meetings = meetings.slice(startInd);
          setMeetings(meetings);
        }
      })
      .catch((error) => {
        alert("There was an error fetching meetings!", error);
        setGetMeetingError(true);
      });
  }, [clubId]);

  const handleKickMember = (memberId) => {
    const token = localStorage.getItem("token");

    axios
      .post(
        `http://127.0.0.1:8000/api/club/kick_member/`, // Assuming this endpoint kicks a member
        {
          club_id: clubId,
          member_username: memberId,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then(() => {
        // Redirect to the club information page
        alert("The member has been successfully kicked from the club.");
        window.location.reload();
      })
      .catch((error) => {
        if (error.status == 400) {
          alert("You cannot kick yourself from the club", error);
        } else {
          alert("There was an error with kicking the member!", error);
        }
      });
  };

  const handleMemberBan = (memberId) => {
    console.log(memberId);
    const token = localStorage.getItem("token");
    axios
      .post(
        `http://127.0.0.1:8000/api/club/ban_member/`,
        {
          club_id: clubId,
          member_username: memberId,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then(() => {
        alert("The member has been successfully banned from the club.");
        window.location.reload();
      })
      .catch((error) => {
        alert("There was an error with banning the member!", error);
        setIsLoading(false);
      });
  };

  const handleCheckboxChange = () => {
    const token = localStorage.getItem("token");
    setAccepting(!accepting);
    console.log(accepting);
    axios
      .get(`http://127.0.0.1:8000/api/club/officer/toggle/${clubId}/`, {
        headers: {
          Authorization: token,
        },
        params: {
          accept: accepting,
        },
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        alert("There was an error fetching the club data!", error);
      });
  };

  const fetchGallery = () => {
    if (clubData.gallery.length == 0) {
      return defaultPhotos;
    }
    return clubData.gallery;
  };

  const deleteClub = (event) => {
    const token = localStorage.getItem("token");

    axios
      .get(`http://127.0.0.1:8000/api/club/delete/vote/`, {
        headers: {
          Authorization: token,
        },
        params: {
          club: clubId,
        },
      })
      .then((response) => {
        const data = response.data;
        if (data.deleted) {
          navigate(`/clubs`);
        } else {
          setDeleted(data.vote);
          setDeletedCount(response.data.deleted_count);
          setOfficerCount(response.data.officer_count);
        }
      })
      .catch((error) => {
        alert("There was an error fetching the club data!", error);
        setIsLoading(false);
      });
  };

  const startEditing = (rating) => {
    setEditingReviewId(rating.id);
    setUpdatedReview(rating.review);
    setUpdatedRating(rating.rating);
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setUpdatedReview("");
    setUpdatedRating(0);
  };

  const saveUpdatedReview = (id) => {
    const token = localStorage.getItem("token");
    const data = {
      id: id,
      review: updatedReview,
      rating: updatedRating,
    };
    axios
      .post(`http://127.0.0.1:8000/api/rating/create/${clubId}/`, data, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        console.log(response);
        navigate(0);
      })
      .catch((error) => {
        console.error("There was an error creating your rating!", error);
      });
    cancelEditing();
  };

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
        alert("There was an error with approval!", error);
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
        alert("There was an error with approval!", error);
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
        alert("There was an error fetching the club data!", error);
        setIsLoading(false);
      });
  };

  const handleOfficerAdd = (event) => {
    const token = localStorage.getItem("token");
    const username = event.target
      .getAttribute("index")
      .substring(0, event.target.getAttribute("index").length - 3);
    axios
      .get(`http://127.0.0.1:8000/api/club/officer/set/${clubId}/`, {
        headers: {
          Authorization: token,
        },
        params: {
          username: username,
          approved: "Y",
        },
      })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        alert("There was an error with approval!", error);
        setIsLoading(false);
      });
  };

  const handleOfficerDeny = (event) => {
    const token = localStorage.getItem("token");
    const username = event.target
      .getAttribute("index")
      .substring(0, event.target.getAttribute("index").length - 3);
    axios
      .get(`http://127.0.0.1:8000/api/club/officer/set/${clubId}/`, {
        headers: {
          Authorization: token,
        },
        params: {
          username: username,
          approved: "N",
        },
      })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        alert("There was an error with approval!", error);
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
        setPending(true);
      })
      .catch((error) => {
        if (error.status == 403) {
          alert("You are banned from this club", error);
        } else {
          alert("There was an error joining club!", error);
        }
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
        alert("There was an error fetching the club data!", error);
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
        sendEmail: sendEmail,
        relevant_meetings: JSON.stringify([newMeeting]),
        action: "updated",
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

  const deleteRating = (e) => {
    const rating_id = e;
    const token = localStorage.getItem("token");
    axios
      .get(`http://127.0.0.1:8000/api/rating/delete/${rating_id}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        console.log(response);
        navigate(0);
      })
      .catch((error) => {
        alert("There was an error deleting your rating!", error);
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
    const deleted_meeting = meetings[index];
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
        sendEmail: sendEmail,
        relevant_meetings: JSON.stringify([deleted_meeting]),
        action: "deleted",
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

  const handleLeaveClub = () => {
    if (officer) {
      if (officerCount === 1) {
        alert(
          "You cannot leave as you are the only officer left. Delete the club or make another user an officer"
        );
      } else {
        axios({
          url: "http://127.0.0.1:8000/api/leaveClub/",
          method: "GET",
          headers: {
            Authorization: localStorage.getItem("token"),
          },
          // params
          params: {
            club_name: clubData.name,
          },
        })
          .then(() => {
            navigate("/clubs");
          })
          .catch(() => {
            alert("There was an error in leaving the club. Please try again.");
          });
      }
    } else {
      axios({
        url: "http://127.0.0.1:8000/api/leaveClub/",
        method: "GET",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
        // params
        params: {
          club_name: clubData.name,
        },
      })
        .then(() => {
          navigate("/clubs");
        })
        .catch(() => {
          alert("There was an error in leaving the club. Please try again.");
        });
    }
  };

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#d0d8da",
        minHeight: "100vh",
      }}
    >
      <div className="absolute right-0">
        <button
          className={
            clubData.is_approved && !joined
              ? "bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
              : "hidden"
          }
          onClick={handleJoin}
        >
          Join Club
        </button>

        <div className="flex justify-between">
          <button
            className={
              officer
                ? "bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
                : "hidden"
            }
            onClick={goToCreateMeeting}
          >
            Create Meeting
          </button>

          <button
            className={
              officer && joined
                ? "bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
                : "hidden"
            }
            onClick={deleteClub}
          >
            {deleted ? "Revoke Vote to Delete" : "Vote to Delete Club"}
          </button>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={accepting}
              onChange={handleCheckboxChange}
              className={
                officer && joined && clubData.is_approved
                  ? "w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  : "hidden"
              }
            />
            <label
              className={
                officer && joined && clubData.is_approved
                  ? "ml-2 text-gray-700"
                  : "hidden"
              }
            >
              Accept Officer Applications
            </label>
          </div>

          <p className={officer && joined ? "text-red font-bold" : "hidden"}>
            {deletedCount + "/" + officerCount + " votes to delete club"}
          </p>
        </div>

        <div className="flex justify-between">
          <button
            className={
              officer && clubData.is_approved && joined
                ? "bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                : "hidden"
            }
            onClick={() => navigate(`/createQuestions/${clubId}`)}
          >
            Edit Questionnaire
          </button>

          <button
            className={
              officer && clubData.is_approved && joined
                ? "bg-blue-500 text-white font-bold py-2 px-6 rounded hover:bg-blue-600"
                : "hidden"
            }
            onClick={() => navigate(`/createOfficerQuestions/${clubId}`)}
          >
            Edit Officer Questionnaire
          </button>
          <div />
        </div>

        <div className="flex justify-between">
          <button
            className={
              officer && clubData.is_approved
                ? "bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                : "hidden"
            }
            onClick={() => navigate(`/club/${clubId}/edit`)}
          >
            Edit Culture, Time Commitment, Audience
          </button>

          <button
            className={
              officer && clubData.is_approved
                ? "bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                : "hidden"
            }
            onClick={() => navigate(`/club/${clubId}/defaultContact`)}
          >
            Contact Us!
          </button>
          <button
            className={
              officer && clubData.is_approved
                ? "bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                : "hidden"
            }
            onClick={() => navigate(`/club/${clubId}/clubDues`)}
          >
            {clubData.clubDues ? "Edit Dues" : "Set Club Dues"}
          </button>
          <button
            className={
              officer && clubData.is_approved && clubData.clubDues
                ? "bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                : "hidden"
            }
            onClick={() => navigate(`/manageDues/${clubId}`)}
          >
            Manage Dues
          </button>
          <button
            className={
              !officer &&
              clubData.is_approved &&
              joined &&
              accepting &&
              !pending
                ? "bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                : "hidden"
            }
            onClick={() => navigate(`/officer_questions/${clubId}`)}
          >
            Apply To Be an Officer!
          </button>
        </div>
        <button
          className={
            joined
              ? "bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 mt-5"
              : "hidden"
          }
          onClick={handleLeaveClub}
        >
          Leave Club
        </button>
      </div>

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
        className="w-1/3 absolute right-0 h-[400px] overflow-y-scroll mr-12 mt-52"
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
          <div
            className={selectedMeeting?.meetingAgenda === "" ? "hidden" : ""}
          >
            <Typography>Agenda: {selectedMeeting?.meetingAgenda}</Typography>
          </div>
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
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox />}
                    checked={sendEmail}
                    onClick={() => {
                      setSendEmail(!sendEmail);
                    }}
                    label="Notify Members"
                  />
                </FormGroup>

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

      {/* Club Targeted Audience */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
        Targeted Audience:
      </Typography>
      <Typography variant="body1" gutterBottom color="black">
        {clubData.targetedAudience || "No audience information provided."}
      </Typography>

      {/* Club Time Commitment */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
        Time Commitment:
      </Typography>
      <Typography variant="body1" gutterBottom color="black">
        {clubData.time_commitment || "No time commitment information provided."}
      </Typography>

      {/* Club Email */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
        Club Email:
      </Typography>
      <Typography variant="body1" gutterBottom color="black">
        {clubData.clubEmail || "No email information provided."}
      </Typography>

      {/* Club Phone Number */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
        Club Phone Number:
      </Typography>
      <Typography variant="body1" gutterBottom color="black">
        {clubData.clubPhoneNumber || "No phone number information provided."}
      </Typography>

      {/* Club Dues */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
        Club Dues:
      </Typography>
      <Typography variant="body1" gutterBottom color="black">
        {!clubData.dueName && !clubData.clubDues && !clubData.dueDate ? (
          "No club dues information provided."
        ) : (
          <>
            {clubData.dueName && <div>{"Due Name: " + clubData.dueName}</div>}
            {clubData.clubDues ? (
              <div>{"Amount: $" + clubData.clubDues}</div>
            ) : (
              <div>Amount: $0</div>
            )}
            {clubData.dueDate && <div>{"Due Date: " + clubData.dueDate}</div>}
          </>
        )}
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
      {!joined && (
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
          {`Club Similarity Score: ${(clubData.rating * 100 + 100).toFixed(2)}`}
        </Typography>
      )}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
        Similar User Key:
      </Typography>
      <div className="flex">
        <span className="mr-2">Fairly Similar User</span>
        <div
          className="bg-yellow-100 rounded"
          style={{ width: "30px", height: "30px" }}
        ></div>
        <div
          className="bg-yellow-200 rounded"
          style={{ width: "30px", height: "30px" }}
        ></div>
        <div
          className="bg-yellow-300 rounded"
          style={{ width: "30px", height: "30px" }}
        ></div>
        <div
          className="bg-yellow-400 rounded"
          style={{ width: "30px", height: "30px" }}
        ></div>
        <div
          className="bg-yellow-500 rounded"
          style={{ width: "30px", height: "30px" }}
        ></div>
        <span className="ml-2">Very Similar User</span>
      </div>
      {/* Officers Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="black">
        Officers ({clubData.officers.length}):
      </Typography>

      <div className="overflow-y-auto max-h-60 w-1/2 bg-white rounded-lg shadow-md pl-3 p-2">
        {clubData.officers.map((profile, index) => (
          <div
            index={profile[3]}
            key={index}
            onClick={handleMemberProfile}
            className={
              recommendedUsers[profile[3]] > threshold
                ? `flex items-center bg-yellow-${
                    100 +
                    100 *
                      Math.round(
                        Math.round(
                          (recommendedUsers[profile[3]] - threshold) *
                            (400 / (1 - threshold))
                        ) / 100
                      )
                  } rounded-lg p-2 mb-2 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500`
                : "flex items-center bg-gray-100 rounded-lg p-2 mb-2 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500"
            }
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
      <div className="overflow-y-auto max-h-60 w-1/2 bg-white rounded-lg shadow-md pl-3 p-2">
        {clubData.members.map((profile, index) => (
          <div
            index={profile[3]}
            key={index}
            onClick={handleMemberProfile}
            className={
              recommendedUsers[profile[3]] > threshold
                ? `flex items-center bg-yellow-${
                    100 +
                    100 *
                      Math.round(
                        Math.round(
                          (recommendedUsers[profile[3]] - threshold) *
                            (400 / (1 - threshold))
                        ) / 100
                      )
                  } rounded-lg p-2 mb-2 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500 group`
                : "flex items-center bg-gray-100 rounded-lg p-2 mb-2 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500 group"
            }
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
                profile[7] && officer
                  ? "bg-orange-200 right-[13%] ml-5 px-1 py-1 text-white font-bold rounded hover:bg-orange-300"
                  : "hidden"
              }
              index={profile[3] + "..."}
              onClick={() => {
                navigate(`/officer_answers/${clubId}/${profile[3]}`);
              }}
            >
              View Application
            </button>
            <button
              className={
                profile[7] && officer
                  ? "bg-green-500 right-[13%] ml-5 px-1 py-1 text-white font-bold rounded hover:bg-green-600"
                  : "hidden"
              }
              index={profile[3] + "..."}
              onClick={handleOfficerAdd}
            >
              Approve
            </button>
            <button
              className={
                profile[7] && officer
                  ? "bg-red-500 right-[13%] ml-5 px-1 py-1 text-white font-bold rounded hover:bg-red-600"
                  : "hidden"
              }
              index={profile[3] + "..."}
              onClick={handleOfficerDeny}
            >
              Deny
            </button>
            <button
              className={
                officer
                  ? "bg-blue-500 right-[13%] ml-5 px-1 py-1 text-white font-bold rounded hover:bg-blue-600 group-hover:block hidden"
                  : "hidden"
              }
              index={profile[3] + "..."}
              onClick={() => handleKickMember(profile[3])}
            >
              Kick
            </button>
            <button
              className={
                officer
                  ? "bg-red-500 right-[13%] ml-5 px-1 py-1 text-white font-bold rounded hover:bg-red-600 group-hover:block hidden"
                  : "hidden"
              }
              index={profile[3] + "..."}
              onClick={() => handleMemberBan(profile[3])}
            >
              Ban
            </button>
          </div>
        ))}
      </div>

      {/* Club Overview Section*/}
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="flex-start"
        sx={{ maxWidth: 900 }}
      >
        <Grid item>
          <Card sx={{ width: 240, boxShadow: 3 }} className="mt-5">
            <CardContent>
              <Typography
                variant="subtitle1"
                component="div"
                sx={{ textAlign: "center" }}
              >
                Most Common Majors
              </Typography>
              <List
                sx={{
                  "& > :not(:last-child)": {
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                {mostCommonMajors.map(([major, frequency], index) => (
                  <ListItem key={index} sx={{ py: 0.75 }}>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {major}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {frequency}%
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item>
          <Card sx={{ width: 240, boxShadow: 3 }} className="mt-5">
            <CardContent>
              <Typography
                variant="subtitle1"
                component="div"
                sx={{ textAlign: "center" }}
              >
                Most Common Interests
              </Typography>
              <List
                sx={{
                  "& > :not(:last-child)": {
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                {mostCommonInterests.map(([major, frequency], index) => (
                  <ListItem key={index} sx={{ py: 0.75 }}>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {major}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {frequency}%
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item>
          <Card sx={{ width: 240, boxShadow: 3 }} className="mt-5">
            <CardContent>
              <Typography
                variant="subtitle1"
                component="div"
                sx={{ textAlign: "center" }}
              >
                Most Common Grad Years
              </Typography>
              <List
                sx={{
                  "& > :not(:last-child)": {
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                {mostCommonGradYears.map(([major, frequency], index) => (
                  <ListItem key={index} sx={{ py: 0.75 }}>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {major}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {frequency}%
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            ? "overflow-y-auto max-h-60 w-1/2 bg-white rounded-lg shadow-md pl-3 p-2"
            : "hidden"
        }
      >
        {clubData.pending_members.map((profile, index) => (
          <div
            index={profile[3]}
            key={index}
            onClick={handleMemberProfile}
            className={
              officer
                ? "flex items-center bg-gray-100 rounded-lg p-2 mb-2 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500"
                : "hidden"
            }
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
      {joined && <RatingForm clubId={clubId} />}
      <Box
        className={`${
          clubData.ratings && clubData.ratings.length === 0
            ? "hidden"
            : "mx-auto mt-4 w-60% w-2/3 overflow-y-auto bg-white rounded-lg shadow-md p-4"
        }`}
        sx={{ maxHeight: "400px" }}
      >
        <Box className="mb-4 bg-slate-200 rounded">
          <Typography variant="body1" color="text.secondary">
            {`Average Rating: ${averageRating}`}
          </Typography>
        </Box>
        {clubData.ratings &&
          clubData.ratings.map((rating, index) => (
            <Box
              key={index}
              className="mb-4 transition-transform transform hover:scale-105 hover:shadow-lg bg-slate-200 rounded"
            >
              <Box className="flex items-center p-4">
                <img
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full mr-4"
                  src={rating.portrait}
                  alt="User avatar"
                />
                <Box className="flex-1">
                  {editingReviewId === rating.id ? (
                    <>
                      <TextField
                        value={updatedReview}
                        onChange={(e) => setUpdatedReview(e.target.value)}
                        fullWidth
                        variant="outlined"
                        size="small"
                        className="mb-2"
                      />
                      <Rating
                        value={updatedRating}
                        precision={0.5}
                        onChange={(e, newValue) => setUpdatedRating(newValue)}
                      />
                      <Box className="flex items-center mt-2 space-x-2">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => saveUpdatedReview(rating.id)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography variant="body1" color="text.secondary">
                        {rating.review}
                      </Typography>
                      <Box className="flex items-center mt-2">
                        <Rating
                          value={rating.rating}
                          precision={0.5}
                          readOnly
                        />
                        <Typography
                          variant="body2"
                          sx={{ ml: 1, fontWeight: "bold" }}
                        >
                          {rating.rating}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>

                <Link
                  to={`/profile/${rating.author}`}
                  className="text-primary-500 font-bold ml-4"
                >
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                  >
                    {rating.author}
                  </Typography>
                </Link>

                {rating.author === localStorage.getItem("username") && (
                  <>
                    {editingReviewId === rating.id ? (
                      <Button
                        onClick={cancelEditing}
                        className="ml-4 text-red-500"
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        onClick={() => startEditing(rating)}
                        className="ml-4 text-blue-500"
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteRating(rating.id)}
                      className="ml-4 rounded bg-red-500 py-2 px-2 text-white transform hover:scale-105 hover:shadow-lg"
                    >
                      Delete
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          ))}
      </Box>

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
