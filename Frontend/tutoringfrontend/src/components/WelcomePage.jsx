import React from 'react';
import useFetchUser from "../customHooks/useFetchUser";
import { Link } from "react-router-dom";
import { Container, Box, Typography, CircularProgress, Alert, Grid, Button } from '@mui/material';
import config from '../config.js';

const WelcomePage = () => {
    const { user, error, loading } = useFetchUser(); // Koristimo naš custom hook
    const storedUser = sessionStorage.getItem('myUser');
    const myUser = JSON.parse(storedUser); //jer ono inace dobijamo string obicni

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">Došlo je do greške: {error.message}</Alert>;
    }

    return (
        <Container>
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>Dobrodošli, korisnik : {myUser.username}</Typography>
                <Grid container spacing={3} justifyContent="center">
                    {((user.accountType === 'STUDENT') || (user.accountType === 'OBOJE')) && (
                        <Grid item xs={12} sm={6} md={4}>
                            <Button fullWidth variant="contained" color="primary" component={Link} to='/searchSubjects'>
                                Traži predmete
                            </Button>
                        </Grid>
                    )}
                    {((user.accountType === 'PROFESOR') || (user.accountType === 'OBOJE')) && (
                        <Grid item xs={12} sm={6} md={4}>
                            <Button fullWidth variant="contained" color="primary" component={Link} to="/requestSubjectsAsTutor">
                                Registruj se za predmete
                            </Button>
                        </Grid>
                    )}
                    {((user.accountType === 'STUDENT') || (user.accountType === 'OBOJE') || (user.accountType === 'PROFESOR')) && (
                        <Grid item xs={12} sm={6} md={4}>
                            <Button fullWidth variant="contained" color="primary" component={Link} to="/attendedCourses">
                                Vaši kursevi
                            </Button>
                        </Grid>
                    )}
                    {(user.accountType === 'PROFESOR') && (
                        <Grid item xs={12} sm={6} md={4}>
                            <Button fullWidth variant="contained" color="primary" component={Link} to="/createGroup">
                                Napravi grupu
                            </Button>
                        </Grid>
                    )}
                    {(user.accountType === 'PROFESOR') && (
                        <Grid item xs={12} sm={6} md={4}>
                            <Button fullWidth variant="contained" color="primary" component={Link} to="/groupRequests">
                                Pristigli zahtijevi
                            </Button>
                        </Grid>
                    )}
                    <Grid item xs={12} sm={6} md={4}>
                        <Button fullWidth variant="contained" color="primary" component={Link} to="/userSearch">
                            Pretraži usere
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Button fullWidth variant="contained" color="primary" component={Link} to="/groupSearch">
                            Pretraži grupe
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default WelcomePage;
