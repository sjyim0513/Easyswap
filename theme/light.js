import { createTheme } from "@mui/material/styles";
import coreTheme from "./coreTheme";

// Create a theme instance.
const theme = createTheme({
  ...coreTheme,
  palette: {
    ...coreTheme.palette,
    background: {
      default: "#F0F2F5",
      paper: "#000",
    },
    mode: "light",
  },
  overrides: {
    ...coreTheme.overrides,
    MuiSnackbarContent: {
      root: {
        color: "rgba(0, 0, 0, 0.87)",
        backgroundColor: "#F8F9FE",
        padding: "0px",
        minWidth: "auto",
        "@media (min-width: 960px)": {
          minWidth: "400px",
        },
        width: "-webkit-fill-available",
      },
      message: {
        padding: "0px",
        width: "-webkit-fill-available",
      },
      action: {
        marginRight: "0px",
      },
    },
    headerContainer: {
      root: {
        backgroundColor: "#FF00aa",
      },
    },
    MuiTooltip: {
      tooltip: {
        background: "#000 !important",
        border: "1px solid #000",
        borderRadius: "8px",
        color: "#FFF",
        fontSize: "13px",
      },
    },
  },
});

export default theme;
