import { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";

import { Visibility, VisibilityOff } from "@mui/icons-material";

import axios from "axios";

const isValidEmailAddress = (email) => {
  const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
};

const isValidPassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

const UserRegistration = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordHelperText, setPasswordHelperText] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordHelperText, setConfirmPasswordHelperText] =
    useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleEmailChange = (event) => {
    const emailAlert = document.querySelector("#email-already-exists-alert");
    emailAlert.classList.add("hidden");

    const newEmail = event.target.value;
    setEmail(newEmail);

    setFormData({ ...formData, email: newEmail });

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
    setFormData({ ...formData, password: newPassword });

    if (!isValidPassword(newPassword)) {
      setPasswordError(true);
      setPasswordHelperText(
        "Password needs to be at least 8 characters long, contain at least 1 upper case letter, and at least 1 number"
      );
    } else {
      setPasswordError(false);
      setPasswordHelperText("");
    }
  };

  const handleConfirmPasswordChange = (event) => {
    const newPassword = event.target.value;
    setConfirmPassword(newPassword);
    setFormData({ ...formData, confirmPassword: newPassword });

    if (newPassword !== password) {
      setConfirmPasswordError(true);
      setConfirmPasswordHelperText("Passwords do not match");
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordHelperText("");
    }
  };


  const handleSubmit = (e) => {
    const serverAlert = document.querySelector("#server-error-alert");
    serverAlert.classList.add("hidden");

    const adminKeyAlert = document.querySelector("#admin-key-alert");
    adminKeyAlert.classList.add("hidden");

    const emailAlert = document.querySelector("#email-already-exists-alert");
    emailAlert.classList.add("hidden");

    e.preventDefault();

    let err = false;

    if (!isValidEmailAddress(email)) {
      setEmailError(true);
      setEmailHelperText("Please enter a valid email address");
      err = true;
    }

    if (!isValidPassword(password)) {
      setPasswordError(true);
      setPasswordHelperText(
        "Password needs to be at least 8 characters long, contain at least 1 upper case letter, and at least 1 number"
      );
      err = true;
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError(true);
      setConfirmPasswordHelperText("Passwords do not match");
      err = true;
    }

    if (err === false) {
      setIsLoading(true);

      let params = {
        email: formData.email,
        password: formData.password,
      };

      axios({
        // create account endpoint
        url: "http://127.0.0.1:8000/api/registerAccount/",
        method: "GET",

        // params
        params: params,
      })
        // success
        .then((res) => {
          setIsLoading(false);

          navigate("/verify_account", { state: { data: res.data } });
        })

        // Catch errors if any
        .catch((err) => {
          setIsLoading(false);

          // email already exists
          if (err.status == 409) {
            const emailAlert = document.querySelector(
              "#email-already-exists-alert"
            );
            emailAlert.classList.remove("hidden");
          }

          // admin key is incorrect
          else if (err.status == 401) {
            const adminKeyAlert = document.querySelector("#admin-key-alert");
            adminKeyAlert.classList.remove("hidden");
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
    <div className="flex items-center justify-center my-14">
      <Card className="w-full max-w-md">
        <CardContent>
          <Typography variant="h5" component="h2" className="mb-4 text-center">
            Register
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
              value={formData.password}
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
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              error={confirmPasswordError}
              onChange={handleConfirmPasswordChange}
              className="bg-white !mt-3.5"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText={confirmPasswordHelperText}
            />

            

            <div id="email-already-exists-alert" className="hidden">
              <Alert severity="error">
                An account with email {email} already exists.{" "}
                <NavLink to="/login">
                  <span className="text-blue-500 underline">Log in</span>
                </NavLink>
                {" instead?"}
              </Alert>
            </div>

            <div id="server-error-alert" className="hidden">
              <Alert severity="error">
                A server error occurred. Please try again later.
              </Alert>
            </div>

            <div id="admin-key-alert" className="hidden">
              <Alert severity="error">Admin key is incorrect.</Alert>
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
                "Register"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRegistration;
