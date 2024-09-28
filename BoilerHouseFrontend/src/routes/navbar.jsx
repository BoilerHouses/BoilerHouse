import { Outlet } from "react-router-dom";

const Navbar = () => {
  return (
    <>
    <nav className="bg-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <a href="#home" className="text-4xl font-bold">
          <span className="text-black">Boiler</span>
          <span className="text-yellow-500">House</span>
        </a>
        <ul className="flex space-x-8 text-lg">
          <li><a href="/login" className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold">Login</a></li>
          <li><a href="/register" className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold">Register</a></li>
          <li><a href="#profile" className="text-black  hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300 font-bold">Profile</a></li>
        </ul>
      </div>
    </nav>
    <Outlet />
    </>
  );
}

export default Navbar;
