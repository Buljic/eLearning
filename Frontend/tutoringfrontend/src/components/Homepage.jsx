import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button } from '@mui/material';

const Homepage = () => {
    return (
        <Box sx={{textAlign: 'center', padding: 4}}>
            <Typography variant="h3" gutterBottom>
                Dobrodošli u centar za Tutoring
            </Typography>
            <Button variant="contained" color="primary" component={Link} to="/login" sx={{margin: 1}}>
                Prijava
            </Button>
            <Button variant="contained" color="primary" component={Link} to="/createAccount" sx={{margin: 1}}>
                Napravi račun
            </Button>
        </Box>

    );
};

export default Homepage;
