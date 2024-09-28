import { useState } from 'react';
import { TextField, Button, Card, CardContent, Typography } from '@mui/material';

const isValidEmailAddress = (email) => {
    const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email);
};



const ForgotPassword = () => {

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailHelperText, setEmailHelperText] = useState('');
    const [buttonText, setButtonText] = useState('Send Email');

    const handleSubmit = (e) => {
        e.preventDefault();
    
        let err = false;
    
        if (!isValidEmailAddress(email)) {
          setEmailError(true);
          setEmailHelperText('Please enter a valid email address');
          err = true;
        }
    
        if (err === false) {
          
          // handle password sent
          setButtonText("Email Sent!")

        }
      };

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


    return (
        <div className="flex items-center justify-center mt-14">
          <Card className="w-full max-w-md">
            <CardContent>
              <Typography variant="h5" component="h2" className="mb-4 text-center">
                Forgot Password
              </Typography>
              <Typography variant="subtitle2" component="h2" className="mb-4 text-center">
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
                  className="bg-white !my-3.5"
                  helperText={emailHelperText}
                />
              
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={buttonText === "Email Sent!"}
                  className="mt-4"
                >
                  {buttonText}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
}

export default ForgotPassword;