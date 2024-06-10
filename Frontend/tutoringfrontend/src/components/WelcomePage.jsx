import React from 'react';
import useFetchUser from "../customHooks/useFetchUser";
import { Link } from "react-router-dom";
import { Container, Box, Typography, CircularProgress, Alert, List, ListItem } from '@mui/material';
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
            <Box sx={{ my: 4 }}>
                <Typography variant="h4">Dobrodošli, {myUser.username}</Typography>
                <List>

                    {(user.accountType === 'OBOJE') && <ListItem>Radi</ListItem>}
                    {(user.accountType === 'STUDENT') && <ListItem>Trenutni role : STUDENT</ListItem>}
                    {(user.accountType === 'PROFESOR') && <ListItem>Trenutni role :PROFESOR</ListItem>}
                    {((user.accountType === 'STUDENT') || (user.accountType === 'OBOJE')) && <ListItem><Link to='/searchSubjects'>Trazi predmete</Link></ListItem>}
                    {((user.accountType === 'PROFESOR') || (user.accountType === 'OBOJE') || (user.accountType === 'PROFESOR')) &&
                        <ListItem><Link to="/requestSubjectsAsTutor">Registruj se za predmete</Link></ListItem>}
                    {((user.accountType === 'STUDENT') || (user.accountType === 'OBOJE') || (user.accountType === 'PROFESOR')) &&
                        <ListItem><Link to="/attendedCourses">Vasi kursevi</Link></ListItem>}
                    {(user.accountType === 'PROFESOR') && <ListItem><Link to="/createGroup">Napravi grupu</Link></ListItem>}
                    {(user.accountType === 'PROFESOR') && <ListItem><Link to="/groupRequests">Pristigli zahtijevi</Link></ListItem>}
                    <ListItem><Link to="/userSearch">Pretraži usere</Link></ListItem>
                    <ListItem><Link to="/groupSearch">Pretraži grupe</Link></ListItem>
                </List>
            </Box>
        </Container>
    );
};

export default WelcomePage;