import { Outlet } from "react-router-dom";
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <>
    <nav className="bg-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <NavLink to="/" className="text-4xl font-bold">
          <span className="text-black">Boiler</span>
          <span className="text-yellow-500">House</span>
        </NavLink>
        <ul className="flex space-x-8 text-lg">

          <li><NavLink to="/login" className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold">Login</NavLink></li>
          <li><NavLink to="/register" className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold">Register</NavLink></li>

          <li><a href="#profile" className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold">Profile</a></li>
        </ul>
      </div>
    </nav>
    <Outlet />
    </>
  );
}

export default Navbar;
