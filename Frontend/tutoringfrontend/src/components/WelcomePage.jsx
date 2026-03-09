import { Link, Navigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import InboxIcon from "@mui/icons-material/Inbox";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import useFetchUser from "../customHooks/useFetchUser";
import { canActAsProfessor, canActAsStudent } from "../utils/userRoles";

const ActionCard = ({ to, icon, label, description, color = "primary.main" }) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 3,
      height: "100%",
      transition: "all 0.2s",
      "&:hover": { boxShadow: "0 6px 24px rgba(13,91,203,0.14)", borderColor: "primary.main" },
    }}
  >
    <CardActionArea component={Link} to={to} sx={{ height: "100%", p: 2 }}>
      <CardContent sx={{ textAlign: "center" }}>
        <Avatar sx={{ width: 52, height: 52, mx: "auto", mb: 1.5, bgcolor: color }}>
          {icon}
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
          {label}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </CardContent>
    </CardActionArea>
  </Card>
);

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
    return <Alert severity="error" sx={{ m: 3 }}>Doslo je do greske: {error.message}</Alert>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isStudent = canActAsStudent(user);
  const isProfessor = canActAsProfessor(user);

  const actions = [
    isStudent && { to: "/searchSubjects", icon: <SchoolIcon />, label: "Trazi predmete", description: "Pronadji predmete i tutore", color: "primary.main" },
    isProfessor && { to: "/requestSubjectsAsTutor", icon: <AssignmentIcon />, label: "Registruj se za predmete", description: "Prijavi kvalifikacije", color: "#0d5bcb" },
    { to: "/attendedCourses", icon: <MenuBookIcon />, label: "Vasi kursevi", description: "Pregledajte aktivne kurseve", color: "#17a0b5" },
    isProfessor && { to: "/createGroup", icon: <GroupAddIcon />, label: "Napravi grupu", description: "Kreirajte novu grupu", color: "#0f3d9a" },
    isProfessor && { to: "/groupRequests", icon: <InboxIcon />, label: "Pristigli zahtjevi", description: "Upravljajte zahtjevima", color: "#e67e22" },
    { to: "/userSearch", icon: <PeopleIcon />, label: "Pretrazi korisnike", description: "Pronadjite korisnike", color: "#465a71" },
    { to: "/groupSearch", icon: <SearchIcon />, label: "Pretrazi grupe", description: "Pronadjite grupe", color: "#465a71" },
  ].filter(Boolean);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: "1px solid #d8e3ef",
          textAlign: "center",
          mb: 3,
          background: "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(230,243,255,0.96))",
          boxShadow: "0 12px 40px rgba(9,50,92,0.1)",
        }}
      >
        <Avatar sx={{ width: 64, height: 64, mx: "auto", mb: 1.5, bgcolor: "primary.main", fontSize: "1.8rem" }}>
          {user.username?.charAt(0)?.toUpperCase()}
        </Avatar>
        <Typography variant="h4" gutterBottom>
          Dobrodosli, {user.username}
        </Typography>
        <Typography color="text.secondary">
          Izaberite akciju i nastavite sa radom.
        </Typography>
      </Paper>

      <Grid container spacing={2}>
        {actions.map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.to}>
            <ActionCard {...action} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default WelcomePage;
