import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Container, Box, Alert, Paper, Link as MuiLink } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link } from "react-router-dom";
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
        sessionStorage.removeItem("myUser");
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
        sessionStorage.removeItem("myUser");
        setMessage("Prijava je uspjela, ali nije moguce ucitati korisnicke podatke.");
        return;
      }

      const fetchedUser = await userResponse.json();
      sessionStorage.setItem("myUser", JSON.stringify(fetchedUser));
      navigate("/welcome");
    } catch (error) {
      console.error("Greska prilikom login-a", error);
      sessionStorage.removeItem("myUser");
      setMessage("Doslo je do greske. Pokusajte ponovo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #d8e3ef" }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <LockOutlinedIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
          <Typography variant="h4" gutterBottom>
            Prijava
          </Typography>
          <Typography color="text.secondary">
            Unesite podatke za pristup vasem racunu
          </Typography>
        </Box>

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
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? "Prijava..." : "Prijava"}
          </Button>
        </Box>

        {message && <Alert severity="error" sx={{ mt: 2 }}>{message}</Alert>}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
          Nemate racun?{" "}
          <MuiLink component={Link} to="/createAccount" underline="hover">
            Registrujte se
          </MuiLink>
        </Typography>
      </Paper>
    </Container>
  );
}

export default LoginForm;
