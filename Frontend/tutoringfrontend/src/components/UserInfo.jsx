import { Link, useParams } from "react-router-dom";
import useFetchCertainUser from "../customHooks/useFetchCertainUser.js";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import ChatIcon from '@mui/icons-material/Chat';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';

const UserInfo = () => {
    const { username } = useParams();
    const { userInfo, error, loading } = useFetchCertainUser(username);

    if (loading) {
        return (
            <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 3 }}>{error.message}</Alert>;
    }

    if (!userInfo) {
        return (
            <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid #d8e3ef', textAlign: 'center' }}>
                <Avatar sx={{ width: 72, height: 72, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}>
                    {userInfo.username?.charAt(0)?.toUpperCase() || <PersonIcon />}
                </Avatar>
                <Typography variant="h4" gutterBottom>
                    {userInfo.username}
                </Typography>
                <Chip label={userInfo.account_type} color="primary" variant="outlined" sx={{ mb: 2 }} />

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5} sx={{ textAlign: 'left' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <BadgeIcon color="action" />
                        <Typography variant="body1">{userInfo.account_type}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <PhoneIcon color="action" />
                        <Typography variant="body1">{userInfo.phone_number || '-'}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <EmailIcon color="action" />
                        <Typography variant="body1">{userInfo.email || '-'}</Typography>
                    </Stack>
                </Stack>

                <Button
                    component={Link}
                    to={`/chatTo/${userInfo.id}`}
                    variant="contained"
                    startIcon={<ChatIcon />}
                    fullWidth
                    sx={{ mt: 3 }}
                >
                    Dopisivanje
                </Button>
            </Paper>

            {userInfo.subjects && userInfo.subjects.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1.5 }}>Predmeti</Typography>
                    <Grid container spacing={1.5}>
                        {userInfo.subjects.map((subject, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <SchoolIcon color="primary" fontSize="small" />
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, flexGrow: 1 }}>
                                                {subject.subject_name}
                                            </Typography>
                                            <Chip icon={<StarIcon />} label={subject.teaching_grade ?? '-'} size="small" color="secondary" variant="outlined" />
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Container>
    );
};

export default UserInfo;
