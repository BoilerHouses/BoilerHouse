// VerifyAccount.jsx

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Typography, Container, Paper } from '@mui/material';
import axios from 'axios';

const VerifyAccount = () => {
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const location = useLocation();

    const query = new URLSearchParams(location.search);
    const pk = query.get('pk')
    const token = query.get('token');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setLoading(false);
                setError(true);
                return;
            }
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/activate/${pk}/${token}`);
                if (response.data.success) {
                    setSuccess(true);
                } else {
                    setError(true);
                }
            } catch (err) {
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
                <Button variant="contained" color="primary" className="mt-4" href="/">
                    Go to Home
                </Button>
            </Paper>
        </Container>
    );
};

export default VerifyAccount;
