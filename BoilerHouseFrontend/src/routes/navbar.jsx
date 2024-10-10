import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { AuthContext } from './authProvider';
import { useContext } from 'react';

const Navbar = () => {
  
  const { isLoggedIn } = useContext(AuthContext);

  return isLoggedIn ? (
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
                to="/clubcreation"
                className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold"
              >
                Create a Club
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/profile"
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
