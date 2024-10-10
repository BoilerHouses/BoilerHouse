  import { createContext, useState, useEffect } from "react";
  import axios from "axios";

  // Create the AuthContext
  export const AuthContext = createContext();

  export const AuthProvider = ({ children }) => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentPath, setCurrentPath] = useState(window.location.pathname); // Track current path


    // Function to check login status (API call)
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
    }, [currentPath]);

    // Return the AuthContext.Provider with state
    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isAdmin, setIsAdmin }}>
          {children}
        </AuthContext.Provider>
      
    );
  };
