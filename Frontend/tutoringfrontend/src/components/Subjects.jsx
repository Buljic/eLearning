import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetchSubjects from '../customHooks/useFetchSubjects.js';
import config from '../config.js';
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Container,
    Grid,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';

const Subjects = () => {
    const { subjects } = useFetchSubjects();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [popularSubjects, setPopularSubjects] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const getPopularSubjects = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/api/mostTutorSubjects`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    setPopularSubjects([]);
                    return;
                }
                const data = await response.json();
                setPopularSubjects(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch popular subjects:', error);
                setPopularSubjects([]);
            }
        };
        getPopularSubjects();
    }, []);

    const filteredSubjects = useMemo(() => {
        if (!searchTerm) {
            return [];
        }
        return subjects.filter((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, subjects]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value || '');
        setShowSuggestions(true);
    };

    const handleSuggestionClick = (subject) => {
        setSearchTerm(subject);
        setShowSuggestions(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!searchTerm.trim()) {
            setIsSearching(false);
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`${config.BASE_URL}/api/subjects/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                setSearchResults([]);
                return;
            }
            const data = await response.json();
            setSearchResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to search subjects:', error);
            setSearchResults([]);
        }
    };

    const subjectsToRender = isSearching ? searchResults : popularSubjects;

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, border: '1px solid #d8e3ef', textAlign: 'center', mb: 3 }}>
                <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" gutterBottom>
                    Pretraga predmeta
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Pronadjite predmete i tutore sa specijalizacijom
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => searchTerm && setShowSuggestions(true)}
                        placeholder="Pretrazi predmete..."
                        size="small"
                        sx={{ minWidth: 280 }}
                    />
                    <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
                        Pretrazi
                    </Button>
                </Box>

                {showSuggestions && searchTerm && filteredSubjects.length > 0 && (
                    <Paper elevation={2} sx={{ mt: 1, maxWidth: 360, mx: 'auto', maxHeight: 200, overflow: 'auto' }}>
                        <List dense disablePadding>
                            {filteredSubjects.map((subject) => (
                                <ListItem key={subject} disablePadding>
                                    <ListItemButton onClick={() => handleSuggestionClick(subject)}>
                                        <ListItemText primary={subject} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}
            </Paper>

            <Typography variant="h6" sx={{ mb: 2 }}>
                {isSearching ? 'Rezultati pretrage' : 'Popularni predmeti'}
            </Typography>

            {subjectsToRender.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                    {isSearching ? 'Nema rezultata za zadani pojam.' : 'Nema popularnih predmeta.'}
                </Typography>
            )}

            <Grid container spacing={2}>
                {subjectsToRender.map((subject) => (
                    <Grid item xs={12} sm={6} md={4} key={subject.name}>
                        <Card variant="outlined" sx={{ borderRadius: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(13,91,203,0.12)' } }}>
                            <CardActionArea component={Link} to={`/tutorsFor/${subject.name}`}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <SchoolIcon color="primary" />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {subject.name}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            icon={<PersonIcon />}
                                            label={`${subject.number} tutora`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Stack>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Subjects;
