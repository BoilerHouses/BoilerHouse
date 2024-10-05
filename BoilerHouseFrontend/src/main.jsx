import * as ReactDOM from "react-dom/client";

import Navbar from "./routes/navbar";
import RegisterUser from "./routes/registerUser";
import ErrorPage from "./routes/error-page";
import UserLogin from "./routes/loginUser";
import ForgotPassword from "./routes/forgotPassword";
import LandingPage from "./routes/landingPage";
import VerifyAccount from "./routes/verifyAccount";
import ActivateAccount from "./routes/activateAccount"
import CreateProfile from "./routes/createProfile";
import ViewProfile from "./routes/viewProfile"
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
        index: true,
        element: <LandingPage/>
      },
      {
        path: "/register",
        element: <RegisterUser/>
      },
      {
        path: "/login",
        element: <UserLogin/>
      },
      {
        path: "/forgot_password",
        element: <ForgotPassword/>
      },
      {
        path: "/verify_account",
        element: <VerifyAccount/>
      },
      {
        path: "/create_profile",
        element: <CreateProfile/>
      },
      {
        path: "/activate/:pk/:token",
        element: <ActivateAccount/>
      },{
        path:"/viewProfile",
        element: <ViewProfile/>
      }

    ]
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <RouterProvider router={router} />
  // </React.StrictMode>
);
