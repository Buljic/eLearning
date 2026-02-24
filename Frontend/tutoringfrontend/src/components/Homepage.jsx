import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button, Stack, Paper } from "@mui/material";

const Homepage = () => {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 120px)",
        px: { xs: 2, md: 4 },
        display: "grid",
        placeItems: "center",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 860,
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          textAlign: "center",
          background: "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(230,243,255,0.96))",
          border: "1px solid #d8e3ef",
          boxShadow: "0 20px 55px rgba(9, 50, 92, 0.14)",
        }}
      >
        <Typography variant="h3" sx={{ mb: 1.5 }}>
          Centar Za Tutoring
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Uci pametnije uz organizovane grupe, lekcije, zadatke, chat i video pozive na jednom mjestu.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          <Button variant="contained" size="large" component={Link} to="/login">
            Prijava
          </Button>
          <Button variant="outlined" size="large" component={Link} to="/createAccount">
            Napravi Racun
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Homepage;
