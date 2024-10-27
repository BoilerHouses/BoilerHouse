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
  const [selectedClubSize, setSelectedClubSize] = useState("1 - 9");
  const [selectedTimeCommitment, setSelectedTimeCommitment] = useState("1-5");
  const [openFilterMenu, setOpenFilterMenu] = useState(false);

  const [filteredData, setFilteredData] = useState([]);

  const [minClubSize, setMinClubSize] = useState(0);
  const [maxClubSize, setMaxClubSize] = useState(Infinity);

  const [minTimeCommitment, setMinTimeCommitment] = useState(0);
  const [maxTimeCommitment, setMaxTimeCommitment] = useState(Infinity);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubs = async () => {
      setIsLoadingClubs(true);
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get("http://127.0.0.1:8000/api/clubs/", {
          headers: {
            Authorization: token,
          },
          params: {
            approved: "True",
          },
        });
        if (response.status === 200) {
          setData(response.data.clubs);
          setFilteredData(response.data.clubs);
          setIsLoadingClubs(false);
        } else {
          alert("Internal Server Error");
        }
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

    switch (selectedTimeCommitment) {
      case "1-5":
        setMinTimeCommitment(1);
        setMaxTimeCommitment(5);
        break;
      case "6-10":
        setMinTimeCommitment(6);
        setMaxTimeCommitment(10);
        break;
      case "11-15":
        setMinTimeCommitment(11);
        setMaxTimeCommitment(15);
        break;
      case "16+":
        setMinTimeCommitment(16);
        setMaxTimeCommitment(Infinity);
        break;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setMinClubSize(0);
    setMaxClubSize(Infinity);
    setMinTimeCommitment(0);
    setMaxTimeCommitment(Infinity);
    setSelectedClubSize("1 - 9");
    setSelectedTimeCommitment("1-5");
    setOpenFilterMenu(false);
  }

  useEffect(() => {
    handleFilter();
  }, [searchTerm, minClubSize, maxClubSize, minTimeCommitment, maxTimeCommitment]);

  const handleFilter = () => {
    let newClubList = [];

    data.forEach((club) => {
      const members = club.num_members;
      const commitment = club.time_commitment; // Assuming `time_commitment` is a field in your data

      if (
        members >= minClubSize &&
        members <= maxClubSize &&
        commitment >= minTimeCommitment &&
        commitment <= maxTimeCommitment &&
        club.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        newClubList.push(club);
      }
    });
    setFilteredData(newClubList);
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
            <div className="absolute right-0 mt-2 w-48 p-2 bg-white border border-gray-300 rounded shadow-lg justify-center z-10">
              <Typography variant="h6">Club Size</Typography>
              <FormControl component="fieldset">
                <Typography variant="subtitle1">Number of Members</Typography>
                <RadioGroup
                  value={selectedClubSize}
                  onChange={changeSelectedClubSize}
                >
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
              <Typography variant="h6" className="mt-4">Time Commitment</Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  value={selectedTimeCommitment}
                  onChange={changeSelectedTimeCommitment}
                >
                  <FormControlLabel
                    value="1-5"
                    control={<Radio />}
                    label="1-5 hours"
                  />
                  <FormControlLabel
                    value="6-10"
                    control={<Radio />}
                    label="6-10 hours"
                  />
                  <FormControlLabel
                    value="11-15"
                    control={<Radio />}
                    label="11-15 hours"
                  />
                  <FormControlLabel
                    value="16+"
                    control={<Radio />}
                    label="16+ hours"
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
        <p className="text-center">No results found.</p>
      )}
    </div>
  );
};

export default ViewClubs;
