import { Paper } from "@mui/material";
import Setup from "./setup";
import classes from "./ssSwap.module.css";

function Swap() {
  return (
    <div className="lg:pt-4rem !lg:pt-28">
      <div className={classes.container}>
        <div className={classes.swapHeader}></div>
        <div className={classes.newSwapContainer}>
          <Paper
            elevation={0}
            className={classes.swapContainer}
            style={{
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              boxShadow:
                "0 0 6px rgb(0 0 0/4%), 0 14px 20px rgb(0 0 0/1%), 0 20px 28px rgb(0 0 0/1%)",
              border: "1px solid rgba(34, 34, 34, 0.07)",
              padding: "0px",
              width: "fit-content",
              boxSizing: "border-box",
              margin: "0 2%",
            }}
          >
            <Setup />
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default Swap;
