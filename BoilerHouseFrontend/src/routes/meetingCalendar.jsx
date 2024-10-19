import { useState } from "react";

import { Button } from "@mui/material";

import { DatePicker, TimePicker } from "@mui/x-date-pickers";

import dayjs from "dayjs";

function MeetingCalendar() {
  const [selectedDates, setSelectedDates] = useState([]);

  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    if (selectedDates.includes(formattedDate)) {
      setSelectedDates(selectedDates.filter((d) => d !== formattedDate));
    } else {
      setSelectedDates([...selectedDates, formattedDate]);
    }
  };

  const handleCreateMeetings = () => {
    console.log("Creating meetings for:", selectedDates);
    // Implement your logic to create meetings here
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg min-w-52 min-h-52 p-4 relative">
        <h1 className="text-2xl font-bold mb-4">Select Meeting Days</h1>
        <DatePicker
          label="Select Day of Meeting"
          defaultValue={dayjs()}
          className="mb-4"
        />
        <TimePicker label="Basic time picker" />
        <div className="mt-4">
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateMeetings}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Create Meeting
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MeetingCalendar;
