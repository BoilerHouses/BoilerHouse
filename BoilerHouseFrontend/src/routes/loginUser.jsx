import { useState } from 'react';
import { TextField, Button, Card, CardContent, Typography, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { NavLink } from 'react-router-dom';

const isValidEmailAddress = (email) => {
    const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email);
};

const UserLogin = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailHelperText, setEmailHelperText] = useState('');

    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordHelperText, setPasswordHelperText] = useState('');

    const [showPassword, setShowPassword] = useState(false);

    const handleEmailChange = (event) => {
        const newEmail = event.target.value;
        setEmail(newEmail);

        if (!isValidEmailAddress(newEmail)) {
            setEmailError(true);
            setEmailHelperText('Please enter a valid email address');
        } else {
            setEmailError(false);
            setEmailHelperText('');
        }
    };

    const handlePasswordChange = (event) => {
        const newPassword = event.target.value;
        setPassword(newPassword);

        if (newPassword.length === 0) {
            setPasswordError(true);
            setPasswordHelperText('Password is required');
        } else {
            setPasswordError(false);
            setPasswordHelperText('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let err = false;

        if (!isValidEmailAddress(email)) {
            setEmailError(true);
            setEmailHelperText('Please enter a valid email address');
            err = true;
        }

        if (password.length === 0) {
            setPasswordError(true);
            setPasswordHelperText('Password is required');
            err = true;
        }

        if (err === false) {
            alert('Login user');
            // Here you would typically handle the login process
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
                            type="email"
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
                            type={showPassword ? 'text' : 'password'}
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
                            to='/forgot_password'
                            className = "underline-offset w-full text-center"
                        >
                          <div className='text-blue-500 underline'> 
                            Forgot Password?
                          </div>
                        </NavLink>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            className="mt-4"
                        >
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserLogin;
