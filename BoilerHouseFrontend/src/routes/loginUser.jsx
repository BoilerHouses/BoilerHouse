import { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { NavLink } from "react-router-dom";

import axios from "axios";

const isValidEmailAddress = (email) => {
  const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
};

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordHelperText, setPasswordHelperText] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (event) => {
    const newEmail = event.target.value;
    setEmail(newEmail);

    const invalidCredentialsAlert = document.querySelector(
      "#incorrect-credentials-alert"
    );
    invalidCredentialsAlert.classList.add("hidden");

    if (!isValidEmailAddress(newEmail)) {
      setEmailError(true);
      setEmailHelperText("Please enter a valid email address");
    } else {
      setEmailError(false);
      setEmailHelperText("");
    }
  };

  const handlePasswordChange = (event) => {
    const newPassword = event.target.value;
    setPassword(newPassword);

    const invalidCredentialsAlert = document.querySelector(
      "#incorrect-credentials-alert"
    );
    invalidCredentialsAlert.classList.add("hidden");

    if (newPassword.length === 0) {
      setPasswordError(true);
      setPasswordHelperText("Password is required");
    } else {
      setPasswordError(false);
      setPasswordHelperText("");
    }
  };

  const handleSubmit = (e) => {
    const serverAlert = document.querySelector("#server-error-alert");
    serverAlert.classList.add("hidden");

    const invalidCredentialsAlert = document.querySelector(
      "#incorrect-credentials-alert"
    );
    invalidCredentialsAlert.classList.add("hidden");

    const activateAccountAlert = document.querySelector(
      "#activate-account-alert"
    );
    activateAccountAlert.classList.add("hidden");

    e.preventDefault();
    let err = false;

    if (!isValidEmailAddress(email)) {
      setEmailError(true);
      setEmailHelperText("Please enter a valid email address");
      err = true;
    }

    if (password.length === 0) {
      setPasswordError(true);
      setPasswordHelperText("Password is required");
      err = true;
    }

    if (err === false) {
      setIsLoading(true);
      axios({
        // create account endpoint
        url: "http://127.0.0.1:8000/api/loginUser/",
        method: "GET",

        // params
        params: {
          username: email,
          password: password,
        },
      })
        // success
        .then((res) => {
          setIsLoading(false);
          axios.defaults.headers.common['Authorization'] = res.data.token
          alert("successfuly logged in");
        })

        // Catch errors if any
        .catch((err) => {
          setIsLoading(false);

          // invalid credentials
          if (err.status == 401) {
            const invalidCredentialsAlert = document.querySelector(
              "#incorrect-credentials-alert"
            );
            invalidCredentialsAlert.classList.remove("hidden");
          }
          // user hasn't verified account yet
          else if (err.status == 403) {
            const activateAccountAlert = document.querySelector(
              "#activate-account-alert"
            );
            activateAccountAlert.classList.remove("hidden");
          }
          // other server error
          else {
            const serverAlert = document.querySelector("#server-error-alert");
            serverAlert.classList.remove("hidden");
          }
        });
    }
  };

  return (
    <div className="flex items-center justify-center mt-14">
      <Card className="w-full max-w-md">
        <CardContent>
          <Typography variant="h5" component="h2" className="mb-4 text-center">
            Login
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              error={emailError}
              className="bg-white !my-3.5"
              helperText={emailHelperText}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              error={passwordError}
              onChange={handlePasswordChange}
              className="bg-white !my-3.5"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText={passwordHelperText}
            />
            <NavLink
              to="/forgot_password"
              className="cursor-pointer text-center"
            >
              <div className="text-blue-500 underline">Forgot Password?</div>
            </NavLink>

            <div id="incorrect-credentials-alert" className="hidden">
              <Alert severity="error">
                Email or password is incorrect. Please try again, or use the
                Forgot Password link to reset your password.
              </Alert>
            </div>

            <div id="server-error-alert" className="hidden">
              <Alert severity="error">
                A server error occurred. Please try again later.
              </Alert>
            </div>

            <div id="activate-account-alert" className="hidden">
              <Alert severity="error">
                Please verify your account to be able to log in.
              </Alert>
            </div>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className="mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserLogin;
