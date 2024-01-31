import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import {
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Typography,
  Skeleton,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import BigNumber from "bignumber.js";

import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";
import { formatCurrency } from "../../utils/utils";

import TransactionQueue from "../transactionQueue/transactionQueue";
import Unlock from "../unlock/unlockModal";
import { formatAddress } from "../../utils/utils";
import classes2 from "./ssRewards.module.css";
import { MyConnectWallet } from "../MyConnectWallet";

const headCells = [
  { id: "reward", numeric: false, disablePadding: false, label: "Pool" },
  {
    id: "balance",
    numeric: true,
    disablePadding: false,
    label: "Your Position",
  },
  {
    id: "earned",
    numeric: true,
    disablePadding: false,
    label: "You Earned",
  },
  {
    id: "bruh",
    numeric: true,
    disablePadding: false,
    label: "Actions",
  },
];

const TokenheadCells = [
  { id: "reward", numeric: false, disablePadding: false, label: "Token" },
  {
    id: "balance",
    numeric: true,
    disablePadding: false,
    label: "Locked Amount",
  },
  {
    id: "earned",
    numeric: true,
    disablePadding: false,
    label: "You Earned",
  },
  {
    id: "bruh",
    numeric: true,
    disablePadding: false,
    label: "Actions",
  },
];

const AllheadCells = [
  { id: "token", numeric: false, disablePadding: false, label: "Token" },
  { id: "reward", numeric: false, disablePadding: false, label: "Reward" },
  {
    id: "balance",
    numeric: true,
    disablePadding: false,
    label: "Your Position",
  },
  {
    id: "earned",
    numeric: true,
    disablePadding: false,
    label: "You Earned",
  },
  {
    id: "bruh",
    numeric: true,
    disablePadding: false,
    label: "Actions",
  },
];

function EnhancedTableHead(props) {
  const { type, classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  if (type === "LP") {
    return (
      <TableHead>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              className={classes.overrideTableHead}
              key={headCell.id}
              align={headCell.numeric ? "right" : "left"}
              padding={"normal"}
              sortDirection={orderBy === headCell.id ? order : false}
              style={{ borderRadius: "15px" }}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                <Typography variant="h5" className={classes.headerText}>
                  {headCell.label}
                </Typography>
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  } else if (type === "ALL") {
    return (
      <TableHead>
        <TableRow>
          {AllheadCells.map((headCell) => (
            <TableCell
              className={classes.overrideTableHead}
              key={headCell.id}
              align={headCell.numeric ? "right" : "left"}
              padding={"normal"}
              sortDirection={orderBy === headCell.id ? order : false}
              style={{ borderRadius: "15px" }}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                <Typography variant="h5" className={classes.headerText}>
                  {headCell.label}
                </Typography>
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
  return (
    <TableHead>
      <TableRow>
        {TokenheadCells.map((headCell) => (
          <TableCell
            className={classes.overrideTableHead}
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={"normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            style={{ borderRadius: "15px" }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              <Typography variant="h5" className={classes.headerText}>
                {headCell.label}
              </Typography>
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  type: PropTypes.string,
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  assetTableRow: {
    "&:hover": {
      background: "rgba(104,108,122,0.05)",
    },
  },
  paper: {
    width: "100%",
    // @ts-expect-error we dont have type for default theme
    marginBottom: theme.spacing(2),
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
  inline: {
    display: "flex",
    alignItems: "center",
  },
  inlineEnd: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  icon: {
    marginRight: "12px",
  },
  textSpaced: {
    lineHeight: "1.5",
    fontWeight: "200",
    fontSize: "12px",
  },
  textSpacedPadded: {
    paddingLeft: "0.5rem",
    lineHeight: "1.5",
    fontWeight: "200",
    fontSize: "12px",
  },
  headerText: {
    fontWeight: "200",
    fontSize: "12px",
  },
  cell: {},
  cellSuccess: {
    color: "#4eaf0a",
  },
  cellAddress: {
    cursor: "pointer",
  },
  aligntRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  skelly0: {
    margin: "0",
  },
  skelly: {
    margin: "1px 0",
  },
  skelly1: {
    marginBottom: "12px",
    marginTop: "24px",
  },
  skelly2: {
    margin: "12px 6px",
  },
  tableBottomSkelly: {
    display: "flex",
    justifyContent: "flex-end",
  },
  assetInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    padding: "24px",
    width: "100%",
    flexWrap: "wrap",
    borderBottom: "1px solid rgba(104, 108, 122, 0.25)",
    background:
      "radial-gradient(circle, rgba(63,94,251,0.7) 0%, rgba(47,128,237,0.7) 48%) rgba(63,94,251,0.7) 100%",
  },
  assetInfoError: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    padding: "24px",
    width: "100%",
    flexWrap: "wrap",
    borderBottom: "1px rgba(104, 108, 122, 0.25)",
    background: "#dc3545",
  },
  infoField: {
    flex: 1,
  },
  flexy: {
    padding: "6px 0px",
  },
  overrideCell: {
    padding: "0px",
  },
  hoverRow: {
    cursor: "pointer",
  },
  statusLiquid: {
    color: "#dc3545",
  },
  statusWarning: {
    color: "#FF9029",
  },
  statusSafe: {
    color: "green",
  },
  imgLogo: {
    borderRadius: "30px",
  },
  img1Logo: {
    position: "absolute",
    left: "0px",
    top: "0px",
    borderRadius: "30px",
  },
  img2Logo: {
    position: "absolute",
    left: "23px",
    zIndex: "1",
    top: "0px",
    borderRadius: "30px",
  },
  overrideTableHead: {
    borderBottom: "1px solid rgba(126,153,176,0.15) !important",
  },
  doubleImages: {
    display: "flex",
    position: "relative",
    width: "70px",
    height: "35px",
  },
  searchContainer: {
    flex: 1,
    minWidth: "300px",
    marginRight: "30px",
  },
  buttonOverride: {
    background: "#272826",
    fontWeight: "700",
    "&:hover": {
      background: "#2e2254",
    },
  },
  toolbar: {
    margin: "24px 0px",
    padding: "0px",
  },
  tableContainer: {
    border: "1px solid rgba(126,153,176,0.2)",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  filterButton: {
    background: "#272826",
    border: "1px solid rgba(126,153,176,0.3)",
    marginRight: "30px",
  },
  actionButtonText: {
    fontSize: "15px",
    fontWeight: "700",
  },
  filterContainer: {
    background: "#212b48",
    minWidth: "300px",
    marginTop: "15px",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 10px 20px 0 rgba(0,0,0,0.2)",
    border: "1px solid rgba(126,153,176,0.2)",
  },
  alignContentRight: {
    textAlign: "right",
  },
  labelColumn: {
    display: "flex",
    alignItems: "center",
  },
  filterLabel: {
    fontSize: "14px",
  },
  filterListTitle: {
    marginBottom: "10px",
    paddingBottom: "20px",
    borderBottom: "1px solid rgba(126,153,176,0.2)",
  },
  infoIcon: {
    fontSize: "16px",
    marginLeft: "10px",
  },
  symbol: {
    marginLeft: "0.5rem",
  },
}));

export default function EnhancedTable({
  type,
  rewards,
  tokenID,
}: {
  type: string;
  rewards: any[];
  tokenID: string;
}) {
  const classes = useStyles();
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("balance");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const accountStore = stores.accountStore.getStore("account");
  const [account, setAccount] = useState(accountStore);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [transactionQueueLength, setTransactionQueueLength] = useState(0);
  const { CONNECT_WALLET, ACCOUNT_CONFIGURED } = ACTIONS;
  const [isDisabled, setIsDisabled] = useState(false);
  const [rowStates, setRowStates] = useState({});
  const [skeletonTimeout, setSkeletonTimeout] = useState(true);
  const [skeletonTimeoutVote, setSkeletonTimeoutVote] = useState(true);

  const closeUnlock = () => {
    setUnlockOpen(false);
  };
  const setQueueLength = (length) => {
    setTransactionQueueLength(length);
  };

  const onAddressClicked = () => {
    setUnlockOpen(true);
  };

  useEffect(() => {
    setSkeletonTimeoutVote(true);
    const timeId = setTimeout(() => {
      setSkeletonTimeoutVote(false);
    }, 10000);

    return () => {
      clearTimeout(timeId);
    };
  }, [tokenID]);

  useEffect(() => {
    const timeId = setTimeout(() => {
      setSkeletonTimeout(false);
    }, 10000);

    const accountConfigure = () => {
      const accountStore = stores.accountStore.getStore("account");
      setAccount(accountStore);

      closeUnlock();
    };
    const connectWallet = () => {
      onAddressClicked();
    };

    const errorReturned = () => {
      setIsDisabled(false);
    };

    const claimReturned = (pair) => {
      setIsDisabled(false);
    };

    const claimAllReturned = () => {
      setIsDisabled(false);
    };

    stores.emitter.on(ACTIONS.CLAIM_BRIBE_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_REWARD_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_PAIR_FEES_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_VE_DIST_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_ALL_REWARDS_RETURNED, claimAllReturned);
    stores.emitter.on(ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(CONNECT_WALLET, connectWallet);
    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    return () => {
      clearTimeout(timeId);
      stores.emitter.removeListener(
        ACTIONS.CLAIM_BRIBE_RETURNED,
        claimReturned
      );
      stores.emitter.removeListener(
        ACTIONS.CLAIM_REWARD_RETURNED,
        claimReturned
      );
      stores.emitter.removeListener(
        ACTIONS.CLAIM_PAIR_FEES_RETURNED,
        claimReturned
      );
      stores.emitter.removeListener(
        ACTIONS.CLAIM_VE_DIST_RETURNED,
        claimReturned
      );
      stores.emitter.removeListener(
        ACTIONS.CLAIM_ALL_REWARDS_RETURNED,
        claimAllReturned
      );
      stores.emitter.removeListener(ACCOUNT_CONFIGURED, accountConfigure);
      stores.emitter.removeListener(CONNECT_WALLET, connectWallet);
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
    };
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  if (!rewards) {
    return (
      <div className={classes.root}>
        <Skeleton
          variant="rectangular"
          width={"100%"}
          height={40}
          className={classes.skelly1}
        />
        <Skeleton
          variant="rectangular"
          width={"100%"}
          height={70}
          className={classes.skelly}
        />
        <Skeleton
          variant="rectangular"
          width={"100%"}
          height={70}
          className={classes.skelly}
        />
        <Skeleton
          variant="rectangular"
          width={"100%"}
          height={70}
          className={classes.skelly}
        />
        <Skeleton
          variant="rectangular"
          width={"100%"}
          height={70}
          className={classes.skelly}
        />
        <Skeleton
          variant="rectangular"
          width={"100%"}
          height={70}
          className={classes.skelly}
        />
      </div>
    );
  }

  const resetRowState = (rewardId) => {
    setRowStates((prevState) => ({
      ...prevState,
      [rewardId]: false,
    }));
  };

  //  voting rewards
  const onClaimVote = (reward) => {
    let tokenID_ = tokenID;

    if (tokenID_ === "ALL") {
      tokenID_ = reward.gauge.tokenID.toString();
    }

    const newRowStates = { ...rowStates };
    newRowStates[reward.id] = true;
    setRowStates(newRowStates);
    if (reward.rewardType === "Bribe") {
      stores.dispatcher.dispatch({
        type: ACTIONS.CLAIM_BRIBE,
        content: { pair: reward, tokenID: tokenID_ },
      });
    } else if (reward.rewardType === "Fees") {
      stores.dispatcher.dispatch({
        type: ACTIONS.CLAIM_PAIR_FEES,
        content: { pair: reward, tokenID: tokenID_ },
      });
    }

    resetRowState(reward.id);
  };

  const onClaimDist = (reward) => {
    const newRowStates = { ...rowStates };
    newRowStates[reward.id] = true;
    setRowStates(newRowStates);
    const tokenID = reward.token.id;
    if (reward.rewardType === "Distribution") {
      stores.dispatcher.dispatch({
        type: ACTIONS.CLAIM_VE_DIST,
        content: { tokenID },
      });
    }

    resetRowState(reward.id);
  };

  //claim LP rewards
  const onClaimLP = (reward) => {
    //console.log("onClaimLP", reward);
    const newRowStates = { ...rowStates };
    newRowStates[reward.id] = true;
    setRowStates(newRowStates);
    stores.dispatcher.dispatch({
      type: ACTIONS.CLAIM_REWARD,
      content: { pair: reward, tokenID },
    });

    resetRowState(reward.id);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rewards.length - page * rowsPerPage);

  if (!account.address) {
    return (
      <div className={classes.root}>
        <Paper
          elevation={0}
          className={classes.tableContainer}
          style={{
            display: "flex",
            justifyContent: "center",
            borderRadius: "10px",
            height: "400px",
            alignItems: "center",
          }}
        >
          {<MyConnectWallet onClick={onAddressClicked} />}
          {unlockOpen && (
            <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />
          )}
          {/* <TransactionQueue setQueueLength={setQueueLength} /> */}
        </Paper>
      </div>
    );
  }
  if (type === "vote") {
    if (tokenID === "ALL") {
      if (rewards.length > 0) {
        if (rewards[0].length === 0 && skeletonTimeoutVote) {
          return (
            <div className={classes.root}>
              <Paper
                elevation={0}
                className={classes.tableContainer}
                style={{
                  borderRadius: "15px",
                }}
              >
                <TableContainer>
                  <Table
                    aria-labelledby="tableTitle"
                    size={"medium"}
                    aria-label="enhanced table"
                  >
                    <EnhancedTableHead
                      type={tokenID}
                      classes={classes}
                      order={order}
                      orderBy={orderBy}
                      onRequestSort={handleRequestSort}
                    />
                    <TableBody>
                      <TableRow>
                        <TableCell
                          className={classes.cell}
                          colSpan={5}
                          style={{ textAlign: "center" }}
                        >
                          <Skeleton
                            variant="rectangular"
                            width={"100%"}
                            height={49}
                            className={classes.skelly0}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={rewards[0]?.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            </div>
          );
        }
      } else {
        return (
          <div className={classes.root}>
            <Paper
              elevation={0}
              className={classes.tableContainer}
              style={{
                borderRadius: "15px",
              }}
            >
              <TableContainer>
                <Table
                  aria-labelledby="tableTitle"
                  size={"medium"}
                  aria-label="enhanced table"
                >
                  <EnhancedTableHead
                    type={tokenID}
                    classes={classes}
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    <TableRow>
                      <TableCell
                        className={classes.cell}
                        colSpan={5}
                        style={{ textAlign: "center" }}
                      >
                        {/* <Skeleton
                          variant="rectangular"
                          width={"100%"}
                          height={49}
                          className={classes.skelly0}
                        /> */}
                        <Typography>Nothing to claim</Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={rewards.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </div>
        );
      }

      let newArray = Array.isArray(rewards[0]) ? rewards[0] : rewards;
      const bribeAndFeesArray = newArray.reduce((result, obj) => {
        result = result.concat(obj.Bribe, obj.Fees);
        return result;
      }, []);
      //console.log("bribeAndFeesArray", bribeAndFeesArray);
      return (
        <div className={classes.root}>
          <Paper
            elevation={0}
            className={classes.tableContainer}
            style={{
              borderRadius: "15px",
            }}
          >
            <TableContainer>
              <Table
                aria-labelledby="tableTitle"
                size={"medium"}
                aria-label="enhanced table"
              >
                <EnhancedTableHead
                  type={tokenID}
                  classes={classes}
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {rewards[0].length === 0 ? (
                    <TableRow>
                      <TableCell
                        className={classes.cell}
                        colSpan={5}
                        style={{ textAlign: "center" }}
                      >
                        <Typography>Nothing to claim</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    stableSort(
                      bribeAndFeesArray,
                      getComparator(tokenID, order, orderBy)
                    )
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row, index) => {
                        if (!row) {
                          return (
                            <TableRow
                              key={"ssRewardsTable" + index}
                              className={classes.assetTableRow}
                            >
                              <TableCell
                                className={classes.cell}
                                colSpan={5}
                                style={{ textAlign: "center" }}
                              >
                                {/* <Typography>Nothing to claim</Typography> */}
                                <Skeleton
                                  variant="rectangular"
                                  width={"100%"}
                                  height={49}
                                  className={classes.skelly}
                                ></Skeleton>
                              </TableCell>
                            </TableRow>
                          );
                        }
                        return (
                          <TableRow
                            key={"ssRewardsTable" + index}
                            className={classes.assetTableRow}
                          >
                            <TableCell className={classes.cell}>
                              <div className={classes.inline}>
                                <div className={classes.doubleImages}>
                                  <img
                                    className={classes.img1Logo}
                                    src={"/tokens/govToken-logo.png"}
                                    width="37"
                                    height="37"
                                    alt=""
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).onerror =
                                        null;
                                      (e.target as HTMLImageElement).src =
                                        "/tokens/unknown-logo.png";
                                    }}
                                  />
                                </div>
                                <div>
                                  <Typography
                                    variant="h2"
                                    noWrap
                                    className={classes.textSpaced}
                                  >
                                    {"Token #" + row?.gauge?.tokenID}
                                  </Typography>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className={classes.cell}>
                              {["Bribe", "Fees"].includes(row.rewardType) && (
                                <div className={classes.inline}>
                                  <div className={classes.doubleImages}>
                                    <img
                                      className={classes.img1Logo}
                                      src={
                                        row && row.token0 && row.token0.logoURI
                                          ? row.token0.logoURI
                                          : ``
                                      }
                                      width="37"
                                      height="37"
                                      alt=""
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).onerror =
                                          null;
                                        (e.target as HTMLImageElement).src =
                                          "/tokens/unknown-logo.png";
                                      }}
                                    />
                                    <img
                                      className={classes.img2Logo}
                                      src={
                                        row && row.token1 && row.token1.logoURI
                                          ? row.token1.logoURI
                                          : ``
                                      }
                                      width="37"
                                      height="37"
                                      alt=""
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).onerror =
                                          null;
                                        (e.target as HTMLImageElement).src =
                                          "/tokens/unknown-logo.png";
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <Typography
                                      variant="h2"
                                      noWrap
                                      className={classes.textSpaced}
                                    >
                                      {row?.symbol}
                                    </Typography>
                                    <Typography
                                      variant="h5"
                                      className={classes.textSpaced}
                                      color="textSecondary"
                                    >
                                      {row?.rewardType}
                                    </Typography>
                                  </div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className={classes.cell} align="right">
                              <div>
                                {row &&
                                  row.rewardType === "Bribe" &&
                                  row.gauge &&
                                  row.gauge.balance &&
                                  row.gauge.totalSupply && (
                                    <>
                                      <div className={classes.inlineEnd}>
                                        <Typography
                                          variant="h2"
                                          className={classes.textSpaced}
                                        >
                                          {formatCurrency(
                                            BigNumber(row.gauge.balance)
                                              .div(row.gauge.totalSupply)
                                              .times(row.gauge.reserve0)
                                          )}
                                        </Typography>
                                        <Typography
                                          variant="h5"
                                          className={`${classes.textSpaced} ${classes.symbol}`}
                                          color="textSecondary"
                                        >
                                          {row.token0.symbol}
                                        </Typography>
                                      </div>
                                      <div className={classes.inlineEnd}>
                                        <Typography
                                          variant="h5"
                                          className={classes.textSpaced}
                                        >
                                          {formatCurrency(
                                            BigNumber(row.gauge.balance)
                                              .div(row.gauge.totalSupply)
                                              .times(row.gauge.reserve1)
                                          )}
                                        </Typography>
                                        <Typography
                                          variant="h5"
                                          className={`${classes.textSpaced} ${classes.symbol}`}
                                          color="textSecondary"
                                        >
                                          {row.token1.symbol}
                                        </Typography>
                                      </div>
                                    </>
                                  )}
                                {row &&
                                  row.rewardType === "Fees" &&
                                  row.balance &&
                                  row.totalSupply && (
                                    <>
                                      <div className={classes.inlineEnd}>
                                        <Typography
                                          variant="h2"
                                          className={classes.textSpaced}
                                        >
                                          {formatCurrency(
                                            BigNumber(row.balance)
                                              .div(row.totalSupply)
                                              .times(row.reserve0)
                                          )}
                                        </Typography>
                                        <Typography
                                          variant="h5"
                                          className={`${classes.textSpaced} ${classes.symbol}`}
                                          color="textSecondary"
                                        >
                                          {row.token0.symbol}
                                        </Typography>
                                      </div>
                                      <div className={classes.inlineEnd}>
                                        <Typography
                                          variant="h5"
                                          className={classes.textSpaced}
                                        >
                                          {formatCurrency(
                                            BigNumber(row.balance)
                                              .div(row.totalSupply)
                                              .times(row.reserve1)
                                          )}
                                        </Typography>
                                        <Typography
                                          variant="h5"
                                          className={`${classes.textSpaced} ${classes.symbol}`}
                                          color="textSecondary"
                                        >
                                          {row.token1.symbol}
                                        </Typography>
                                      </div>
                                    </>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell className={classes.cell} align="right">
                              <div>
                                {row &&
                                  row.rewardType === "Bribe" &&
                                  row.gauge &&
                                  row.gauge.bribes &&
                                  row.gauge.bribes.map((bribe) => {
                                    if (parseFloat(bribe.earned) !== 0) {
                                      return (
                                        <div className={classes.inlineEnd}>
                                          <img
                                            className={classes.imgLogo}
                                            src={
                                              bribe &&
                                              bribe.token &&
                                              bribe.token.logoURI
                                                ? bribe.token.logoURI
                                                : ``
                                            }
                                            width="24"
                                            height="24"
                                            alt=""
                                            onError={(e) => {
                                              (
                                                e.target as HTMLImageElement
                                              ).onerror = null;
                                              (
                                                e.target as HTMLImageElement
                                              ).src =
                                                "/tokens/unknown-logo.png";
                                            }}
                                          />
                                          <Typography
                                            variant="h2"
                                            className={classes.textSpacedPadded}
                                          >
                                            {formatCurrency(bribe.earned)}
                                          </Typography>
                                          <Typography
                                            variant="h5"
                                            className={classes.textSpacedPadded}
                                            color="textSecondary"
                                          >
                                            {bribe.token?.symbol}
                                          </Typography>
                                        </div>
                                      );
                                    }
                                  })}
                                {row &&
                                  row.rewardType === "Fees" &&
                                  row.gauge &&
                                  row.gauge.token0Earned &&
                                  row.gauge.token1Earned && (
                                    <>
                                      <div className={classes.inlineEnd}>
                                        <img
                                          className={classes.imgLogo}
                                          src={
                                            row.token0 && row.token0.logoURI
                                              ? row.token0.logoURI
                                              : ``
                                          }
                                          width="24"
                                          height="24"
                                          alt=""
                                          onError={(e) => {
                                            (
                                              e.target as HTMLImageElement
                                            ).onerror = null;
                                            (e.target as HTMLImageElement).src =
                                              "/tokens/unknown-logo.png";
                                          }}
                                        />
                                        <Typography
                                          variant="h2"
                                          className={classes.textSpacedPadded}
                                        >
                                          {formatCurrency(
                                            row.gauge.token0Earned
                                          )}
                                        </Typography>
                                        <Typography
                                          variant="h5"
                                          className={classes.textSpacedPadded}
                                          color="textSecondary"
                                        >
                                          {row.token0?.symbol}
                                        </Typography>
                                      </div>
                                      <div className={classes.inlineEnd}>
                                        <img
                                          className={classes.imgLogo}
                                          src={
                                            row.token1 && row.token1.logoURI
                                              ? row.token1.logoURI
                                              : ``
                                          }
                                          width="24"
                                          height="24"
                                          alt=""
                                          onError={(e) => {
                                            (
                                              e.target as HTMLImageElement
                                            ).onerror = null;
                                            (e.target as HTMLImageElement).src =
                                              "/tokens/unknown-logo.png";
                                          }}
                                        />
                                        <Typography
                                          variant="h2"
                                          className={classes.textSpacedPadded}
                                        >
                                          {formatCurrency(
                                            row.gauge.token1Earned
                                          )}
                                        </Typography>
                                        <Typography
                                          variant="h5"
                                          className={classes.textSpacedPadded}
                                          color="textSecondary"
                                        >
                                          {row.token1?.symbol}
                                        </Typography>
                                      </div>
                                    </>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell className={classes.cell} align="right">
                              {row && row.rewardType !== "Reward" && (
                                <Button
                                  disabled={rowStates[row.id]}
                                  onClick={() => {
                                    onClaimVote(row);
                                  }}
                                  style={{ color: "white" }}
                                >
                                  Claim
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={bribeAndFeesArray.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      );
    }
    if (rewards.length === 0 && skeletonTimeoutVote) {
      return (
        <Paper
          elevation={0}
          className={classes.tableContainer}
          style={{
            borderRadius: "15px",
          }}
        >
          <TableContainer>
            <Table
              aria-labelledby="tableTitle"
              size={"medium"}
              aria-label="enhanced table"
            >
              <EnhancedTableHead
                type={type}
                classes={classes}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                <TableRow>
                  <TableCell
                    className={classes.cell}
                    colSpan={5}
                    style={{ textAlign: "center" }}
                  >
                    {/* <Typography>Nothing to claim</Typography> */}
                    <Skeleton
                      variant="rectangular"
                      width={"100%"}
                      height={49}
                      className={classes.skelly}
                    ></Skeleton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rewards.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      );
    }
    return (
      <div className={classes.root}>
        <Paper
          elevation={0}
          className={classes.tableContainer}
          style={{
            borderRadius: "15px",
          }}
        >
          <TableContainer>
            <Table
              aria-labelledby="tableTitle"
              size={"medium"}
              aria-label="enhanced table"
            >
              <EnhancedTableHead
                type={type}
                classes={classes}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                {rewards.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className={classes.cell}
                      colSpan={5}
                      style={{ textAlign: "center" }}
                    >
                      <Typography>Nothing to claim</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  stableSort(rewards, getComparator(type, order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      if (!row) {
                        return (
                          <TableRow
                            key={"ssRewardsTable" + index}
                            className={classes.assetTableRow}
                          >
                            <TableCell
                              className={classes.cell}
                              colSpan={5}
                              style={{ textAlign: "center" }}
                            >
                              {/* <Typography>Theres nothing to claim</Typography> */}
                              <Skeleton
                                variant="rectangular"
                                width={"100%"}
                                height={49}
                                className={classes.skelly}
                              ></Skeleton>
                            </TableCell>
                          </TableRow>
                        );
                      }
                      return (
                        <TableRow
                          key={"ssRewardsTable" + index}
                          className={classes.assetTableRow}
                        >
                          <TableCell className={classes.cell}>
                            {["Bribe", "Fees"].includes(row.rewardType) && (
                              <div className={classes.inline}>
                                <div className={classes.doubleImages}>
                                  <img
                                    className={classes.img1Logo}
                                    src={
                                      row && row.token0 && row.token0.logoURI
                                        ? row.token0.logoURI
                                        : ``
                                    }
                                    width="37"
                                    height="37"
                                    alt=""
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).onerror =
                                        null;
                                      (e.target as HTMLImageElement).src =
                                        "/tokens/unknown-logo.png";
                                    }}
                                  />
                                  <img
                                    className={classes.img2Logo}
                                    src={
                                      row && row.token1 && row.token1.logoURI
                                        ? row.token1.logoURI
                                        : ``
                                    }
                                    width="37"
                                    height="37"
                                    alt=""
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).onerror =
                                        null;
                                      (e.target as HTMLImageElement).src =
                                        "/tokens/unknown-logo.png";
                                    }}
                                  />
                                </div>
                                <div>
                                  <Typography
                                    variant="h2"
                                    noWrap
                                    className={classes.textSpaced}
                                  >
                                    {row?.symbol}
                                  </Typography>
                                  <Typography
                                    variant="h5"
                                    className={classes.textSpaced}
                                    color="textSecondary"
                                  >
                                    {row?.rewardType}
                                  </Typography>
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            <div>
                              {row &&
                                row.rewardType === "Bribe" &&
                                row.gauge &&
                                row.gauge.balance &&
                                row.gauge.totalSupply && (
                                  <>
                                    <div className={classes.inlineEnd}>
                                      <Typography
                                        variant="h2"
                                        className={classes.textSpaced}
                                      >
                                        {formatCurrency(
                                          BigNumber(row.gauge.balance)
                                            .div(row.gauge.totalSupply)
                                            .times(row.gauge.reserve0)
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={`${classes.textSpaced} ${classes.symbol}`}
                                        color="textSecondary"
                                      >
                                        {row.token0.symbol}
                                      </Typography>
                                    </div>
                                    <div className={classes.inlineEnd}>
                                      <Typography
                                        variant="h5"
                                        className={classes.textSpaced}
                                      >
                                        {formatCurrency(
                                          BigNumber(row.gauge.balance)
                                            .div(row.gauge.totalSupply)
                                            .times(row.gauge.reserve1)
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={`${classes.textSpaced} ${classes.symbol}`}
                                        color="textSecondary"
                                      >
                                        {row.token1.symbol}
                                      </Typography>
                                    </div>
                                  </>
                                )}
                              {row &&
                                row.rewardType === "Fees" &&
                                row.balance &&
                                row.totalSupply && (
                                  <>
                                    <div className={classes.inlineEnd}>
                                      <Typography
                                        variant="h2"
                                        className={classes.textSpaced}
                                      >
                                        {formatCurrency(
                                          BigNumber(row.balance)
                                            .div(row.totalSupply)
                                            .times(row.reserve0)
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={`${classes.textSpaced} ${classes.symbol}`}
                                        color="textSecondary"
                                      >
                                        {row.token0.symbol}
                                      </Typography>
                                    </div>
                                    <div className={classes.inlineEnd}>
                                      <Typography
                                        variant="h5"
                                        className={classes.textSpaced}
                                      >
                                        {formatCurrency(
                                          BigNumber(row.balance)
                                            .div(row.totalSupply)
                                            .times(row.reserve1)
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={`${classes.textSpaced} ${classes.symbol}`}
                                        color="textSecondary"
                                      >
                                        {row.token1.symbol}
                                      </Typography>
                                    </div>
                                  </>
                                )}
                            </div>
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            <div>
                              {row &&
                                row.rewardType === "Bribe" &&
                                row.gauge &&
                                row.gauge.bribes &&
                                row.gauge.bribes.map((bribe) => {
                                  if (parseFloat(bribe.earned) !== 0) {
                                    return (
                                      <div className={classes.inlineEnd}>
                                        <img
                                          className={classes.imgLogo}
                                          src={
                                            bribe &&
                                            bribe.token &&
                                            bribe.token.logoURI
                                              ? bribe.token.logoURI
                                              : ``
                                          }
                                          width="24"
                                          height="24"
                                          alt=""
                                          onError={(e) => {
                                            (
                                              e.target as HTMLImageElement
                                            ).onerror = null;
                                            (e.target as HTMLImageElement).src =
                                              "/tokens/unknown-logo.png";
                                          }}
                                        />
                                        <Typography
                                          variant="h2"
                                          className={classes.textSpacedPadded}
                                        >
                                          {formatCurrency(bribe.earned)}
                                        </Typography>
                                        <Typography
                                          variant="h5"
                                          className={classes.textSpacedPadded}
                                          color="textSecondary"
                                        >
                                          {bribe.token?.symbol}
                                        </Typography>
                                      </div>
                                    );
                                  }
                                })}
                              {row &&
                                row.rewardType === "Fees" &&
                                row.gauge &&
                                row.gauge.token0Earned &&
                                row.gauge.token1Earned && (
                                  <>
                                    <div className={classes.inlineEnd}>
                                      {/* <img
                                    className={classes.imgLogo}
                                    src={
                                      row.token0 && row.token0.logoURI
                                        ? row.token0.logoURI
                                        : ``
                                    }
                                    width="24"
                                    height="24"
                                    alt=""
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).onerror =
                                        null;
                                      (e.target as HTMLImageElement).src =
                                        "/tokens/unknown-logo.png";
                                    }}
                                  /> */}
                                      <Typography
                                        variant="h2"
                                        className={classes.textSpacedPadded}
                                      >
                                        {formatCurrency(row.gauge.token0Earned)}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={classes.textSpacedPadded}
                                        color="textSecondary"
                                      >
                                        {row.token0?.symbol}
                                      </Typography>
                                    </div>
                                    <div className={classes.inlineEnd}>
                                      {/* <img
                                    className={classes.imgLogo}
                                    src={
                                      row.token1 && row.token1.logoURI
                                        ? row.token1.logoURI
                                        : ``
                                    }
                                    width="24"
                                    height="24"
                                    alt=""
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).onerror =
                                        null;
                                      (e.target as HTMLImageElement).src =
                                        "/tokens/unknown-logo.png";
                                    }}
                                  /> */}
                                      <Typography
                                        variant="h2"
                                        className={classes.textSpacedPadded}
                                      >
                                        {formatCurrency(row.gauge.token1Earned)}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={classes.textSpacedPadded}
                                        color="textSecondary"
                                      >
                                        {row.token1?.symbol}
                                      </Typography>
                                    </div>
                                  </>
                                )}
                            </div>
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            {row && row.rewardType !== "Reward" && (
                              <Button
                                disabled={rowStates[row.id]}
                                onClick={() => {
                                  onClaimVote(row);
                                }}
                                style={{ color: "white" }}
                              >
                                Claim
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rewards.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </div>
    );
  } else if (type == "LP") {
    if (rewards.length === 0 && skeletonTimeout) {
      return (
        <Paper
          elevation={0}
          className={classes.tableContainer}
          style={{
            borderRadius: "15px",
          }}
        >
          <TableContainer>
            <Table
              aria-labelledby="tableTitle"
              size={"medium"}
              aria-label="enhanced table"
            >
              <EnhancedTableHead
                type={type}
                classes={classes}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                <TableRow>
                  <TableCell
                    className={classes.cell}
                    colSpan={5}
                    style={{ textAlign: "center" }}
                  >
                    {/* <Typography>Nothing to claim</Typography> */}
                    <Skeleton
                      variant="rectangular"
                      width={"100%"}
                      height={49}
                      className={classes.skelly}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rewards.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      );
    }
    return (
      <div className={classes.root}>
        <Paper
          elevation={0}
          className={classes.tableContainer}
          style={{
            borderRadius: "15px",
          }}
        >
          <TableContainer>
            <Table
              aria-labelledby="tableTitle"
              size={"medium"}
              aria-label="enhanced table"
            >
              <EnhancedTableHead
                type={type}
                classes={classes}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                {rewards.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className={classes.cell}
                      colSpan={5}
                      style={{ textAlign: "center" }}
                    >
                      <Typography>Nothing to claim</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  stableSort(rewards, getComparator(type, order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      if (!row) {
                        <TableRow>
                          <TableCell
                            className={classes.cell}
                            colSpan={5}
                            style={{ textAlign: "center" }}
                          >
                            {/* <Typography>Nothing to claim</Typography> */}
                            <Skeleton
                              variant="rectangular"
                              width={"100%"}
                              height={49}
                              className={classes.skelly}
                            />
                          </TableCell>
                        </TableRow>;
                      }
                      return (
                        <TableRow
                          key={"ssRewardsTable" + index}
                          className={classes.assetTableRow}
                        >
                          <TableCell className={classes.cell}>
                            {["Reward"].includes(row.rewardType) && (
                              <div className={classes.inline}>
                                <div className={classes.doubleImages}>
                                  <img
                                    className={classes.img1Logo}
                                    src={
                                      row && row.token0 && row.token0.logoURI
                                        ? row.token0.logoURI
                                        : ``
                                    }
                                    width="37"
                                    height="37"
                                    alt=""
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).onerror =
                                        null;
                                      (e.target as HTMLImageElement).src =
                                        "/tokens/unknown-logo.png";
                                    }}
                                  />
                                  <img
                                    className={classes.img2Logo}
                                    src={
                                      row && row.token1 && row.token1.logoURI
                                        ? row.token1.logoURI
                                        : ``
                                    }
                                    width="37"
                                    height="37"
                                    alt=""
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).onerror =
                                        null;
                                      (e.target as HTMLImageElement).src =
                                        "/tokens/unknown-logo.png";
                                    }}
                                  />
                                </div>
                                <div>
                                  <Typography
                                    variant="h2"
                                    noWrap
                                    className={classes.textSpaced}
                                  >
                                    {row?.symbol}
                                  </Typography>
                                  <Typography
                                    variant="h5"
                                    className={classes.textSpaced}
                                    color="textSecondary"
                                  >
                                    {row?.rewardType}
                                  </Typography>
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            <div>
                              {row &&
                                row.rewardType === "Reward" &&
                                row.gauge &&
                                row.gauge.balance &&
                                row.gauge.totalSupply && (
                                  <>
                                    <div className={classes.inlineEnd}>
                                      <Typography
                                        variant="h2"
                                        className={classes.textSpaced}
                                      >
                                        {formatCurrency(
                                          BigNumber(row.gauge.balance)
                                            .div(row.gauge.totalSupply)
                                            .times(row.gauge.reserve0)
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={`${classes.textSpaced} ${classes.symbol}`}
                                        color="textSecondary"
                                      >
                                        {row.token0.symbol}
                                      </Typography>
                                    </div>
                                    <div className={classes.inlineEnd}>
                                      <Typography
                                        variant="h5"
                                        className={classes.textSpaced}
                                      >
                                        {formatCurrency(
                                          BigNumber(row.gauge.balance)
                                            .div(row.gauge.totalSupply)
                                            .times(row.gauge.reserve1)
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={`${classes.textSpaced} ${classes.symbol}`}
                                        color="textSecondary"
                                      >
                                        {row.token1.symbol}
                                      </Typography>
                                    </div>
                                  </>
                                )}
                            </div>
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            <div>
                              {row && row.rewardType === "Reward" && (
                                <>
                                  <div className={classes.inlineEnd}>
                                    <Typography
                                      variant="h2"
                                      className={classes.textSpaced}
                                    >
                                      {formatCurrency(row.gauge.rewardsEarned)}
                                    </Typography>
                                    <Typography
                                      variant="h5"
                                      className={`${classes.textSpaced} ${classes.symbol}`}
                                      color="textSecondary"
                                    >
                                      EASY
                                    </Typography>
                                  </div>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            {row && row.rewardType === "Reward" && (
                              <Button
                                disabled={rowStates[row.id]}
                                onClick={() => {
                                  onClaimLP(row);
                                }}
                                style={{ color: "white" }}
                              >
                                Claim
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rewards.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </div>
    );
  } else if (type === "Dist") {
    if (rewards.length === 0 && skeletonTimeout) {
      return (
        <Paper
          elevation={0}
          className={classes.tableContainer}
          style={{
            borderRadius: "15px",
          }}
        >
          <TableContainer>
            <Table
              aria-labelledby="tableTitle"
              size={"medium"}
              aria-label="enhanced table"
            >
              <EnhancedTableHead
                type={type}
                classes={classes}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                <TableRow>
                  <TableCell
                    className={classes.cell}
                    colSpan={5}
                    style={{ textAlign: "center" }}
                  >
                    {/* <Typography>Nothing to claim</Typography> */}
                    <Skeleton
                      variant="rectangular"
                      width={"100%"}
                      height={49}
                      className={classes.skelly}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rewards.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      );
    }
    return (
      <div className={classes.root}>
        <Paper
          elevation={0}
          className={classes.tableContainer}
          style={{
            borderRadius: "15px",
          }}
        >
          <TableContainer>
            <Table
              aria-labelledby="tableTitle"
              size={"medium"}
              aria-label="enhanced table"
            >
              <EnhancedTableHead
                type={type}
                classes={classes}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                {rewards.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className={classes.cell}
                      colSpan={5}
                      style={{ textAlign: "center" }}
                    >
                      <Typography>Nothing to claim</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  stableSort(rewards, getComparator(type, order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      if (!row) {
                        return (
                          <TableRow>
                            <TableCell
                              className={classes.cell}
                              colSpan={5}
                              style={{ textAlign: "center" }}
                            >
                              <Typography>Nothing to claim</Typography>
                            </TableCell>
                          </TableRow>
                        );
                      }
                      return (
                        <TableRow
                          key={"ssRewardsTable" + index}
                          className={classes.assetTableRow}
                        >
                          <TableCell className={classes.cell}>
                            {["Distribution"].includes(row.rewardType) && (
                              <div className={classes.inline}>
                                <div className={classes.doubleImages}>
                                  <img
                                    className={classes.img1Logo}
                                    src={"/tokens/govToken-logo.png"}
                                    width="37"
                                    height="37"
                                    alt=""
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).onerror =
                                        null;
                                      (e.target as HTMLImageElement).src =
                                        "/tokens/unknown-logo.png";
                                    }}
                                  />
                                </div>
                                <div>
                                  <Typography
                                    variant="h2"
                                    noWrap
                                    className={classes.textSpaced}
                                  >
                                    {"Token #" + row?.token?.id}
                                  </Typography>
                                  <Typography
                                    variant="h5"
                                    className={classes.textSpaced}
                                    color="textSecondary"
                                  >
                                    {row?.rewardType}
                                  </Typography>
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            <div>
                              {row && row.rewardType === "Distribution" && (
                                <>
                                  <div className={classes.inlineEnd}>
                                    <Typography
                                      variant="h5"
                                      className={classes.textSpaced}
                                    >
                                      {formatCurrency(row.token?.lockValue)}
                                    </Typography>
                                    <Typography
                                      variant="h5"
                                      className={`${classes.textSpaced} ${classes.symbol}`}
                                      color="textSecondary"
                                    >
                                      {row.lockToken.symbol}
                                    </Typography>
                                  </div>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            <div>
                              {row && row.rewardType === "Distribution" && (
                                <>
                                  <div className={classes.inlineEnd}>
                                    <Typography
                                      variant="h5"
                                      className={classes.textSpaced}
                                    >
                                      {formatCurrency(row.earned)}
                                    </Typography>
                                    <Typography
                                      variant="h5"
                                      className={`${classes.textSpaced} ${classes.symbol}`}
                                      color="textSecondary"
                                    >
                                      {row.rewardToken.symbol}
                                    </Typography>
                                  </div>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            {row && row.rewardType !== "Reward" && (
                              <Button
                                disabled={rowStates[row.id]}
                                onClick={() => {
                                  onClaimDist(row);
                                }}
                                style={{ color: "white" }}
                              >
                                Claim
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rewards.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </div>
    );
  }
}

function descendingComparator(type, a, b, orderBy) {
  if (!a || !b) {
    return 0;
  }
  let aAmount = 0;
  let bAmount = 0;
  if (type === "vote") {
    switch (orderBy) {
      case "reward":
        if (b.rewardType < a.rewardType) {
          return -1;
        }
        if (b.rewardType > a.rewardType) {
          return 1;
        }
        if (b.symbol < a.symbol) {
          return -1;
        }
        if (b.symbol > a.symbol) {
          return 1;
        }
        return 0;

      case "balance":
        if (a.rewardType === "Bribe") {
          aAmount = a.gauge.balance;
        } else {
          aAmount = a.balance;
        }

        if (b.rewardType === "Bribe") {
          bAmount = b.gauge.balance;
        } else {
          bAmount = b.balance;
        }

        if (BigNumber(bAmount).lt(aAmount)) {
          return -1;
        }
        if (BigNumber(bAmount).gt(aAmount)) {
          return 1;
        }
        return 0;

      case "earned":
        if (a.rewardType === "Bribe") {
          aAmount = a.gauge.bribes.length;
        } else {
          aAmount = 2;
        }

        if (b.rewardType === "Bribe") {
          bAmount = b.gauge.bribes.length;
        } else {
          bAmount = 2;
        }

        if (BigNumber(bAmount).lt(aAmount)) {
          return -1;
        }
        if (BigNumber(bAmount).gt(aAmount)) {
          return 1;
        }
        return 0;

      default:
        return 0;
    }
  } else if (type === "LP") {
    switch (orderBy) {
      case "reward":
        if (b.symbol < a.symbol) {
          return -1;
        }
        if (b.symbol > a.symbol) {
          return 1;
        }
        return 0;

      case "balance":
        if (a.rewardType === "Reward") {
          aAmount = BigNumber(a.gauge.balance)
            .div(a.gauge.totalSupply)
            .times(a.gauge.reserve0)
            .toNumber();
        } else {
          aAmount = a.balance;
        }

        if (b.rewardType === "Reward") {
          bAmount = BigNumber(a.gauge.balance)
            .div(a.gauge.totalSupply)
            .times(a.gauge.reserve0)
            .toNumber();
        } else {
          bAmount = b.balance;
        }

        if (BigNumber(bAmount).lt(aAmount)) {
          return -1;
        }
        if (BigNumber(bAmount).gt(aAmount)) {
          return 1;
        }
        return 0;

      case "earned":
        if (a.rewardType === "Reward") {
          aAmount = a.gauge.rewardsEarned;
        } else {
          aAmount = 2;
        }

        if (b.rewardType === "Reward") {
          bAmount = b.gauge.rewardsEarned;
        } else {
          bAmount = 2;
        }

        if (BigNumber(bAmount).lt(aAmount)) {
          return -1;
        }
        if (BigNumber(bAmount).gt(aAmount)) {
          return 1;
        }
        return 0;

      default:
        return 0;
    }
  } else if (type === "Dist") {
    switch (orderBy) {
      case "reward":
        if (b.token.id < a.token.id) {
          return -1;
        }
        if (b.id > a.id) {
          return 1;
        }
        return 0;

      case "balance":
        if (a.rewardType === "Distribution") {
          aAmount = a.token.lockValue;
        }

        if (b.rewardType === "Distribution") {
          bAmount = b.token.lockValue;
        }

        if (BigNumber(bAmount).lt(aAmount)) {
          return -1;
        }
        if (BigNumber(bAmount).gt(aAmount)) {
          return 1;
        }
        return 0;

      case "earned":
        if (a.rewardType === "Distribution") {
          aAmount = a.earned;
        } else {
          aAmount = 2;
        }

        if (b.rewardType === "Distribution") {
          bAmount = b.earned;
        } else {
          bAmount = 2;
        }

        if (BigNumber(bAmount).lt(aAmount)) {
          return -1;
        }
        if (BigNumber(bAmount).gt(aAmount)) {
          return 1;
        }
        return 0;

      default:
        return 0;
    }
  } else {
    switch (orderBy) {
      case "token":
        if (b.token.id < a.token.id) {
          return -1;
        }
        if (b.token.id > a.token.id) {
          return 1;
        }
        return 0;

      case "balance":
        if (a.rewardType === "Bribe") {
          aAmount = a.gauge.balance;
        } else {
          aAmount = a.balance;
        }

        if (b.rewardType === "Bribe") {
          bAmount = b.gauge.balance;
        } else {
          bAmount = b.balance;
        }

        if (BigNumber(bAmount).lt(aAmount)) {
          return -1;
        }
        if (BigNumber(bAmount).gt(aAmount)) {
          return 1;
        }
        return 0;

      case "earned":
        if (a.rewardType === "Bribe") {
          aAmount = a.gauge.bribes.length;
        } else {
          aAmount = 2;
        }

        if (b.rewardType === "Bribe") {
          bAmount = b.gauge.bribes.length;
        } else {
          bAmount = 2;
        }

        if (BigNumber(bAmount).lt(aAmount)) {
          return -1;
        }
        if (BigNumber(bAmount).gt(aAmount)) {
          return 1;
        }
        return 0;

      default:
        return 0;
    }
  }
}

function getComparator(type, order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(type, a, b, orderBy)
    : (a, b) => -descendingComparator(type, a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}
