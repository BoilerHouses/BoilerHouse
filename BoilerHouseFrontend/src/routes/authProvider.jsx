import { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create the AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to check login status (API call)
  const checkLoginStatus = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
        headers: {
          Authorization: token,
        },
      });
      // successfully retrieved user data, user is logged in
      if (response.status === 200) {
        setIsLoggedIn(true);
      }
    }
  };

  // Check login status when the provider mounts
  useEffect(() => {
    async function fetch() {
      await checkLoginStatus();
    }
    fetch();
  }, []);

  // Return the AuthContext.Provider with state
  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
