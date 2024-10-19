import { useEffect, useState } from "react";
;import { useNavigate } from "react-router-dom";

import axios from "axios";

const ViewClubs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState([]);
    const [isLoadingClubs, setIsLoadingClubs] = useState(false);
    const navigate = useNavigate();
    const filteredData = data.filter(item =>
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
                approved: 'True'
              }
            });
            if (response.status == 200) {
              setData(response.data.clubs);
              setIsLoadingClubs(false);
            } else {
              alert('Internal Server Error')
            }

          }
        };
        fetchClubs();
      }, []);

      const handleClick = (event) => {
        navigate(`/club/${event.target.getAttribute('index')}`)
      }
      
      if (filteredData.length > 0) {
        return (
            <div className="container mx-auto p-5 max-w-[80%]">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 mb-5 border border-gray-300 rounded"  
                />
                <div className="grid grid-cols-2 gap-5 overflow-y-auto h-[70%] text-align-center bg-gray-200 rounded-lg border border-black p-5">
                    {filteredData.map(item => (
                        <div
                            key={item.name}
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

            </div>
        );
      } else {
        return  (
            <div className="container mx-auto p-5 max-w-3xl">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 mb-5 border border-gray-300 rounded"  
                />
                <div className="flex justify-center h-screen">
                     <p className="text-black text-center font-bold rounded-md">{isLoadingClubs ? "Loading..." : "No clubs found matching criteria"}</p>
                </div>
            </div>
        );
      }
    };
export default ViewClubs;