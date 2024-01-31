import { createTheme } from "@mui/material/styles";
import coreTheme from "./coreTheme";

// Create a theme instance.
const theme = createTheme({
  ...coreTheme,
  palette: {
    ...coreTheme.palette,
    background: {
      default: "#000000",
      paper: "#000000",
    },
    primary: {
      main: "#000000",
    },
    text: {
      primary: "#000",
      secondary: "#7E99B0",
    },
    mode: "dark",
  },
  components: {
    ...coreTheme.components,
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          color: "#FFF",
          backgroundColor: "#fff8f3",
          padding: "0px",
          minWidth: "auto",
          "@media (min-width: 960px)": {
            minWidth: "400px",
          },
          width: "-webkit-fill-available",
        },
        message: {
          padding: "0px",
        },
        action: {
          marginRight: "0px",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: "#FFF !important",
          border: "1px solid #fff",
          borderRadius: "8px",
          color: "#000",
          fontSize: "13px",
        },
      },
    },
  },
});

export default theme;
