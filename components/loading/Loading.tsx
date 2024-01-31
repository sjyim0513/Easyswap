import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { Typography } from "@material-ui/core";
import classes from "./loading.module.css";

const Loading: React.FC = () => {
  const [dots, setDots] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots + 1) % 4);
    }, 666);

    const resetInterval = setInterval(() => {
      setDots(0);
    }, 2100);

    return () => {
      clearInterval(interval);
      clearInterval(resetInterval);
    };
  }, []);

  return (
    <div
      style={{
        background: "#FFF8F3",
        minHeight: "100vh",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
      }}
    >
      <img
        src="/tokens/govToken-logo.png"
        width={131}
        className={classes.loading}
      />
      <div
        style={{
          display: "flex",
          textAlign: "center",
          minWidth: "150px",
          marginLeft: "34px",
        }}
      >
        <span style={{ color: "#000", fontWeight: "600", fontSize: "30px" }}>
          Loading{".".repeat(dots)}
        </span>
      </div>
    </div>
  );
};

export default Loading;
