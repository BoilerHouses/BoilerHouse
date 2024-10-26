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

  const [selectedClubSize, setSelectedClubSize] = useState("");

  const [openFilterMenu, setOpenFilterMenu] = useState(false);

  const navigate = useNavigate();
  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
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
        if (response.status == 200) {
          console.log(response.data.clubs);
          setData(response.data.clubs);
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

  return (
    <div className="container mx-auto p-5 max-w-[80%]">
      <div className="flex items-center mb-5 space-x-3">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
            <div className="absolute right-0 mt-2 w-48 p-2 bg-white border border-gray-300 rounded shadow-lg">
              <Typography variant="h6" gutterBottom>
                Club Size
              </Typography>
              <FormControl component="fieldset">
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
                    value="100 - 249"
                    control={<Radio />}
                    label="100 - 249"
                  />
                  <FormControlLabel
                    value="250+"
                    control={<Radio />}
                    label="250+"
                  />
                </RadioGroup>
              </FormControl>
              <Button variant="contained" className="!mt-5">
                Apply Filters
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
                <span className="text-sm block">Members: {item.members}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center h-screen">
          <p className="text-black text-center font-bold rounded-md">
            {isLoadingClubs ? "Loading..." : "No clubs found matching criteria"}
          </p>
        </div>
      )}
    </div>
  );
};
export default ViewClubs;
