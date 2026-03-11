import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Snackbar,
    Stack,
    Typography,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import TopicIcon from '@mui/icons-material/Topic';
import SendIcon from '@mui/icons-material/Send';
import config from '../config.js';
import { canActAsStudent } from '../utils/userRoles.js';
import { getSessionUser } from '../utils/sessionUser.js';

const InfoRow = ({ icon, label, value }) => (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.75 }}>
        {icon}
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{value || '-'}</Typography>
    </Stack>
);

const GroupDetails = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [error, setError] = useState('');
    const [requestStatus, setRequestStatus] = useState({ open: false, message: '', severity: 'success' });
    const myUser = getSessionUser();

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/api/groups/${groupId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Neuspjesno ucitavanje detalja grupe.');
                }
                const data = await response.json();
                setGroup(data);
            } catch (fetchError) {
                console.error('Error fetching group details:', fetchError);
                setError(fetchError.message || 'Neuspjesno ucitavanje detalja grupe.');
            }
        };
        fetchGroupDetails();
    }, [groupId]);

    const handleRequestAccess = async () => {
        try {
            const response = await fetch(`${config.BASE_URL}/api/groups/${groupId}/request-access`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Neuspjesno slanje zahtjeva.');
            }
            setRequestStatus({ open: true, message: 'Zahtjev za pristup je uspjesno poslan.', severity: 'success' });
        } catch (requestError) {
            console.error('Error requesting access:', requestError);
            setRequestStatus({
                open: true,
                message: requestError.message || 'Neuspjesno slanje zahtjeva za pristup.',
                severity: 'error',
            });
        }
    };

    if (error) {
        return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
    }

    if (!group) {
        return (
            <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const canRequestAccess = canActAsStudent(myUser) && new Date(group.startDate) > new Date();

    return (
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid #d8e3ef' }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <GroupsIcon sx={{ fontSize: 44, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" gutterBottom>
                        {group.group_name}
                    </Typography>
                    {group.topic && <Chip label={group.topic} color="primary" variant="outlined" />}
                </Box>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                    {group.description || 'Bez opisa.'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={0.5}>
                    <InfoRow icon={<CalendarTodayIcon fontSize="small" color="action" />} label="Datum pocetka" value={group.startDate} />
                    <InfoRow icon={<CalendarTodayIcon fontSize="small" color="action" />} label="Datum zavrsetka" value={group.endDate} />
                    <InfoRow icon={<AccessTimeIcon fontSize="small" color="action" />} label="Sati sedmicno" value={group.hoursPerWeek} />
                    <InfoRow icon={<AttachMoneyIcon fontSize="small" color="action" />} label="Cijena" value={`${group.price} BAM`} />
                    <InfoRow icon={<PeopleIcon fontSize="small" color="action" />} label="Max studenata" value={group.maxStudents} />
                    <InfoRow icon={<TopicIcon fontSize="small" color="action" />} label="Tema" value={group.topic} />
                </Stack>

                {canRequestAccess && (
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<SendIcon />}
                        onClick={handleRequestAccess}
                        sx={{ mt: 3 }}
                    >
                        Zatrazi pristup
                    </Button>
                )}

                {!myUser && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Prijavite se kako biste mogli slati zahtjev za pristup grupi.
                    </Alert>
                )}
            </Paper>

            <Snackbar
                open={requestStatus.open}
                autoHideDuration={4000}
                onClose={() => setRequestStatus((prev) => ({ ...prev, open: false }))}
            >
                <Alert severity={requestStatus.severity} onClose={() => setRequestStatus((prev) => ({ ...prev, open: false }))}>
                    {requestStatus.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default GroupDetails;
