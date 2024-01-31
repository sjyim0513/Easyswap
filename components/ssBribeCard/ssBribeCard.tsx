import React, { useState, useEffect } from "react";
import { Typography, Paper, Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { PieChart } from "@mui/icons-material";
import BigNumber from "bignumber.js";
import classes from "./ssBribeCard.module.css";

import stores from "../../stores/index";
import { formatCurrency } from "../../utils/utils";

import { ACTIONS } from "../../stores/constants/constants";

const theme = createTheme({
  palette: {
    mode: "dark",
    secondary: {
      main: "#fff",
    },
  },
  typography: {
    fontFamily: [
      "TransSansPremium",
      "system-ui",
      "BlinkMacSystemFont",
      "Roboto",
      "Helvetica Neue",
      "Segoe UI",
      "Arial",
      "sans-serif",
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol",
      "Noto Color Emoji",
    ].join(","),
    body1: {
      fontSize: "12px",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "32px",
          padding: "9px 16px",
        },
        containedPrimary: {
          backgroundColor: "#fff",
          color: "#000",
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          color: "#fff",
        },
      },
    },
  },
});

export default function BribeCard({ pair, bribe }) {
  const [claiming, setClaiming] = useState(false);

  const onClaim = () => {
    if (!claiming) {
      stores.dispatcher.dispatch({
        type: ACTIONS.CLAIM_BRIBE,
        content: { bribe },
      });
      setClaiming(true);
    }
  };

  const onVote = () => {};

  useEffect(function () {
    const errorReturned = () => {
      setClaiming(false);
    };

    const claimReturned = () => {
      setClaiming(false);
    };

    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    stores.emitter.on(ACTIONS.CLAIM_REWARD_RETURNED, claimReturned); // TODO: investigate. this is because store when CLAIM_BRIBE currently emits CLAIM_REWARD_RETURNED instead of CLAIM_BRIBE_RETURNED

    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      stores.emitter.removeListener(
        ACTIONS.CLAIM_REWARD_RETURNED,
        claimReturned
      );
    };
  }, []);

  const renderClaimable = () => {
    return (
      <>
        <Typography className={classes.descriptionText} align="center">
          {formatCurrency(bribe.earned)} {bribe.token.symbol}
        </Typography>
        <Typography className={classes.descriptionSubText} align="center">
          Your bribe for voting for {pair.symbol}
        </Typography>
        {bribe.hasClaimed && (
          <Button
            className={classes.tryButton}
            variant="outlined"
            disableElevation
            color="primary"
          >
            <Typography className={classes.buttonLabel}>
              Bribe Claimed
            </Typography>
          </Button>
        )}
        {!bribe.hasClaimed && (
          <Button
            className={classes.tryButton}
            variant="outlined"
            disableElevation
            onClick={onClaim}
            color="primary"
            disabled={claiming}
          >
            <Typography className={classes.buttonLabel}>
              {claiming ? "Claiming ..." : "Claim Bribe"}
            </Typography>
          </Button>
        )}
      </>
    );
  };

  const renderAvailable = () => {
    return (
      <>
        <Typography className={classes.descriptionPreText} align="center">
          Current receive amount:
        </Typography>
        <Typography className={classes.descriptionText} align="center">
          {formatCurrency(BigNumber(bribe.rewardPerToken).times(100).div(100))}{" "}
          {bribe.token.symbol}
        </Typography>
        <Typography className={classes.descriptionSubText} align="center">
          100% vote for {pair.symbol} gives you{" "}
          {formatCurrency(bribe.rewardPerToken)} {bribe.token.symbol}
        </Typography>
        <Button
          className={classes.tryButton}
          variant="outlined"
          disableElevation
          onClick={onVote}
          color="primary"
        >
          <Typography className={classes.buttonLabel}>{"Cast Vote"}</Typography>
        </Button>
      </>
    );
  };

  const getContainerClass = () => {
    if (BigNumber(bribe.earned).gt(0)) {
      return classes.chainContainerPositive;
    } else if (BigNumber(100).eq(0)) {
      return classes.chainContainer;
    }
  };

  return (
    <Paper elevation={1} className={getContainerClass()}>
      <ThemeProvider theme={theme}>
        <div className={classes.topInfo}>
          <PieChart className={classes.avatar} />
          {BigNumber(bribe.earned).gt(0) && renderClaimable()}
          {!BigNumber(bribe.earned).gt(0) && renderAvailable()}
        </div>
      </ThemeProvider>
    </Paper>
  );
}
