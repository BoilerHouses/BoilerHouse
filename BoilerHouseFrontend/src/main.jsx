import * as React from "react";
import * as ReactDOM from "react-dom/client";

import Navbar from "./routes/navbar";
import RegisterUser from "./routes/registerUser";
import ErrorPage from "./error-page";
import UserLogin from "./routes/loginUser";
import LandingPage from "./routes/landingPage";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";


import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navbar/>,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: "/register",
        element: <RegisterUser/>
      },
      {
        path: "/login",
        element: <UserLogin/>
      },
      {
        index: true,
        element: <LandingPage/>
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
