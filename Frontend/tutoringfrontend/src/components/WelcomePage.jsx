import { Link, Navigate } from "react-router-dom";
import { Container, Box, Typography, CircularProgress, Alert, Grid, Button, Paper } from "@mui/material";
import useFetchUser from "../customHooks/useFetchUser";

const WelcomePage = () => {
  const { user, error, loading } = useFetchUser();

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Doslo je do greske: {error.message}</Alert>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Container sx={{ py: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #d8e3ef" }}>
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Dobrodosli, {user.username}
          </Typography>
          <Typography color="text.secondary">
            Izaberite akciju i nastavite sa radom.
          </Typography>
        </Box>

        <Grid container spacing={2} justifyContent="center">
          {(user.accountType === "STUDENT" || user.accountType === "OBOJE") && (
            <Grid item xs={12} sm={6} md={4}>
              <Button fullWidth variant="contained" component={Link} to="/searchSubjects">
                Trazi predmete
              </Button>
            </Grid>
          )}
          {(user.accountType === "PROFESOR" || user.accountType === "OBOJE") && (
            <Grid item xs={12} sm={6} md={4}>
              <Button fullWidth variant="contained" component={Link} to="/requestSubjectsAsTutor">
                Registruj se za predmete
              </Button>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={4}>
            <Button fullWidth variant="contained" component={Link} to="/attendedCourses">
              Vasi kursevi
            </Button>
          </Grid>
          {user.accountType === "PROFESOR" && (
            <Grid item xs={12} sm={6} md={4}>
              <Button fullWidth variant="contained" component={Link} to="/createGroup">
                Napravi grupu
              </Button>
            </Grid>
          )}
          {user.accountType === "PROFESOR" && (
            <Grid item xs={12} sm={6} md={4}>
              <Button fullWidth variant="contained" component={Link} to="/groupRequests">
                Pristigli zahtjevi
              </Button>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={4}>
            <Button fullWidth variant="outlined" component={Link} to="/userSearch">
              Pretrazi korisnike
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button fullWidth variant="outlined" component={Link} to="/groupSearch">
              Pretrazi grupe
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default WelcomePage;
