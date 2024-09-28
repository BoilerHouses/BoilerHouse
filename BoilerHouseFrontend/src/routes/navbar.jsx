const Navbar = () => {
  return (
    <nav className="bg-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <a href="#home" className="text-4xl font-bold">
          <span className="text-black">Boiler</span>
          <span className="text-yellow-500">House</span>
        </a>
        <ul className="flex space-x-8 text-lg">
          <li><a href="#login" className="text-black hover:bg-gray-300 hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300">Login</a></li>
          <li><a href="#register" className="text-black hover:bg-gray-300 hover:text-yellow-500 px-3 py-2 rounded-md transition duration-300">Register</a></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
