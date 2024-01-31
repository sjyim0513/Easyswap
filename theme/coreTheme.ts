import { createTheme } from "@mui/material/styles";

export const colors = {
  blue: "#FFCC80",
  red: "#FF5252",
  orange: "#ffb347",
  lightBlack: "rgba(0, 0, 0, 0.87)",
  green: "#90EE90",
};

const coreTheme = createTheme({
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: ["Inter", "sans-serif"].join(","),
    h1: {
      // Portfolio balance numbers
      fontSize: "32px",
      fontWeight: 800,
      lineHeight: 1.167,
      ["@media (max-width:576px)"]: {
        // eslint-disable-line no-useless-computed-key
        fontSize: "1.6rem",
      },
    },
    h2: {
      // Navigation tabs / section headers
      fontSize: "16px",
      fontWeight: 700,
      lineHeight: 1.5,
      ["@media (max-width:576px)"]: {
        // eslint-disable-line no-useless-computed-key
        fontSize: "1rem",
      },
    },
    h3: {
      // yearn title text YEARN
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: "1.5rem",
      fontWeight: 700,
      lineHeight: 1.167,
      ["@media (max-width:576px)"]: {
        // eslint-disable-line no-useless-computed-key
        fontSize: "1.2rem",
      },
    },
    h4: {
      // yearn title text finance
      fontSize: "1.5rem",
      letterSpacing: "0.3rem",
      fontWeight: 300,
      lineHeight: 1.167,
      ["@media (max-width:576px)"]: {
        // eslint-disable-line no-useless-computed-key
        fontSize: "1.2rem",
      },
    },
    h5: {
      // card headers
      fontSize: "0.9rem",
      fontWeight: 700,
      lineHeight: 1.167,
      ["@media (max-width:576px)"]: {
        // eslint-disable-line no-useless-computed-key
        fontSize: "0.7rem",
      },
    },
    h6: {
      // card headers
      fontSize: "1.5rem",
      fontWeight: 700,
      lineHeight: 1.167,
      ["@media (max-width:576px)"]: {
        // eslint-disable-line no-useless-computed-key
        fontSize: "1.2rem",
      },
    },
    subtitle1: {
      fontSize: "0.9rem",
      fontWeight: 300,
      lineHeight: 1.167,
      ["@media (max-width:576px)"]: {
        // eslint-disable-line no-useless-computed-key
        fontSize: "0.7rem",
      },
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 300,
      lineHeight: 1.167,
      color: "black",
      ["@media (max-width:576px)"]: {
        // eslint-disable-line no-useless-computed-key
        fontSize: "0.8rem",
      },
    },
  },
  palette: {
    primary: {
      main: "#000",
      dark: "#000",
      light: "#000",
      contrastText: "#000",
    },
    secondary: {
      main: "#000",
      dark: "#000",
      light: "#FFFFFF",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#dc3545",
      dark: "#dc3545",
      contrastText: "#dc3545",
      light: "#dc3545",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#FF9A5F",
          minWidth: "50px",
          color: "rgb(255, 174, 128)",
          fontWeight: "bold",
          "&.Mui-disabled": {
            border: "none",
          },
          "&:hover": {
            boxShadow: "none",
            background: "#E38148",
          },
          boxShadow: "none",
        },
        outlinedSizeSmall: {
          fontSize: "0.7rem",
          padding: "6px 9px",
          ["@media (max-width:576px)"]: {
            // eslint-disable-line no-useless-computed-key
            padding: "3px 0px",
          },
        },
        sizeLarge: {
          padding: "19px 24px",
          minWidth: "150px",
        },
        textSizeLarge: {
          fontSize: "2.4rem",
          ["@media (max-width:576px)"]: {
            // eslint-disable-line no-useless-computed-key
            fontSize: "2rem",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "gray",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paperWidthSm: {
          maxWidth: "800px",
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: "none",
          borderRadius: "12px",
          "&.Mui-selected": {
            backgroundColor: "rgba(0,0,0,0)",
            border: "none",
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          color: "black",
        },
        anchorOriginBottomCenter: {
          bottom: "12px",
          left: "50%",
          transform: "translateX(-50%)",
        },
      },
    },

    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          color: "black",
        },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          margin: "0px",
          "&:before": {
            //underline color when textfield is inactive
            backgroundColor: "none",
            height: "0px",
          },
          "&$expanded": {
            margin: "0px",
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: "0px 24px",
          "@media (max-width:576px)": {
            padding: "0px 6px",
          },
        },
        content: {
          margin: "0px !important",
          justifyContent: "center",
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: "0",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: "#000",
          borderBottom: "1px solid rgba(115, 115, 115, 0.3)",
        },
        head: {
          padding: "16px 14px",
        },
        body: {
          padding: "6px 12px",
          borderBottom: "none",
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          color: "#000",
          "&.Mui-disabled": {
            // "&:before": {
            //   borderBottom: "none",
            // },
            colors: "#000",
          },
        },
        underline: {
          "&:before": {
            //underline color when textfield is inactive
            borderBottom: "none !important",
          },
          "&:hover:not($disabled):before": {
            //underline color when hovered
            borderBottom: "none !important",
          },
        },
        input: {
          "&.Mui-disabled": {
            WebkitTextFillColor: "gray",
          },
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            "&:before": {
              borderBottom: "none",
            },
          },
        },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          "&.Mui-active": {
            color: "black",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#000",
          fontWeight: "400",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#FF9A5F",
            },
          },
          "&:hover": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#FF9A5F",
            },
          },
        },
        input: {
          color: "#CF9A7C",
          "&.Mui-disabled": {
            border: "none",
            color: "black",
            WebkitTextFillColor: "gray",
          },
          "&.MuiSelect-select": {
            display: "flex",
            alignItems: "center",
          },
        },
        notchedOutline: {
          borderColor: "#FF9A5F",
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          position: "absolute",
          bottom: "0",
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          color: "black",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "rgb(255, 174, 128)",
          height: 8,
        },
        thumb: {
          height: 14,
          width: 14,
          backgroundColor: "rgb(255, 174, 128)",
          border: "2px solid currentColor",
          "&:focus, &:hover, &$active": {
            boxShadow: "inherit",
          },
        },
        active: {},
        track: {
          height: 8,
          border: "none",
        },
        rail: {
          height: 3,
          backgroundColor: "none",
        },
        mark: {
          backgroundColor: "transparent",
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "&.Mui-checked": {
            color: "rgba(255, 174, 128, 0.6)",
          },
        },
        track: {
          backgroundColor: "gray",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: "1px solid rgba(126,153,176,0.2)",
          marginTop: "10px",
          minWidth: "230px",
          background: "#FFF8F3",
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          "@media (max-width:900px)": {
            minWidth: "-webkit-fill-available",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          color: "black",
          backgroundColor: "rgba(255, 255, 255, 1)",
          boxShadow: "0px 3px 14px 0px rgba(193, 146, 118, 0.33)",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          "&.MuiTablePagination-toolbar": {
            paddingLeft: "0px",
          },
        },
      },
    },
  },
});

export default coreTheme;
