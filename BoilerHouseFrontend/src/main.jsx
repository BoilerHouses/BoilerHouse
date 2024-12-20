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
import ClubInformation from "./routes/ClubInformation";
import CreateProfile from "./routes/createProfile";
import ClubCreation from "./routes/clubCreation";
import ManageUsers from "./routes/manageUsers";
import ViewClubs from "./routes/viewClubs";
import ViewApplications from "./routes/viewApplications";
import Availability from "./routes/availability";
import EditClub from "./routes/editClub";
import Questionnaire from "./routes/createQuestionnaire";
import Questions from "./routes/fillQuestions";
import CreateMeeting from "./routes/createMeeting";
import Answers from "./routes/viewAnswers";
import OfficerQuestionnaire from "./routes/createOfficerQuestionnaire";
import OfficerQuestions from "./routes/fillOfficerQuestions";
import OfficerAnswers from "./routes/viewOfficerAnswers";
import { AuthProvider } from "./routes/authProvider";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SendEmail from "./routes/sendEmail.jsx"
import DefaultContact from "./routes/defaultContact"
import ClubDues from "./routes/clubDues"
import ManageDues from "./routes/manageDues.jsx";
import UpcomingMeetings from "./routes/upcomingMeetings"

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
        path: "/profile/:userId",
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
        path: "/clubcreation",
        element: <ClubCreation />,
      },
      {
        path: "/manageUsers",
        element: <ManageUsers />,
      },
      {
        path: "/clubs",
        element: <ViewClubs />,
      },
      {
        path: "/approveClubs",
        element: <ViewApplications />,
      },
      {
        path: "/club/:clubId",
        element: <ClubInformation />,
      },
      {
        path: "/club/:clubId/createMeeting",
        element: <CreateMeeting />,
      },
      {
        path: "/answers/:clubId/:username",
        element: <Answers />,
      },
      {
        path: "/officer_answers/:clubId/:username",
        element: <OfficerAnswers />,
      },
      {
        path: "/availability",
        element: <Availability />,
      },
      {
        path: "/club/:clubId/edit",
        element: <EditClub/>,
      },
      {
        path:"sendEmail",
        element: <SendEmail/>
      },
      {
        path: "/createQuestions/:clubId",
        element: <Questionnaire />,
      },
      {
        path: "/createOfficerQuestions/:clubId",
        element: <OfficerQuestionnaire />,
      },
      {
        path: "/questions/:clubId",
        element: <Questions />,
      },
      {
        path: "/club/:clubId/defaultContact",
        element: <DefaultContact />,
      },
      {
        path: "/officer_questions/:clubId",
        element: <OfficerQuestions />,
      },
      {
        path: "/club/:clubId/clubDues",
        element: <ClubDues />,
      },
      {
        path: "/upcoming_meetings",
        element: <UpcomingMeetings />,
      },
      {
        path:"/manageDues/:clubId",
        element: <ManageDues />
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </LocalizationProvider>
);
