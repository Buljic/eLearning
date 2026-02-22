import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0d5bcb",
    },
    secondary: {
      main: "#17a0b5",
    },
    background: {
      default: "#f2f7fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#10243a",
      secondary: "#465a71",
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: "Manrope, 'Segoe UI', sans-serif",
    h1: { fontFamily: "Space Grotesk, 'Segoe UI', sans-serif", fontWeight: 700 },
    h2: { fontFamily: "Space Grotesk, 'Segoe UI', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "Space Grotesk, 'Segoe UI', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "Space Grotesk, 'Segoe UI', sans-serif", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 },
  },
});

export default theme;
