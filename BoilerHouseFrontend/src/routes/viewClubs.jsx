import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  FormControl,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import axios from "axios";

const ViewClubs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [selectedClubSize, setSelectedClubSize] = useState("None");
  const [selectedTimeCommitment, setSelectedTimeCommitment] = useState("None");
  const [timeCommitmentFilter, setTimeCommitmentFilter] = useState("None");
  const [selectedAvailability, setSelectedAvailability] = useState("None");

  // userAvailability is stored as a JSON object
  const [userAvailability, setUserAvailability] = useState({});

  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] =
    useState("None");

  const [selectedCulture, setSelectedCulture] = useState("");
  const [cultureFilter, setCultureFilter] = useState("");
  const [openFilterMenu, setOpenFilterMenu] = useState(false);

  const [filteredData, setFilteredData] = useState([]);

  const [minClubSize, setMinClubSize] = useState(0);
  const [maxClubSize, setMaxClubSize] = useState(Infinity);
  const [error, setError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubs = async () => {
      setIsLoadingClubs(true);
      const token = localStorage.getItem("token");
      if (token) {
        axios({
          url: "http://127.0.0.1:8000/api/clubs/",
          method: "GET",
          headers: {
            Authorization: token,
          },
          params: {
            approved: "True",
          },
        })
          .then((res) => {
            setData(res.data.clubs);
            setFilteredData(res.data.clubs);
            setIsLoadingClubs(false);
          })
          .catch(() => {
            setIsLoadingClubs(false);
            setError(true);
          });
      }
    };
    fetchClubs();

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("username");
      if (token) {
        const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
          headers: {
            Authorization: token,
          },
          params: {
            username: userId,
          },
        });
        const availability = response.data.availability;
        setUserAvailability(availability);
      }
    };
    fetchProfile();
  }, []);

  const handleClick = (event) => {
    navigate(`/club/${event.target.getAttribute("index")}`);
  };

  const changeSelectedClubSize = (event) => {
    setSelectedClubSize(event.target.value);
  };

  const changeSelectedTimeCommitment = (event) => {
    setSelectedTimeCommitment(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const changeSelectedAvailability = (event) => {
    setSelectedAvailability(event.target.value);
  };

  const applyFilters = () => {
    setOpenFilterMenu(false);

    switch (selectedClubSize) {
      case "None":
        setMinClubSize(0);
        setMaxClubSize(Infinity);
        break;
      case "1 - 9":
        setMinClubSize(1);
        setMaxClubSize(9);
        break;
      case "10 - 24":
        setMinClubSize(10);
        setMaxClubSize(24);
        break;
      case "25 - 49":
        setMinClubSize(25);
        setMaxClubSize(49);
        break;
      case "50 - 99":
        setMinClubSize(50);
        setMaxClubSize(99);
        break;
      case "100+":
        setMinClubSize(100);
        setMaxClubSize(Infinity);
        break;
    }

    setTimeCommitmentFilter(selectedTimeCommitment);
    setCultureFilter(selectedCulture);
    setSelectedAvailabilityFilter(selectedAvailability);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setMinClubSize(0);
    setMaxClubSize(Infinity);
    setSelectedClubSize("None");
    setOpenFilterMenu(false);
    setSelectedTimeCommitment("None");
    setTimeCommitmentFilter("None");
    setSelectedCulture("");
    setCultureFilter("");
    setSelectedAvailability("None");
    setSelectedAvailabilityFilter("None");
  };

  useEffect(() => {
    handleFilter();
  }, [
    searchTerm,
    minClubSize,
    maxClubSize,
    timeCommitmentFilter,
    cultureFilter,
    selectedAvailabilityFilter,
  ]);

  // convert 12 hour time to 24 hour time
  function convertTo24Hour(time12Hour) {
    const [time, modifier] = time12Hour.split(" ");
    let [hours, minutes] = time.split(":");

    // Convert hours to a number
    hours = parseInt(hours, 10);

    // Adjust hours based on whether it's AM or PM
    if (modifier.toLowerCase() === "pm" && hours !== 12) {
      hours += 12;
    } else if (modifier.toLowerCase() === "am" && hours === 12) {
      hours = 0;
    }

    // Format hours and minutes to always be two digits
    const hoursStr = String(hours).padStart(2, "0");
    const minutesStr = String(minutes).padStart(2, "0");

    return `${hoursStr}:${minutesStr}`;
  }

  // given a date, returns the day of the week
  function getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return daysOfWeek[date.getDay()];
  }

  const handleFilter = () => {
    let searchTermFilterList = new Set();
    let sizeFilerList = new Set();
    let timeCommitmentFilterList = new Set();
    let cultureFilterList = new Set();
    let availabilityFilterList = new Set();

    const useSizeFilter = selectedClubSize !== "None";
    const useTimeCommitmentFilter = timeCommitmentFilter !== "None";
    const useCultureFilter = cultureFilter.length > 0;
    const useAvailabilityFilter = selectedAvailabilityFilter !== "None";

    const startHour = 8;
    const interval = 30;

    // turns day, index into time
    // Sunday, 0 => Sunday 8AM
    const getSlot = (day, x) => {
      const hour = Math.floor(x / (60 / interval)) + startHour;
      const minutes = (x % (60 / interval)) * interval;

      return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    };

    let userAvailabilityTranslated = {};
    let hasUserSetAvailability = false;
    Object.entries(userAvailability).forEach(([day, times]) => {
      userAvailabilityTranslated[day] = [];
      times.forEach((time) => {
        hasUserSetAvailability = true;
        userAvailabilityTranslated[day].push([
          getSlot(day, time.start),
          getSlot(day, time.end),
        ]);
      });
    });

    data.forEach((club) => {
      const clubId = club.id;
      const members = club.num_members;

      if (club.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        searchTermFilterList.add(clubId);
      }

      if (members >= minClubSize && members <= maxClubSize) {
        sizeFilerList.add(clubId);
      }

      if (club.time_commitment === timeCommitmentFilter) {
        timeCommitmentFilterList.add(clubId);
      }

      if (club.culture.toLowerCase().includes(cultureFilter.toLowerCase())) {
        cultureFilterList.add(clubId);
      }

      const meetings = club.meetings;

      // add club to filter if it has no meetings
      if (meetings.length == 0) {
        availabilityFilterList.add(clubId);
      }

      // add club to filter is user hasn't filled out availability
      if (!hasUserSetAvailability) {
        availabilityFilterList.add(clubId);
      }

      meetings.forEach((meeting) => {
        const day = getDayOfWeek(meeting.date);
        const startTime = convertTo24Hour(meeting.startTime);
        const endTime = convertTo24Hour(meeting.endTime);

        const userAvailabilityForDay = userAvailabilityTranslated[day];
        userAvailabilityForDay.forEach((time) => {
          if (time[0] <= startTime && time[1] >= endTime) {
            availabilityFilterList.add(clubId);
          }
        });
      });
    });

    let filteredList = searchTermFilterList;
    if (useSizeFilter) {
      filteredList = filteredList.intersection(sizeFilerList);
    }
    if (useTimeCommitmentFilter) {
      filteredList = filteredList.intersection(timeCommitmentFilterList);
    }
    if (useCultureFilter) {
      filteredList = filteredList.intersection(cultureFilterList);
    }
    if (useAvailabilityFilter) {
      filteredList = filteredList.intersection(availabilityFilterList);
    }

    let filteredClubs = [];

    data.forEach((club) => {
      if (filteredList.has(club.id)) {
        filteredClubs.push(club);
      }
    });

    setFilteredData(filteredClubs);
  };

  const handleCultureFilter = (e) => {
    setSelectedCulture(e.target.value);
  };

  return (
    <div className="container mx-auto p-5 max-w-[80%]">
      <div className="flex items-center mb-5 space-x-3">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            handleSearchChange(e);
          }}
          className="flex-grow p-3 border border-gray-300 rounded"
        />
        <div className="relative">
          <button
            className="p-3 bg-gray-300 border border-gray-400 rounded hover:bg-gray-400 transition"
            onClick={() => setOpenFilterMenu(!openFilterMenu)}
          >
            Filters
          </button>
          {openFilterMenu && (
            <div className="absolute right-0 mt-2 p-4 bg-white border border-gray-300 rounded shadow-lg z-10">
              <Typography variant="h6">Club Size</Typography>
              <FormControl component="fieldset">
                <Typography variant="subtitle1">Number of Members</Typography>
                <RadioGroup
                  value={selectedClubSize}
                  onChange={changeSelectedClubSize}
                >
                  <FormControlLabel
                    value="None"
                    control={<Radio />}
                    label="None"
                  />
                  <FormControlLabel
                    value="1 - 9"
                    control={<Radio />}
                    label="1 - 9"
                  />
                  <FormControlLabel
                    value="10 - 24"
                    control={<Radio />}
                    label="10 - 24"
                  />
                  <FormControlLabel
                    value="25 - 49"
                    control={<Radio />}
                    label="25 - 49"
                  />
                  <FormControlLabel
                    value="50 - 99"
                    control={<Radio />}
                    label="50 - 99"
                  />
                  <FormControlLabel
                    value="100+"
                    control={<Radio />}
                    label="100+"
                  />
                </RadioGroup>
              </FormControl>

              <Typography variant="h6">Time Commitment</Typography>
              <FormControl component="fieldset">
                <Typography variant="subtitle1">Hours per week</Typography>
                <RadioGroup
                  value={selectedTimeCommitment}
                  onChange={changeSelectedTimeCommitment}
                >
                  <FormControlLabel
                    value="None"
                    control={<Radio />}
                    label="None"
                  />
                  <FormControlLabel
                    value="1-5 hours"
                    control={<Radio />}
                    label="1 - 5 hours"
                  />
                  <FormControlLabel
                    value="6-10 hours"
                    control={<Radio />}
                    label="6 - 10 hours"
                  />
                  <FormControlLabel
                    value="11-15 hours"
                    control={<Radio />}
                    label="11 - 15 hours"
                  />
                  <FormControlLabel
                    value="16+ hours"
                    control={<Radio />}
                    label="16+ hours"
                  />
                </RadioGroup>
              </FormControl>
              <Typography variant="h6">Culture</Typography>
              <Typography variant="subtitle1">Filter by Culture</Typography>

              <input
                type="text"
                placeholder="Filter by culture"
                value={selectedCulture}
                onChange={(e) => {
                  handleCultureFilter(e);
                }}
                className="flex-grow p-3 border border-gray-300 rounded"
              />

              <Typography variant="h6">Availability</Typography>
              <Typography variant="subtitle1">
                Filter by your availability
              </Typography>
              <Typography variant="subtitle2">
                Note: If you haven&apos;t filled out your availability in your
                profile, you are assumed to be free all the time. This filter
                returns clubs with at least one meeting in the future in which
                you are free. Clubs with no future meetings are also returned.
              </Typography>

              <FormControl component="fieldset">
                <RadioGroup
                  value={selectedAvailability}
                  onChange={changeSelectedAvailability}
                >
                  <FormControlLabel
                    value="None"
                    control={<Radio />}
                    label="None"
                  />
                  <FormControlLabel
                    value="Filter by Availability"
                    control={<Radio />}
                    label="Filter by Availability"
                  />
                </RadioGroup>
              </FormControl>
              <Button
                variant="contained"
                className="!mt-5 !mx-auto !justify-center"
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
              <Button
                variant="contained"
                className="!mt-5 !mx-auto !justify-center"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {filteredData.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 overflow-y-auto h-[70%] text-align-center bg-gray-200 rounded-lg border border-black p-5">
          {filteredData.map((item) => (
            <div
              key={item.id}
              index={item.id}
              className="relative h-48 rounded-lg bg-cover bg-center border border-gray-600 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-yellow-500"
              style={{ backgroundImage: `url("${item.icon}")` }}
              onClick={handleClick}
            >
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-center p-2 rounded-b-lg">
                <span>{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center h-screen">
          <p className="text-black text-center font-bold rounded-md">
            {isLoadingClubs
              ? "Loading..."
              : error
              ? "There was an error fetching clubs. Please try again later."
              : "No clubs found matching criteria"}
          </p>
        </div>
      )}
    </div>
  );
};
export default ViewClubs;
