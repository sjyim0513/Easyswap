import React, { useState, useEffect } from "react";
import { withTheme } from "@mui/styles";
import classes2 from "./ssLeaderBoard.module.css";
import {
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import stores from "../../stores";
import { CONTRACTLIST } from "../../stores/constants/constants";
import type { AbiItem } from "web3-utils";
import Web3 from "web3";
import { formatAddress } from "../../utils/utils";

import { Typography } from "@mui/material";

let CONTRACTS
const useStyles = makeStyles((theme) => ({
  tableContainer: {
    display: "flex",
    flexDirection: "column",
    background: "white",
    padding: "3rem",
    borderRadius: "16px",
    boxShadow: "0px 0px 11px 0px #ffd6bf",

    "@media (max-width: 500px)": {
      padding: "3rem 0.25rem",
    },
  },
  tableTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    display: "flex",
    justifyContent: "center",
  },
  tableBody: {
    fontSize: "1rem",
    fontWeight: "normal",
    marginBottom: "1rem",
  },
}));

function Setup() {
  const classes = useStyles();
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const externalData = [
      // {
      //   address: formatAddress("0x6232f10b040f0bee104170eaf417274fdc05e3ac"),
      //   liquidityPoint: 1000,
      //   swapPoint: 1000,
      //   rank: 1,
      // },
    ];

    const chain = stores.accountStore.getStore("chainId")
    CONTRACTS = CONTRACTLIST[chain]

    if (externalData.length > 0) {
      const sortedData = [...externalData];
      sortedData.sort(
        (a, b) =>
          b.liquidityPoint + b.swapPoint - (a.liquidityPoint + a.swapPoint)
      );
      const rankedData = sortedData.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      setLeaderboardData(rankedData);
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ margin: "3rem 0" }}>
        <div className={classes.tableContainer}>
          <Typography className={classes.tableTitle}>Leaderboard</Typography>
          <div style={{ textAlign: "center" }}>
            <Typography className={classes.tableBody}>
              {/* You can claim test tokens once per day per wallet. */}
            </Typography>
          </div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell align="center">Rank</TableCell>
                <TableCell align="center">Address</TableCell>
                <TableCell align="center">Liquidity Point</TableCell>
                <TableCell align="center">Swap Point</TableCell>
              </TableRow>
              {leaderboardData.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{entry.rank}</TableCell>
                  <TableCell align="center">{entry.address}</TableCell>
                  <TableCell align="center">{entry.liquidityPoint}</TableCell>
                  <TableCell align="center">{entry.swapPoint}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default withTheme(Setup);
