import * as ReactDOM from "react-dom/client";

import Navbar from "./routes/navbar";
import RegisterUser from "./routes/registerUser";
import ErrorPage from "./routes/errorPage";
import UserLogin from "./routes/loginUser";
import ForgotPassword from "./routes/forgotPassword";
import LandingPage from "./routes/landingPage";
import VerifyAccount from "./routes/verifyAccount";
import ActivateAccount from "./routes/activateAccount";
import RegisterUserAdmin from "./routes/registerUserAdmin";
import ResetPassword from "./routes/resetPassword";
import ViewProfile from "./routes/viewProfile";
import EditProfile from "./routes/editProfile";
import Availability from "./routes/availability";
import { AuthProvider } from "./routes/authProvider";

import CreateProfile from "./routes/createProfile";
import ClubCreation from "./routes/clubCreation";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navbar />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "/register",
        element: <RegisterUser />,
      },
      {
        path: "/registeradmin",
        element: <RegisterUserAdmin />,
      },
      {
        path: "/login",
        element: <UserLogin />,
      },
      {
        path: "/forgot_password",
        element: <ForgotPassword />,
      },
      {
        path: "/verify_account",
        element: <VerifyAccount />,
      },
      {
        path: "/create_profile",
        element: <CreateProfile />,
      },
      {
        path: "/profile",
        element: <ViewProfile />,
      },
      {
        path: "/edit_profile",
        element: <EditProfile />,
      },
      {
        path: "/activate/:pk/:token",
        element: <ActivateAccount />,
      },
      {
        path: "/reset_password/:pk/:token",
        element: <ResetPassword />,
      },
      {
        path: "/profile",
        element: <ViewProfile />,
      },
      {
        path: "/clubcreation",
        element: <ClubCreation />,
      },
      {
        path: "/viewProfile",
        element: <ViewProfile />,
      },
      {
        path: "/availability",
        element: <Availability />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
