import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 flex justify-center items-center">
      <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <h1 className="text-3xl font-semibold text-white text-center mb-6">
          Register
        </h1>
        <form>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-white text-sm font-medium mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-50 text-gray-900 placeholder-gray-600 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Your Name"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-white text-sm font-medium mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-50 text-gray-900 placeholder-gray-600 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Your Email"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-white text-sm font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-50 text-gray-900 placeholder-gray-600 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Your Password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition-all duration-300"
          >
            Register
          </button>
        </form>
        <p className="text-center text-white mt-6">
          Already have an account?{" "}
          <a href="#" className="text-purple-300 hover:text-purple-100">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;
