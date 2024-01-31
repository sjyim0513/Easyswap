import React from "react";
import { withTheme } from "@mui/styles";
import classes from "./ssBot.module.css";

function Setup() {
  return (
    <div
      className={classes.container}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        {/* <a href="https://t.me/ScrollSwapBot" target="_blank">
          <img src="images/telegram-logo.png" alt="Telegram" width="100vh" height="auto" />
          <span>Telegram Bot</span>
        </a> */}
      </div>
    </div>
  );
}

export default withTheme(Setup);
