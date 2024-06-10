import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import config from '../config.js';
import { Container, Box, TextField, Button, Typography, List, ListItem, CircularProgress } from '@mui/material';

const SearchUsers = () => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSuggestionClick = (username) => {
        navigate(`/userInfoFor/${username}`);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setIsSearching(true);
        getSearchedUsers();
    }

    const getSearchedUsers = async () => {
        const response = await fetch(`${config.BASE_URL}/api/getUsers?searchTerm=${searchTerm}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            console.log("Problem s fetchanjem usera");
            return;
        }
        const data = await response.json();
        setSearchedUsers(data);
        setIsSearching(false);
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>Pretraži korisnike</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        id="inputField"
                        label="Pretraži user-e"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        required
                    />
                    <Button type="submit" variant="contained" color="primary">Pretraži</Button>
                </Box>
                {isSearching ? (
                    <CircularProgress sx={{ mt: 2 }} />
                ) : (
                    <List id="suggestions" sx={{ mt: 2 }}>
                        {searchedUsers.map((user, index) => (
                            <ListItem key={index} button onClick={() => handleSuggestionClick(user.username)}>
                                {user.username}
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Container>
    )
}

export default SearchUsers;