import { Link } from 'react-router-dom';
import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

const GroupResults = ({ isSearching, groups }) => {
    if (!isSearching) {
        return <Alert severity="info">Primijenite filtere i kliknite Pretrazi.</Alert>;
    }

    if (!groups.length) {
        return <Alert severity="warning">Nema grupa koje odgovaraju zadatim filterima.</Alert>;
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Rezultati pretrage
            </Typography>
            <Stack spacing={1.5}>
                {groups.map((group) => (
                    <Card key={group.group_id} variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 0.5 }}>
                                <Link to={`/groupDetails/${group.group_id}`}>{group.group_name}</Link>
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                {group.description || 'Bez opisa.'}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                                <Chip label={`Pocetak: ${group.start_date || '-'}`} size="small" />
                                <Chip label={`Kraj: ${group.end_date || '-'}`} size="small" />
                                <Chip label={`Sati/sedmicno: ${group.hours_per_week || '-'}`} size="small" />
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                                <Chip label={`Cijena: ${group.price ?? '-'} BAM`} color="primary" size="small" />
                                <Chip label={`Max studenata: ${group.max_students ?? '-'}`} size="small" />
                                <Chip label={`Tema: ${group.topic || '-'}`} size="small" />
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
};

export default GroupResults;
