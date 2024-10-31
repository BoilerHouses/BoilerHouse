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
            console.log(res.data.clubs);
            setIsLoadingClubs(false);
          })
          .catch(() => {
            setIsLoadingClubs(false);
            setError(true);
          });
      }
    };
    fetchClubs();
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
  };

  useEffect(() => {
    handleFilter();
  }, [
    searchTerm,
    minClubSize,
    maxClubSize,
    timeCommitmentFilter,
    cultureFilter,
  ]);

  const handleFilter = () => {
    let newClubList = [];

    data.forEach((club) => {
      const members = club.num_members;
      if (
        members >= minClubSize &&
        members <= maxClubSize &&
        club.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        if (timeCommitmentFilter === "None" && cultureFilter === "") {
          newClubList.push(club);
        } else if (timeCommitmentFilter === "None") {
          if (
            club.culture.toLowerCase().includes(cultureFilter.toLowerCase())
          ) {
            newClubList.push(club);
          }
        } else if (cultureFilter === "") {
          if (club.time_commitment === timeCommitmentFilter) {
            newClubList.push(club);
          }
        } else {
          if (
            club.time_commitment === timeCommitmentFilter &&
            club.culture.toLowerCase().includes(cultureFilter.toLowerCase())
          ) {
            newClubList.push(club);
          }
        }
      }
    });
    setFilteredData(newClubList);
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
            <div className="absolute right-0 mt-2 p-2 bg-white border border-gray-300 rounded shadow-lg justify-center z-10">
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
