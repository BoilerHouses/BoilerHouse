import React, { useState } from "react";
import { Box, Button } from "@mui/material";

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
  const x = daysOfWeek.indexOf(day)
  const hour = parseInt(time.substring(0, 2)) - startHour;
  const minutes = parseInt(time.substring(3, 5));
  const y = hour * (60 / interval) + minutes / interval
  return ([x, y])
}

// translates a coordinate into a time pair
// (0, 0) => Sunday, 08:00
const getSlot = (x, y) => {
  const day = daysOfWeek[x]

  const hour = Math.floor(y / (60 / interval)) + startHour
  const minutes = (y % (60 / interval)) * interval

  return(`${day}-${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`)
}

const Availability = () => {
  const timeSlots = generateTimeSlots();
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSlots, setDraggedSlots] = useState([]);

  const [startCoord, setStartCoord] = useState([-1, -1])


  // toggle mode
  // on: toggle slots ON
  // off: toggle slots OFF
  const [toggleMode, setToggleMode] = useState("on");

  const isSelected = (day, time) => {
    return selectedSlots.includes(`${day}-${time}`);
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

    setStartCoord(getCoord(day, time))
  };

  // Add slots to dragged state while dragging
  const handleMouseOver = (day, time) => {
    if (!isDragging) {
      return;
    }
    // const slot = `${day}-${time}`;
    // if (!draggedSlots.includes(slot)) {
    //   setDraggedSlots((prev) => [...prev, slot]);
    // }

    let startX = startCoord[0]
    let startY = startCoord[1]

    let endX = getCoord(day, time)[0]
    let endY = getCoord(day, time)[1]

    let xStep = 1
    let yStep = 1

    if (endY < startY) {
      yStep = -1;
    }

    if (endX < startX) {
      xStep = -1;
    }

    let slots = []
    for (let x = startX; x != endX + xStep; x += xStep) {
      for (let y = startY; y != endY + yStep; y += yStep) {
        const slot = getSlot(x, y)
        slots.push(slot)
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
          output.splice(index, 1)
        }
      });

      setSelectedSlots(output); 
    }
    setDraggedSlots([]);
  };
 
  // get the times that are currently selected
  const getTimes = () => {
    let slots = selectedSlots.sort()
    let days = [[], [], [], [], [], [], []]

    slots.forEach((slott) => { 
      let t = slott.split("-")
      let slot = getCoord(t[0], t[1]);

      let placed = false
      for (let i = 0; i < days[slot[0]].length; i++) {
        if (days[slot[0]][i].end === slot[1] - 1) {
          days[slot[0]][i].end = Math.max(days[slot[0]][i].end, slot[1])
          placed = true
        }
      }
      if (!placed) {
        days[slot[0]].push({start: slot[1], end: slot[1]})
      }
    })
    console.log(days)

  }

  return (
    <div
      className="w-96 select-none"
      onMouseUp={handleMouseUp}
    >
      <Box className="grid grid-cols-8 ">
        <div></div>
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-bold text-s">
            {day}
          </div>
        ))}
        {timeSlots.map((time) => (
          <React.Fragment key={time}>
            <div className="text-right pr-2 text-xs">{time}</div>
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className={`border h-4 cursor-pointer 
                  ${isSelected(day, time) ? "bg-blue-500" : "bg-gray-100"} 
                  ${
                    draggedSlots.includes(`${day}-${time}`) ? "bg-blue-300" : ""
                  } 
                  hover:bg-blue-200`}
                onMouseDown={() => handleMouseDown(day, time)}
                onMouseOver={() => handleMouseOver(day, time)}
              />
            ))}
          </React.Fragment>
        ))}
      </Box>
      <Button onClick={getTimes}>get times</Button>
    </div>
  );
};

export default Availability;
