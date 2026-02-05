import { createTheme } from "@mui/material/styles";

// Extend the Material UI theme to include our custom 'third' color
declare module "@mui/material/styles" {
  interface Palette {
    third: {
      main: string;
    };
  }
  interface PaletteOptions {
    third?: {
      main: string;
    };
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#D4AF37", // previous 1976d2
      light: "#42a5f5",
      dark: "#14213d",
    },
    secondary: {
      main: "#D4AF37", // previous 9c27b0
      light: "#ba68c8",
      dark: "#7b1fa2",
    },
    third: {
      main: "#D4AF37", // Custom button primary color
    },
    background: {
      default: "#f5f5f5",
      paper: "rgba(255, 255, 255, 0.05)", // previous ffffff
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      color: "red",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
        },
        outlined: {
          borderColor: "#D4AF37", // Custom outline color
          "&:hover": {
            borderColor: "#D4AF37", // Hover border color
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

export default theme;
