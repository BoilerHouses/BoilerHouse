import React, { useState, useEffect } from "react";
import { Box, Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import axios from "axios";

const Availability = () => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSlots, setDraggedSlots] = useState([]);

  const [startCoord, setStartCoord] = useState([-1, -1]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(false);

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);

  const [user, setUser] = useState("");

  // toggle mode
  // on: toggle slots ON
  // off: toggle slots OFF
  const [toggleMode, setToggleMode] = useState("on");
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const startHour = 8;
  const endHour = 22;
  const interval = 30;

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        slots.push(
          `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
        );
      }
    }
    return slots;
  };

  // translates a day, time pair into a coordinate (x, y) on the table
  // Sunday, 08:00 => (0,0)
  const getCoord = (day, time) => {
    const x = daysOfWeek.indexOf(day);
    const hour = parseInt(time.substring(0, 2)) - startHour;
    const minutes = parseInt(time.substring(3, 5));
    const y = hour * (60 / interval) + minutes / interval;
    return [x, y];
  };

  // translates a coordinate into a time pair
  // (0, 0) => Sunday, 08:00
  const getSlot = (x, y) => {
    const day = daysOfWeek[x];

    const hour = Math.floor(y / (60 / interval)) + startHour;
    const minutes = (y % (60 / interval)) * interval;

    return `${day}-${String(hour).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };
  const timeSlots = generateTimeSlots();

  const isSelected = (day, time) => {
    return selectedSlots.includes(`${day}-${time}`);
  };

  const isDragged = (day, time) => {
    return draggedSlots.includes(`${day}-${time}`);
  };

  // Start drag action
  const handleMouseDown = (day, time) => {
    setIsDragging(true);
    const slot = `${day}-${time}`;
    setDraggedSlots([slot]);

    if (isSelected(day, time)) {
      setToggleMode("off");
    } else {
      setToggleMode("on");
    }

    setStartCoord(getCoord(day, time));
  };

  // Add slots to dragged state while dragging
  const handleMouseOver = (day, time) => {
    if (!isDragging) {
      return;
    }
    const slot = `${day}-${time}`;
    if (!draggedSlots.includes(slot)) {
      setDraggedSlots((prev) => [...prev, slot]);
    }

    let startX = startCoord[0];
    let startY = startCoord[1];

    let endX = getCoord(day, time)[0];
    let endY = getCoord(day, time)[1];

    let xStep = 1;
    let yStep = 1;

    if (endY < startY) {
      yStep = -1;
    }

    if (endX < startX) {
      xStep = -1;
    }

    let slots = [];
    for (let x = startX; x != endX + xStep; x += xStep) {
      for (let y = startY; y != endY + yStep; y += yStep) {
        const slot = getSlot(x, y);
        slots.push(slot);
      }
    }
    setDraggedSlots(slots);
  };

  // Finish drag action and update selected slots
  const handleMouseUp = () => {
    setIsDragging(false);
    if (toggleMode === "on") {
      let output = selectedSlots;
      draggedSlots.forEach((slot) => {
        if (!selectedSlots.includes(slot)) {
          output.push(slot);
        }
      });
      setSelectedSlots(output);
    } else {
      let output = selectedSlots;
      draggedSlots.forEach((slot) => {
        if (selectedSlots.includes(slot)) {
          const index = selectedSlots.indexOf(slot);
          output.splice(index, 1);
        }
      });
      setSelectedSlots(output);
    }

    setDraggedSlots([]);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSuccess(false);
  };

  // get the times that are currently selected
  const getTimes = () => {
    setIsProcessing(true);
    let slots = selectedSlots.sort();
    let days = [[], [], [], [], [], [], []];

    slots.forEach((s) => {
      let t = s.split("-");
      let slot = getCoord(t[0], t[1]);

      let placed = false;
      for (let i = 0; i < days[slot[0]].length; i++) {
        if (days[slot[0]][i].end === slot[1] - 1) {
          days[slot[0]][i].end = Math.max(days[slot[0]][i].end, slot[1]);
          placed = true;
        }
      }
      if (!placed) {
        days[slot[0]].push({ start: slot[1], end: slot[1] });
      }
    });

    days = {
      Sun: days[0],
      Mon: days[1],
      Tue: days[2],
      Wed: days[3],
      Thu: days[4],
      Fri: days[5],
      Sat: days[6],
    };
    days = JSON.stringify(days);

    axios({
      // create account endpoint
      url: "http://127.0.0.1:8000/api/setAvailability/",
      method: "GET",

      // params
      params: {
        email: user,
        availability: days,
      },
    })
      // success
      .then(() => {
        setIsProcessing(false);
        setOpenSuccess(true);
      })

      // Catch errors if any
      .catch(() => {
        setIsProcessing(false);
        setOpenError(true);
      });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      let response;
      if (token) {
        try {
          response = await axios.get("http://127.0.0.1:8000/api/profile/", {
            params: {
              username: localStorage.getItem("username"),
            },
            headers: {
              Authorization: token,
            },
          });
        } catch {
          setError(true);
        }
        // successfully retrieved user data, user is logged in
        // load in user availability
        if (response && response.status === 200) {
          setUser(response.data.email);
          setIsLoggedIn(true);

          const availability = response.data.availability;
          for (const day in availability) {
            const ranges = availability[day];
            ranges.forEach((range) => {
              const start = range.start;
              const end = range.end;

              const index = daysOfWeek.indexOf(day);

              for (let i = start; i <= end; i++) {
                const slot = getSlot(index, i);
                if (!selectedSlots.includes(slot)) {
                  setSelectedSlots((prevSlots) => [...prevSlots, slot]);
                }
              }
            });
          }
        }
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

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
  ) : error ? (
    <div className="flex items-center justify-center h-screen">
      <Box
        className="bg-red-500 text-white p-6 rounded shadow-lg"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        A server error occurred. Please try again.
      </Box>
    </div>
  ) : !isLoggedIn ? (
    <div className="flex items-center justify-center h-screen">
      <Box
        className="bg-red-500 text-white p-6 rounded shadow-lg"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        Please log in to use this feature.
      </Box>
    </div>
  ) : (
    <div className="flex flex-row min-h-screen justify-center items-center">
      <div
        className="w-1/2 select-none justify-center h-screen"
        onMouseUp={handleMouseUp}
      >
        <Box className="grid grid-cols-8 ">
          <div></div>
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center font-bold text-xs">
              {day}
            </div>
          ))}
          {timeSlots.map((time) => (
            <React.Fragment key={time}>
              <div className="text-right pr-2 text-xs">
                {Number(time.substring(0, 2)) <= 11
                  ? Number(time.substring(0, 2)) + time.substring(2, 5) + " AM"
                  : Number(time.substring(0, 2)) == 12
                  ? 12 + time.substring(2, 5) + " PM"
                  : Number(time.substring(0, 2)) -
                    12 +
                    time.substring(2, 5) +
                    " PM"}
              </div>
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className={`border h-4 cursor-pointer
                  ${isDragged(day, time) ? "!bg-blue-300" : ""} 

                  ${isSelected(day, time) ? "bg-blue-500" : "bg-gray-100"}  
                  hover:bg-blue-200`}
                  onMouseDown={() => handleMouseDown(day, time)}
                  onMouseOver={() => handleMouseOver(day, time)}
                />
              ))}
            </React.Fragment>
          ))}
        </Box>
        <div className="h-4"></div>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={isProcessing}
          onClick={getTimes}
        >
          {isProcessing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Set Availability"
          )}
        </Button>
      </div>
      <Snackbar
        open={openSuccess}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Availability Set!
        </Alert>
      </Snackbar>

      <Snackbar
        open={openError}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          A server error occurred. Please try again.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Availability;
