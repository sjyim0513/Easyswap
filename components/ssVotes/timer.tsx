import { useState, useEffect } from "react";

import classes from "./ssVotes.module.css";

// component
import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";

export let epochsec = 0;
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export default function Timer({ deadline }: { deadline: number }) {
  const { days, hours, minutes, seconds } = useTimer(deadline, SECOND);
  return (
    <div className={classes.timerBox}>
      <div className={classes.timerBox_title}>
        <p>Epoch</p>
        <p>timer</p>
      </div>
      <div className={classes.timerText}>
        {days + hours + minutes + seconds <= 0 ? (
          <>
            <CircularProgressWithLabel value={0} type={"Days"} />
            <CircularProgressWithLabel value={0} type={"Hours"} />
            <CircularProgressWithLabel value={0} type={"Minutes"} />
            <CircularProgressWithLabel value={0} type={"Seconds"} />
          </>
        ) : (
          <>
            <CircularProgressWithLabel value={days} type={"Days"} />
            <CircularProgressWithLabel value={hours} type={"Hours"} />
            <CircularProgressWithLabel value={minutes} type={"Minutes"} />
            <CircularProgressWithLabel value={seconds} type={"Seconds"} />
          </>
        )}
        {/* For test purpose only
        <CircularProgressWithLabel value={60} type={"Days"} />
        <CircularProgressWithLabel value={60} type={"Hours"} />
        <CircularProgressWithLabel value={60} type={"Minutes"} />
        <CircularProgressWithLabel value={60} type={"Seconds"} />
        */}
      </div>
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

  epochsec = timeLeft;
  return {
    days: Math.floor(timeLeft / DAY),
    hours: Math.floor((timeLeft / HOUR) % 24),
    minutes: Math.floor((timeLeft / MINUTE) % 60),
    seconds: Math.floor((timeLeft / SECOND) % 60),
  };
}

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number; type: string }
) {
  const [rebalanceProps, setRebalanceProps] = useState(props);
  const type = props.type;
  let rebalanceValue: number;

  if (type === "Days") {
    rebalanceValue = props.value / 0.6;
  } else if (type === "Hours") {
    rebalanceValue = props.value / 0.6;
  } else if (type === "Minutes") {
    rebalanceValue = props.value / 0.6;
  } else {
    // type === Seconds
    rebalanceValue = props.value / 0.6;
  }

  useEffect(() => {
    setRebalanceProps({ ...props, value: rebalanceValue });
  }, [props]);

  return (
    <div>
      <div className={classes.timerContainer}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={100}
          sx={{
            color: "#FFD7C2",
            "@media (max-width: 760px)": {
              width: "50px !important",
              height: "50px !important",
            },
          }}
        />
        <CircularProgress
          variant="determinate"
          {...rebalanceProps}
          size={100}
          sx={{
            color: "#fe8e5a",
            position: "absolute",
            "@media (max-width: 760px)": {
              width: "50px !important",
              height: "50px !important",
            },
          }}
        />
        <div className={classes.timerLabel}>{`${props.value}`}</div>
      </div>
      <div className={classes.timerType}>{`${props.type}`}</div>
    </div>
  );
}
