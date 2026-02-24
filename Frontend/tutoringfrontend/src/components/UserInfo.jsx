import { Link, useParams } from "react-router-dom";
import useFetchCertainUser from "../customHooks/useFetchCertainUser.js";
import { Container, Box, Typography, CircularProgress, Alert, Card, CardContent } from '@mui/material';

const UserInfo = () => {
    const { username } = useParams();
    const { userInfo, error, loading } = useFetchCertainUser(username);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error.message}</Alert>;
    }

    if (!userInfo) {
        return <Typography variant="h6">LOADING...</Typography>;
    }

    return (
        <Container>
            <Box sx={{ my: 2, textAlign: 'center' }}>
                <Typography variant="h4">Korisničke informacije</Typography>
                <Typography variant="body1">Ime korisnika: {userInfo.username}</Typography>
                <Typography variant="body1">Vrsta korisnika: {userInfo.account_type}</Typography>
                <Typography variant="body1">Broj telefona: {userInfo.phone_number}</Typography>
                <Typography variant="body1">Email: {userInfo.email}</Typography>
                <Link to={`/chatTo/${userInfo.id}`}>
                    <Typography variant="h6" color="primary">Dopisivanje</Typography>
                </Link>
                {userInfo.subjects && userInfo.subjects.map((subject, index) => (
                    <Card key={index} sx={{ my: 2 }}>
                        <CardContent>
                            <Typography>Predmet: {subject.subject_name}</Typography>
                            <Typography>Ocjena Predavanja: {subject.teaching_grade}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Container>
    );
};

export default UserInfo;
