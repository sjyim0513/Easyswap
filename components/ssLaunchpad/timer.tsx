import { useState, useEffect } from "react";

import classes from "./ssLaunchpad.module.css";
import { Typography } from "@mui/material";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export default function Timer({
  starts,
  ends,
  shouldShow,
  shouldShowTimer,
}: {
  starts: number;
  ends: number;
  shouldShow: boolean;
  shouldShowTimer: boolean;
}) {
  const now = Date.now();
  const isStarted = now > starts * 1000;
  const deadline = isStarted ? ends : starts;
  const timerTitle = isStarted ? "IDO Ends in" : "IDO Coming Soon";

  const {
    days,
    hours,
    minutes,
    seconds,
    nextSeconds,
    beforeSecond,
    nextSeconds_2,
    nextSeconds_3,
    nextSeconds_4,
    nextSeconds_5,
    nextSeconds_6,
    beforeSecond_2,
    beforeSecond_3,
    beforeSecond_4,
    beforeSecond_5,
    beforeSecond_6,
  } = useTimer(deadline, SECOND);

  return (
    <div className={classes.timerBox}>
      <div style={{ gap: "3rem", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            margin: "2.5rem 0",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            width: "100%",
            alignItems: "flex-start",
          }}
          className={classes.makeCenter}
        >
          <Typography style={{ color: "white", fontSize: "20px" }}>
            Welcome!
          </Typography>
          <div
            className={classes.timerBox_title}
            style={{ marginBottom: "0.2vh" }}
          >
            {timerTitle}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            margin: "2.5rem 0",
            width: "fit-content",
          }}
          className={classes.gapRemoved}
        >
          {shouldShow && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="50"
                viewBox="0 0 72 70"
                fill="none"
              >
                <g clipPath="url(#clip0_96_480)">
                  <path
                    d="M71.1895 29.0804C70.5495 25.0204 69.1995 21.0704 67.1695 17.5404C65.1395 14.0004 62.4795 10.8504 59.3695 8.28037C56.2595 5.70037 52.7095 3.70037 48.9195 2.38037C45.1395 1.06037 41.1395 0.450366 37.1795 0.530366C36.9495 0.530366 36.7595 0.720366 36.7495 0.950366C36.7395 1.19037 36.9295 1.39037 37.1695 1.40037C44.9095 1.63037 52.4195 4.70037 57.9695 9.87037C60.7495 12.4404 63.0595 15.4904 64.7595 18.8404C66.4595 22.1904 67.4895 25.8404 67.8695 29.5304C68.6295 36.9204 66.7395 44.5004 62.4895 50.4304C58.2795 56.3804 51.9295 60.6704 44.9995 62.3304C41.5395 63.1604 37.9395 63.4104 34.4295 62.9604C30.9295 62.5104 27.5295 61.4504 24.4495 59.8304C18.2595 56.6104 13.3695 51.1104 10.8895 44.7404C9.66953 41.5504 9.03953 38.1604 9.01953 34.7804C8.91953 33.0904 9.15953 31.4004 9.38953 29.7404C9.69953 28.0904 10.0995 26.4604 10.6795 24.8904C12.9595 18.6104 17.5695 13.2904 23.3095 10.1404C23.3895 10.1004 23.4795 10.0404 23.5595 9.99037C26.0895 8.42037 26.8695 5.09037 25.2995 2.56037C23.7295 0.0303664 20.3995 -0.749634 17.8695 0.820366L17.8195 0.850366C10.0795 5.66037 4.23953 13.2804 1.61953 21.8804C0.94953 24.0204 0.52953 26.2304 0.23953 28.4504C0.0295302 30.6704 -0.12047 32.9004 0.0995302 35.1204C0.36953 39.5504 1.42953 43.9304 3.22953 47.9704C6.86953 56.0304 13.4495 62.5804 21.3495 66.1804C25.2895 67.9904 29.5495 69.0704 33.8395 69.3804C38.1295 69.7004 42.4495 69.1604 46.5295 67.9504C54.7195 65.5204 61.8395 60.0604 66.3095 52.9704C70.8395 45.8804 72.4695 37.1904 71.1895 29.0804Z"
                    fill="white"
                  />
                  <path
                    d="M24.9391 13.0402C23.0191 14.2202 21.2491 15.6402 19.7091 17.2902C17.9291 19.2402 16.4591 21.4802 15.3891 23.8902C14.3291 26.3102 13.6991 28.9002 13.4791 31.5302C13.2491 34.1502 13.5291 36.8002 14.1591 39.3502C15.4091 44.4702 18.5191 49.0302 22.6391 52.2202C26.7491 55.4802 31.9991 57.1102 37.1791 57.1302C37.5891 57.1302 37.9291 56.8002 37.9391 56.3902C37.9491 55.9702 37.6191 55.6302 37.1991 55.6202H37.1791C32.3291 55.5202 27.4791 53.9202 23.7291 50.8402C19.9591 47.8202 17.1691 43.5702 16.1091 38.8702C15.5691 36.5302 15.3491 34.1102 15.5991 31.7202C15.8391 29.3402 16.4491 26.9902 17.4491 24.8202C18.4591 22.6502 19.8091 20.6502 21.4491 18.9202C22.8191 17.5002 24.3891 16.2702 26.0791 15.2602L34.5591 30.4802C33.6491 31.2402 33.0491 32.3702 33.0491 33.6502C33.0491 35.9402 34.8991 37.7902 37.1891 37.7902C39.0591 37.7902 40.6191 36.5402 41.1291 34.8402L52.8191 34.3802C53.0291 35.0702 53.6591 35.5802 54.4191 35.5802C55.3491 35.5802 56.0991 34.8302 56.0991 33.9002C56.0991 32.9702 55.3491 32.2202 54.4191 32.2202C53.6791 32.2202 53.0492 32.7102 52.8292 33.3802L41.1591 32.5802C40.6791 30.8202 39.0891 29.5202 37.1791 29.5202C36.7791 29.5202 36.3991 29.5902 36.0391 29.7002L28.1491 14.0002C28.1891 13.8602 28.2191 13.7102 28.2191 13.5602C28.2191 12.6302 27.4691 11.8802 26.5391 11.8802C25.7791 11.8502 25.1491 12.3602 24.9391 13.0402Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_96_480">
                    <rect width="71.61" height="69.46" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <Typography
                style={{ fontSize: "24px", color: "white", padding: "0 1rem" }}
                className={classes.fontResizeMobile}
              >
                Timer
              </Typography>
            </div>
          )}

          <div className={classes.timerContainer} style={{ margin: "0 2rem" }}>
            {days + hours + minutes + seconds <= 0 ? (
              <>
                <span className={classes.timerLargerText}>{0}</span>
                <span className={classes.timerText}> Days</span>
                <span className={classes.timerLargerText}>{0}</span>
                <span className={classes.timerText}> Hours</span>
                <span className={classes.timerLargerText}>{0}</span>
                <span className={classes.timerText}> Minutes</span>
                <span className={classes.timerLargerText}>{0}</span>
                <span className={classes.timerText}> Seconds</span>
              </>
            ) : (
              <>
                <span className={classes.timerLargerText}>{days}</span>
                <span className={classes.timerText}> Days</span>
                <span className={classes.timerLargerText}>{hours}</span>
                <span className={classes.timerText}> Hours</span>
                <span className={classes.timerLargerText}>{minutes}</span>
                <span className={classes.timerText}> Minutes</span>
                {!shouldShowTimer && (
                  <>
                    <span className={classes.timerLargerText}>{seconds}</span>
                    <span className={classes.timerText}> Seconds</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            margin: "2.5rem 0",
            width: "100%",
            justifyContent: "left",
          }}
        >
          <a href="" className={classes.infoButton}>
            More Information
          </a>
        </div>
      </div>
      {now < ends * 1000 && (
        <div className={classes.countdownContainer}>
          {shouldShowTimer && (
            <div className={classes.countdownUpContainer}>
              <span
                className={classes.timerNextLargerText}
                style={{ transform: "rotate(-18deg) translate(-12%, 3%)" }}
              >
                {beforeSecond_6}
              </span>
              <span
                className={classes.timerNextLargerText}
                style={{ transform: "rotate(-9deg) translate(7%, 10%)" }}
              >
                {beforeSecond_5}
              </span>
              <span
                className={classes.timerNextLargerText}
                style={{ transform: "rotate(-7deg) translate(14%, 7%)" }}
              >
                {beforeSecond_4}
              </span>
              <span
                className={classes.timerNextLargerText}
                style={{ transform: "rotate(0deg) translate(15%, 7%)" }}
              >
                {beforeSecond_3}
              </span>
              <span
                className={classes.timerNextLargerText}
                style={{ transform: "rotate(7deg) translate(10%, 5%)" }}
              >
                {beforeSecond_2}
              </span>
              <span
                className={classes.timerNextLargerText}
                style={{ transform: "rotate(14deg) translate(-4%, 2%)" }}
              >
                {beforeSecond}
              </span>
            </div>
          )}
          {shouldShowTimer && (
            <div style={{ display: "flex" }}>
              <span
                className={classes.timerLargerText}
                style={{ minWidth: "65px" }}
              >
                {seconds}
              </span>
              <span className={classes.timerText}> Seconds</span>
            </div>
          )}

          {shouldShowTimer && (
            <div className={classes.countdownDownContainer}>
              <span
                className={classes.timerBeforeLargerText}
                style={{ transform: "rotate(-13deg) translate(-2%, 2%)" }}
              >
                {nextSeconds}
              </span>
              <span
                className={classes.timerBeforeLargerText}
                style={{ transform: "rotate(-8deg) translate(8%, 6%" }}
              >
                {nextSeconds_2}
              </span>
              <span
                className={classes.timerBeforeLargerText}
                style={{ transform: "rotate(-1deg) translate(13%, -2%)" }}
              >
                {nextSeconds_3}
              </span>
              <span
                className={classes.timerBeforeLargerText}
                style={{ transform: "rotate(6deg) translate(11%, -8%)" }}
              >
                {nextSeconds_4}
              </span>
              <span
                className={classes.timerBeforeLargerText}
                style={{ transform: "rotate(14deg)" }}
              >
                {nextSeconds_5}
              </span>
              <span
                className={classes.timerBeforeLargerText}
                style={{ transform: "rotate(21deg) translate(-17%, 10%)" }}
              >
                {nextSeconds_6}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function useTimer(deadline: number, interval = SECOND) {
  const [timeLeft, setTimeLeft] = useState(deadline * 1000 - Date.now());

  useEffect(() => {
    setTimeLeft(deadline * 1000 - Date.now());

    const intervalId = setInterval(() => {
      setTimeLeft((prevTimeLeft) => prevTimeLeft - interval);
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [deadline, interval]);

  return {
    days: Math.floor(timeLeft / DAY),
    hours: Math.floor((timeLeft / HOUR) % 24),
    minutes: Math.floor((timeLeft / MINUTE) % 60),
    seconds: Math.floor((timeLeft / SECOND) % 60),
    // Calculate the next second
    nextSeconds: Math.floor((timeLeft / SECOND + 1) % 60),
    nextSeconds_2: Math.floor((timeLeft / SECOND + 2) % 60),
    nextSeconds_3: Math.floor((timeLeft / SECOND + 3) % 60),
    nextSeconds_4: Math.floor((timeLeft / SECOND + 4) % 60),
    nextSeconds_5: Math.floor((timeLeft / SECOND + 5) % 60),
    nextSeconds_6: Math.floor((timeLeft / SECOND + 6) % 60),
    beforeSecond: Math.floor((timeLeft / SECOND - 1) % 60),
    beforeSecond_2: Math.floor((timeLeft / SECOND - 2) % 60),
    beforeSecond_3: Math.floor((timeLeft / SECOND - 3) % 60),
    beforeSecond_4: Math.floor((timeLeft / SECOND - 4) % 60),
    beforeSecond_5: Math.floor((timeLeft / SECOND - 5) % 60),
    beforeSecond_6: Math.floor((timeLeft / SECOND - 6) % 60),
  };
}
