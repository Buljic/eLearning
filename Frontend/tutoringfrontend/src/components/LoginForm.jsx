import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Container, Box, Alert, Paper } from "@mui/material";
import config from "../config.js";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch(`${config.BASE_URL}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setMessage("Neuspjesna prijava. Provjerite podatke i pokusajte ponovo.");
        return;
      }

      const userResponse = await fetch(`${config.BASE_URL}/api/welcomePage`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!userResponse.ok) {
        setMessage("Prijava je uspjela, ali nije moguce ucitati korisnicke podatke.");
        return;
      }

      const fetchedUser = await userResponse.json();
      sessionStorage.setItem("myUser", JSON.stringify(fetchedUser));
      navigate("/welcome");
    } catch (error) {
      console.error("Greska prilikom login-a", error);
      setMessage("Doslo je do greske. Pokusajte ponovo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #d8e3ef" }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Prijava
        </Typography>

        <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Korisnicko ime"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Lozinka"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Prijava..." : "Prijava"}
          </Button>
        </Box>

        {message && <Alert severity="error" sx={{ mt: 2 }}>{message}</Alert>}
      </Paper>
    </Container>
  );
}

export default LoginForm;
