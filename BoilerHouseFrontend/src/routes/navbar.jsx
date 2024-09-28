import { Outlet } from "react-router-dom";

const Navbar = () => {
  return (
    <>
    <nav className="bg-gray-400 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">
          BoilerHouse
        </div>
        <ul className="flex space-x-6">
          <li><a href="#home" className="text-white hover:text-gray-300">Home</a></li>
          <li><a href="#about" className="text-white hover:text-gray-300">About</a></li>
          <li><a href="#services" className="text-white hover:text-gray-300">Services</a></li>
          <li><a href="#contact" className="text-white hover:text-gray-300">Contact</a></li>
        </ul>
      </div>
    </nav>
    <Outlet />
    </>
  );
}

export default Navbar;