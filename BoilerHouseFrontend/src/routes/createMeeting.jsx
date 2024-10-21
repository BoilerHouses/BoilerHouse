import { useState, useEffect } from "react";
import { Button, Box, Alert, CircularProgress } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import axios from "axios";

import {
  Card,
  CardContent,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

import { NavLink } from "react-router-dom";

function CreateMeeting() {
  const today = dayjs();
  const oneMonth = dayjs().add(31, "day");
  const sixPM = dayjs().hour(18).minute(0);

  const [meetingName, setMeetingName] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingAgenda, setMeetingAgenda] = useState("");
  const [numMeetingsCreated, setNumMeetingsCreated] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [officer, setOfficer] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isOneTimeMeeting, setIsOneTimeMeeting] = useState(true);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(oneMonth);
  const [startTime, setStartTime] = useState(sixPM);
  const [endTime, setEndTime] = useState(sixPM.add(1, "hour"));
  const [checkedDays, setCheckedDays] = useState({
    Sun: false,
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false,
  });

  const [dayError, setDayError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const { clubId } = useParams();

  const [isLoadingButton, setIsLoadingButton] = useState(false);

  useEffect(() => {
    setIsLoading(true);
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
        setOfficer(response.data.officer);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        setIsError(true);
      });
  }, [clubId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const serverAlert = document.querySelector("#server-error-alert");
    serverAlert.classList.add("hidden");

    const successAlert = document.querySelector("#success-alert");
    successAlert.classList.add("hidden");

    if (
      startDate.format("YYYY-MM-DD") === "Invalid Date" ||
      startTime.format("YYYY-MM-DD") === "Invalid Date" ||
      endTime.format("HH:mm") === "Invalid Date" ||
      (!isOneTimeMeeting && endDate.format("HH:mm") === "Invalid Date") ||
      dayError ||
      timeError
    ) {
      return;
    }

    const allUnchecked = Object.values(checkedDays).every(
      (value) => value === false
    );

    if (!isOneTimeMeeting && allUnchecked) {
      const daySelectAlert = document.querySelector("#day-select-alert");
      daySelectAlert.classList.remove("hidden");
    } else {
      const meetingDays = [];

      if (isOneTimeMeeting) {
        meetingDays.push(startDate.format("MMM-DD-YYYY"));
      } else {
        const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const mappedDays = dayOrder.map((day) => (checkedDays[day] ? 1 : 0));

        let cur = dayjs(startDate).startOf("day");
        const end = dayjs(endDate).endOf("day");

        while (cur.isBefore(end) || cur.isSame(end, "day")) {
          if (mappedDays[cur.day()] == 1) {
            meetingDays.push(cur.format("MMM-DD-YYYY"));
          }
          cur = cur.add(1, "day");
        }
      }

      let max_id = 0;

      setIsLoadingButton(true);
      axios({
        // create account endpoint
        url: "http://127.0.0.1:8000/api/clubs/getMeetingTimes/",
        method: "GET",

        // params
        params: {
          clubId: clubId,
        },
      })
        // success
        .then((res) => {
          let meetings = res.data;
          if (res.data.length > 0) {
            meetings.forEach((item) => {
              max_id = Math.max(max_id, parseInt(item.id));
            });
          }

          let start_id = max_id + 1;

          if (isNaN(start_id)) {
            start_id = 1;
          }

          let newMeetings = [];

          meetingDays.forEach((day) => {
            let newMeeting = {
              id: start_id,
              meetingName: meetingName,
              meetingLocation: meetingLocation,
              meetingAgenda: meetingAgenda,
              date: day,
              startTime: startTime.format("h:mm a"),
              endTime: endTime.format("h:mm a"),
            };
            newMeetings.push(newMeeting);
            start_id += 1;
          });
          setNumMeetingsCreated(newMeetings.length);
          meetings = meetings.concat(newMeetings);

          meetings = JSON.stringify(meetings);
          axios({
            url: "http://127.0.0.1:8000/api/clubs/setMeetingTimes/",
            method: "GET",

            // params
            params: {
              clubId: clubId,
              meetings: meetings,
            },
          })
            // success
            .then(() => {
              setIsLoadingButton(false);
              const successAlert = document.querySelector("#success-alert");
              successAlert.classList.remove("hidden");
            })

            // Catch errors if any
            .catch((err) => {
              setIsLoadingButton(false);
              console.log(err);
              const serverAlert = document.querySelector("#server-error-alert");
              serverAlert.classList.remove("hidden");
            });
        })

        // Catch errors if any
        .catch((err) => {
          setIsLoadingButton(false);
          console.log(err);
          const serverAlert = document.querySelector("#server-error-alert");
          serverAlert.classList.remove("hidden");
        });
    }
  };

  const handleCheckboxChange = (event) => {
    const daySelectAlert = document.querySelector("#day-select-alert");
    daySelectAlert.classList.add("hidden");
    const { name, checked } = event.target;
    setCheckedDays((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const toggleMeetingType = () => {
    setIsOneTimeMeeting(!isOneTimeMeeting);
  };

  const validateDateRange = () => {
    if (
      endDate.isBefore(startDate, "day") ||
      startDate.isBefore(dayjs(), "day")
    ) {
      setDayError(true);
    } else {
      setDayError(false);
    }
  };

  const validateTimeRange = () => {
    if (endTime.isBefore(startTime)) {
      setTimeError(true);
    } else {
      setTimeError(false);
    }
  };

  useEffect(() => {
    validateTimeRange();
  }, [startTime]);

  useEffect(() => {
    validateTimeRange();
  }, [endTime]);

  useEffect(() => {
    validateDateRange();
  }, [startDate]);

  useEffect(() => {
    validateDateRange();
  }, [endDate]);

  const handleStartDateChange = (newValue) => {
    setStartDate(newValue);
    validateDateRange();
  };

  const handleEndDateChange = (newValue) => {
    setEndDate(newValue);
    validateDateRange();
  };

  const handleStartTimeChange = (newValue) => {
    setStartTime(newValue);
    validateTimeRange();
  };

  const handleEndTimeChange = (newValue) => {
    setEndTime(newValue);
    validateTimeRange();
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

  return isLoading ? (
    <div className="flex items-center justify-center h-screen">
      <Box
        className="bg-green-500 text-white p-6 rounded shadow-lg"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        Loading...
      </Box>
    </div>
  ) : isError ? (
    <div className="flex items-center justify-center h-screen">
      <Box
        className="bg-red-500 text-white p-6 rounded shadow-lg"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        An error occurred, please try again.
      </Box>
    </div>
  ) : !officer ? (
    <div className="flex items-center justify-center h-screen">
      <Box
        className="bg-red-500 text-white p-6 rounded shadow-lg"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        You do not have the correct permissions to view this page.
      </Box>
    </div>
  ) : (
    <div className="flex items-center justify-center mt-14">
      <Card className="w-full max-w-md">
        <CardContent>
          <Typography variant="h5" component="h2" className="mb-4 text-center">
            Create a Meeting
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <FormGroup>
              <FormControlLabel
                control={<Checkbox />}
                checked={isOneTimeMeeting}
                onClick={toggleMeetingType}
                label="One time meeting"
              />
              <FormControlLabel
                control={<Checkbox />}
                checked={!isOneTimeMeeting}
                onClick={toggleMeetingType}
                label="Recurring meeting"
              />
            </FormGroup>

            <div className={isOneTimeMeeting ? "" : "hidden"}>
              <DatePicker
                label="Select Day of Meeting"
                required
                disablePast
                onChange={handleStartDateChange}
                defaultValue={today}
                className="mb-4"
              />
            </div>

            <div className={isOneTimeMeeting ? "hidden" : ""}>
              <div>Select Meeting Days (Sunday - Saturday)</div>
              <FormGroup
                sx={{ display: "flex", flexDirection: "row" }}
                className="mb-5"
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      name="Sun"
                      checked={checkedDays.Sun}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="S"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="Mon"
                      checked={checkedDays.Mon}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="M"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="Tue"
                      checked={checkedDays.Tue}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="T"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="Wed"
                      checked={checkedDays.Wed}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="W"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="Thu"
                      checked={checkedDays.Thu}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="R"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="Fri"
                      checked={checkedDays.Fri}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="F"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="Sat"
                      checked={checkedDays.Sat}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="S"
                />
              </FormGroup>
              <DatePicker
                label="Select Start of Range"
                defaultValue={today}
                onChange={handleStartDateChange}
                maxDate={endDate}
                disablePast
                className="!mb-5"
                orientation="landscape"
              />
              <DatePicker
                label="Select End of Range"
                defaultValue={oneMonth}
                minDate={startDate}
                onChange={handleEndDateChange}
                className="!mb-5"
                disablePast
                orientation="landscape"
              />
            </div>
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
            <div id="day-select-alert" className="hidden">
              <Alert severity="error">
                Please select at least one day to have meetings on.
              </Alert>
            </div>

            <div id="server-error-alert" className="hidden">
              <Alert severity="error">
                A server error occurred. Please try again later.
              </Alert>
            </div>

            <div id="success-alert" className="hidden">
              <Alert severity="success">
                Created {numMeetingsCreated} new meeting(s).{" "}
                <NavLink to={`/club/${clubId}`}>
                  <span className="text-blue-500 underline">
                    Back to club homepage
                  </span>
                </NavLink>
              </Alert>
            </div>

            <div className="mt-4">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                className="bg-blue-500 hover:bg-blue-600"
                disabled={isLoadingButton}
              >
                {isLoadingButton ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Create Meeting"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateMeeting;
