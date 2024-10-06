import { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert
} from "@mui/material";

import { NavLink } from "react-router-dom";

import axios from "axios";

const isValidEmailAddress = (email) => {
  const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState("");
  const [buttonText, setButtonText] = useState("Send Email");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    const noEmailAlert = document.querySelector("#no-email-alert");
    noEmailAlert.classList.add("hidden");

    const serverAlert = document.querySelector("#server-error-alert");
    serverAlert.classList.add("hidden");
    e.preventDefault();

    let err = false;

    if (!isValidEmailAddress(email)) {
      setEmailError(true);
      setEmailHelperText("Please enter a valid email address");
      err = true;
    }

    if (err === false) {
      setIsLoading(true);

      axios({
        // create account endpoint
        url: "http://127.0.0.1:8000/api/forgotPassword/",
        method: "GET",

        // params
        params: {
          email: email,
        },
      })
        // success
        .then((res) => {
          setButtonText("Email Sent!");

          setIsLoading(false);
        })

        // Catch errors if any
        .catch((err) => {
          setIsLoading(false);

          // there is no account with that associated email
          if (err.status == 401) {
            const noEmailAlert = document.querySelector("#no-email-alert");
            noEmailAlert.classList.remove("hidden");
          }

          else {
            const serverAlert = document.querySelector("#server-error-alert");
            serverAlert.classList.remove("hidden");
          }
        });
    }
  };

  const handleEmailChange = (event) => {
    const noEmailAlert = document.querySelector("#no-email-alert");
    noEmailAlert.classList.add("hidden");

    const newEmail = event.target.value;
    setEmail(newEmail);

    if (!isValidEmailAddress(newEmail)) {
      setEmailError(true);
      setEmailHelperText("Please enter a valid email address");
    } else {
      setEmailError(false);
      setEmailHelperText("");
    }
  };

  return (
    <div className="flex items-center justify-center mt-14">
      <Card className="w-full max-w-md">
        <CardContent>
          <Typography variant="h5" component="h2" className="mb-4 text-center">
            Forgot Password
          </Typography>
          <Typography
            variant="subtitle2"
            component="h2"
            className="mb-4 text-center"
          >
            Enter the email associated with your account to continue
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              error={emailError}
              disabled={buttonText === "Email Sent!"}
              className="bg-white !my-3.5"
              helperText={emailHelperText}
            />

            <div id="no-email-alert" className="hidden">
              <Alert severity="error">
                An account with email {email} does not exist. {" "}
                <NavLink to="/register">
                  <span className="text-blue-500 underline">Register an account</span>
                </NavLink>
                {" instead?"}
              </Alert>
            </div>

            <div id="server-error-alert" className="hidden">
              <Alert severity="error">
                A server error occurred. Please try again later.
              </Alert>
            </div>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading || buttonText === "Email Sent!"}
              className="mt-4"
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                buttonText
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
