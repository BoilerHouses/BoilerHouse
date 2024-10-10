import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Typography, Container, Paper } from '@mui/material';
import axios from 'axios';
import { NavLink } from 'react-router-dom';

const VerifyAccount = () => {
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    
    const {pk, token} = useParams()

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setLoading(false);
                setError(true);
                return;
            }
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/activate/${pk}/${token}`);
                console.log(response)
                if (response.status == 200 || response.status == 202) {
                    setSuccess(true);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.log(err)
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
                <Typography variant="h5">Verifying your account...</Typography>
            </Container>
        );
    }

    return (
        <Container className="flex items-center justify-center min-h-screen">
            <Paper className="p-6 rounded-lg shadow-md">
                {success ? (
                    <>
                        <Typography variant="h4" className="text-green-600">Account Verified!</Typography>
                        <Typography variant="body1" className="mt-2">Your account has been successfully verified.</Typography>
                    </>
                ) : (
                    <>
                        <Typography variant="h4" className="text-red-600">Verification Failed</Typography>
                        <Typography variant="body1" className="mt-2">The verification link is invalid or has expired.</Typography>
                    </>
                )}
                <Button>
                    <NavLink variant="contained" color="primary" className="mt-4" to="/login">
                        Go to Login
                    </NavLink>
                </Button>
            </Paper>
        </Container>
    );

};

export default VerifyAccount;
