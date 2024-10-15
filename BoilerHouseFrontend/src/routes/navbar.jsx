import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useState , useEffect} from 'react';
import { useLocation } from "react-router-dom";
import axios from "axios";
const Navbar = () => {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const location = useLocation()

  const checkLoginStatus = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const response = await axios.get("http://127.0.0.1:8000/api/verify_token/", {
        headers: {
          Authorization: token,
        },
      });
      // successfully retrieved user data, user is logged in
      if (response.status === 200) {
        setIsLoggedIn(true);
        setIsAdmin(response.data.admin)
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false)
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false)
    } 
  };

  // Check login status when the provider mounts
  useEffect(() => {
    async function fetch() {
      await checkLoginStatus();
    }
    fetch();
  }, [location]);

  return isLoggedIn ? ( isAdmin ? (
    <>
      <nav className="bg-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <NavLink to="/" className="text-4xl font-bold">
            <span className="text-black">Boiler</span>
            <span className="text-yellow-500">House</span>
          </NavLink>
          <ul className="flex space-x-8 text-lg">
          <li>
              <NavLink
                to="/clubs"
                className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold"
              >
                Club List
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/approveClubs"
                className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold"
              >
                View Club Applications
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/manageUsers'
                className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold"
              >
                Manage Users
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/profile/${localStorage.getItem('username')}`}
                className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold"
              >
                Profile
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      <Outlet />
    </>
  ) : (
    <>
      <nav className="bg-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <NavLink to="/" className="text-4xl font-bold">
            <span className="text-black">Boiler</span>
            <span className="text-yellow-500">House</span>
          </NavLink>
          <ul className="flex space-x-8 text-lg">
          <li>
              <NavLink
                to="/clubs"
                className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold"
              >
                Club List
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/clubcreation"
                className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold"
              >
                Create a Club
              </NavLink>
            </li>

            <li>
              <NavLink
                to={`/profile/${localStorage.getItem('username')}`}
                className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold"
              >
                Profile
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      <Outlet />
    </>
  )
  ) : (
    <>
      <nav className="bg-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <NavLink to="/" className="text-4xl font-bold">
            <span className="text-black">Boiler</span>
            <span className="text-yellow-500">House</span>
          </NavLink>
          <ul className="flex space-x-8 text-lg">
            <li>
              <NavLink
                to="/login"
                className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold"
              >
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold"
              >
                Register
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
