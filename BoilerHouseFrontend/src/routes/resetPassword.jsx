import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { NavLink } from "react-router-dom";

import axios from "axios";

const isValidPassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

const ResetPassword = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordHelperText, setPasswordHelperText] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordHelperText, setConfirmPasswordHelperText] =
    useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [buttonText, setButtonText] = useState("Update Password");

  const { pk, token } = useParams();


  const handlePasswordChange = (event) => {
    const newPassword = event.target.value;
    setPassword(newPassword);

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

    if (newPassword !== password) {
      setConfirmPasswordError(true);
      setConfirmPasswordHelperText("Passwords do not match");
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordHelperText("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let err = false;

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

    if (err == false) {
      setIsLoading(true);

      axios({
        // create account endpoint
        url: `http://127.0.0.1:8000/api/updatePassword/${pk}/${token}`,
        method: "GET",

        // params
        params: {
          newPassword: password,
        },
      })
        // success
        .then(() => {
          setIsLoading(false);
          setButtonText("Password Updated Successfully!");
          const successAlert = document.querySelector("#success-alert");
          successAlert.classList.remove("hidden");
        })

        // Catch errors if any
        .catch(() => {
          setIsLoading(false);

          // other server error
          const serverAlert = document.querySelector("#server-error-alert");
          serverAlert.classList.remove("hidden");
        });
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        setError(true);
        return;
      }
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/forgotPassword/${pk}/${token}`
        );
        if (response.status == 200) {
          setSuccess(true);
        } else {
          setError(true);
        }
      } catch (err) {
        console.log(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  if (loading) {
    return (
      <Container className="flex items-center justify-center min-h-screen">
        <Typography variant="h5">Verifying reset password link...</Typography>
      </Container>
    );
  }

  return (
    <Container className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardContent>
          {!error ? (
            <>
              <Typography
                variant="h5"
                component="h2"
                className="mb-4 text-center"
              >
                Reset Password
              </Typography>
              <form onSubmit={handleSubmit} className="space-y-4">
                <TextField
                  fullWidth
                  label="New Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  error={passwordError}
                  onChange={handlePasswordChange}
                  disabled={buttonText === "Password Updated Successfully!"}
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
                  label="Confirm New Password"
                  name="password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  error={confirmPasswordError}
                  onChange={handleConfirmPasswordChange}
                  disabled={buttonText === "Password Updated Successfully!"}
                  className="bg-white !my-3.5"
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
                          {showConfirmPassword ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText={confirmPasswordHelperText}
                />

                <div id="server-error-alert" className="hidden">
                  <Alert severity="error">
                    A server error occurred. Please try again later.
                  </Alert>
                </div>

                <div id="success-alert" className="hidden">
                  <Alert severity="success">
                    Password reset successfully!{" "}
                    <NavLink to="/login">
                      <span className="text-blue-500 underline">
                        Back to login
                      </span>
                    </NavLink>
                  </Alert>
                </div>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  className="mt-4"
                  disabled={
                    isLoading || buttonText === "Password Updated Successfully!"
                  }
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    buttonText
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <Typography variant="h4" className="text-red-600">
                Reset Password Failed
              </Typography>
              <Typography variant="body1" className="mt-2">
                The reset password link is invalid or has expired.
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResetPassword;