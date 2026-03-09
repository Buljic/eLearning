import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import config from '../config.js';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CircularProgress,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';

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
        try {
            const response = await fetch(`${config.BASE_URL}/api/getUsers?searchTerm=${encodeURIComponent(searchTerm)}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                setSearchedUsers([]);
                return;
            }
            const data = await response.json();
            setSearchedUsers(data);
        } catch (error) {
            console.error('Failed to search users:', error);
            setSearchedUsers([]);
        } finally {
            setIsSearching(false);
        }
    }

    return (
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, border: '1px solid #d8e3ef', textAlign: 'center', mb: 3 }}>
                <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" gutterBottom>Pretrazi korisnike</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Pronadjite korisnike po imenu ili username-u
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Unesite ime ili username..."
                        size="small"
                        required
                        sx={{ minWidth: 240 }}
                    />
                    <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
                        Pretrazi
                    </Button>
                </Box>
            </Paper>

            {isSearching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Stack spacing={1.5}>
                    {searchedUsers.map((user, index) => (
                        <Card key={index} variant="outlined" sx={{ borderRadius: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(13,91,203,0.12)' } }}>
                            <CardActionArea onClick={() => handleSuggestionClick(user.username)}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                            {user.username?.charAt(0)?.toUpperCase() || <PersonIcon />}
                                        </Avatar>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {user.username}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </Stack>
            )}
        </Container>
    )
}

export default SearchUsers;
