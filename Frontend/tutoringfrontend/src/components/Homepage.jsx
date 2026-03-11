import { Link } from "react-router-dom";
import { Avatar, Box, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import ChatIcon from "@mui/icons-material/Chat";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const features = [
  { icon: <SchoolIcon />, title: "Lekcije", desc: "Organizovane lekcije i materijali" },
  { icon: <GroupsIcon />, title: "Grupe", desc: "Kreirajte i pridruzite se grupama" },
  { icon: <ChatIcon />, title: "Chat", desc: "Direktne poruke i grupni chat" },
  { icon: <VideoCallIcon />, title: "Video pozivi", desc: "Video pozivi u realnom vremenu" },
];

const Homepage = () => {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 80px)",
        px: { xs: 2, md: 4 },
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 900 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 3, md: 6 },
            textAlign: "center",
            background: "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(230,243,255,0.96))",
            border: "1px solid #d8e3ef",
            boxShadow: "0 20px 55px rgba(9, 50, 92, 0.14)",
            mb: 4,
          }}
        >
          <SchoolIcon sx={{ fontSize: 56, color: "primary.main", mb: 1 }} />
          <Typography variant="h3" sx={{ mb: 1.5 }}>
            Centar Za Tutoring
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
            Uci pametnije uz organizovane grupe, lekcije, zadatke, chat i video pozive na jednom mjestu.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button variant="contained" size="large" component={Link} to="/login" startIcon={<LoginIcon />}>
              Prijava
            </Button>
            <Button variant="outlined" size="large" component={Link} to="/createAccount" startIcon={<PersonAddIcon />}>
              Napravi Racun
            </Button>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          {features.map((f) => (
            <Grid item xs={6} sm={3} key={f.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid #d8e3ef",
                  textAlign: "center",
                  height: "100%",
                  transition: "all 0.2s",
                  "&:hover": { boxShadow: "0 6px 24px rgba(13,91,203,0.12)", borderColor: "primary.main" },
                }}
              >
                <Avatar sx={{ width: 44, height: 44, mx: "auto", mb: 1, bgcolor: "primary.main" }}>
                  {f.icon}
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {f.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {f.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Homepage;
