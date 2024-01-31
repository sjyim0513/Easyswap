import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import Skeleton from "@mui/lab/Skeleton";
import {
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  InputAdornment,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Typography,
  Tooltip,
  Toolbar,
  Grid,
} from "@mui/material";
import { useRouter } from "next/router";
import { EnhancedEncryptionOutlined, ArrowForward } from "@mui/icons-material";
import moment from "moment";

import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";
import TransactionQueue from "../transactionQueue/transactionQueue";
import Unlock from "../unlock/unlockModal";
import { formatAddress } from "../../utils/utils";
import classes2 from "./ssVests.module.css";
import { MyConnectWallet } from "../MyConnectWallet";
import { switchChain } from "../header/header";
import { formatCurrency } from "../../utils/utils";

function descendingComparator(a, b, orderBy) {
  if (!a || !b) {
    return 0;
  }

  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
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

const headCells = [
  { id: "NFT", numeric: false, disablePadding: false, label: "Pair" },
  {
    id: "Locked Amount",
    numeric: true,
    disablePadding: false,
    label: "Vest Amount",
  },
  {
    id: "Lock Value",
    numeric: true,
    disablePadding: false,
    label: "Vest Value",
  },
  {
    id: "Lock Expires",
    numeric: true,
    disablePadding: false,
    label: "Vest Expires",
  },
  {
    id: "",
    numeric: true,
    disablePadding: false,
    label: "Actions",
  },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

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
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    // @ts-expect-error material ui theme is not typed by default
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
  icon: {
    marginRight: "12px",
  },
  textSpaced: {
    lineHeight: "1.5",
    fontWeight: "200",
    fontSize: "14px",
  },
  headerText: {
    fontWeight: "600",
    fontSize: "14px",
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
  skelly: {
    marginBottom: "12px",
    marginTop: "12px",
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
  img1Logo: {
    position: "absolute",
    left: "0px",
    top: "0px",
    borderRadius: "30px",
  },
  img2Logo: {
    position: "absolute",
    left: "20px",
    zIndex: "1",
    top: "0px",
  },
  overrideTableHead: {
    borderBottom: "1px solid rgba(104,108,122,0.2) !important",
  },
  doubleImages: {
    display: "flex",
    position: "relative",
    width: "70px",
    height: "35px",
  },
  buttonOverride: {
    color: "#FFF",
    background: "#FF9A5F",
    "&:hover": {
      background: "#E38148 !important",
    },
    borderRadius: "30px",
  },
  toolbar: {
    margin: "24px 0px",
    padding: "0px",
  },
  tableContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    boxShadow:
      "0 0 6px rgb(0 0 0/4%), 0 14px 20px rgb(0 0 0/1%), 0 20px 28px rgb(0 0 0/1%)",
  },
  actionButtonText: {
    fontSize: "16px",
    color: "#FFF",
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useStyles();
  const router = useRouter();

  const [search, setSearch] = useState("");

  const onSearchChanged = (event) => {
    setSearch(event.target.value);
  };

  const onCreate = () => {
    router.push(`/vest/create?id=create`);
  };

  return (
    <Toolbar className={classes.toolbar}>
      <Grid container spacing={1}>
        <Grid lg="auto" md={12} sm={12} xs={12} item>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<EnhancedEncryptionOutlined />}
            size="large"
            className={classes.buttonOverride}
            onClick={onCreate}
            disabled={props.props}
          >
            <Typography className={classes.actionButtonText}>
              Create Lock
            </Typography>
          </Button>
        </Grid>
        <Grid item lg={true} md={true} sm={false} xs={false}></Grid>
      </Grid>
    </Toolbar>
  );
};

export default function EnhancedTable({ vestNFTs, govToken, veToken }) {
  const classes = useStyles();
  const router = useRouter();
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("balance");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const accountStore = stores.accountStore.getStore("account");
  const chainInvalid = stores.accountStore.getStore("chainInvalid");
  const [account, setAccount] = useState(accountStore);
  const [isChainInvaild, setIsChainInvaild] = useState(chainInvalid);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [transactionQueueLength, setTransactionQueueLength] = useState(0);
  const { CONNECT_WALLET, ACCOUNT_CONFIGURED } = ACTIONS;
  const [isMainnet, setIsMainnet] = useState(true);

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
    const chainId = stores.accountStore.getStore("chainId");

    if (chainId === 169) {
      setIsMainnet(true);
    } else {
      setIsMainnet(false);
    }

    const accountConfigure = () => {
      const accountStore = stores.accountStore.getStore("account");
      const chainInvalid = stores.accountStore.getStore("chainInvalid");
      setAccount(accountStore);
      setIsChainInvaild(chainInvalid);
      const chainId = stores.accountStore.getStore("chainId");

      if (chainId === 169) {
        setIsMainnet(true);
      } else {
        setIsMainnet(false);
      }
      closeUnlock();
    };
    const connectWallet = () => {
      const chainId = stores.accountStore.getStore("chainId");

      if (chainId === 169) {
        setIsMainnet(true);
      } else {
        setIsMainnet(false);
      }
      onAddressClicked();
    };

    stores.emitter.on(ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(CONNECT_WALLET, connectWallet);
    return () => {
      stores.emitter.removeListener(ACCOUNT_CONFIGURED, accountConfigure);
      stores.emitter.removeListener(CONNECT_WALLET, connectWallet);
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

  if (!vestNFTs) {
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

  const onView = (nft) => {
    router.push(`/vest/create?id=${nft.id}`);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, vestNFTs.length - page * rowsPerPage);

  if (!account.address) {
    return (
      <div className={classes.root}>
        <EnhancedTableToolbar props={isMainnet} />
        <Paper
          elevation={0}
          className={classes.tableContainer}
          style={{
            display: "flex",
            justifyContent: "center",
            borderRadius: "10px",
            boxShadow:
              "0 0 6px rgb(0 0 0/4%), 0 14px 20px rgb(0 0 0/1%), 0 20px 28px rgb(0 0 0/1%)",
            height: "400px",
            alignItems: "center",
          }}
        >
          {/* <Button
            disableElevation
            className={classes2.accountButton}
            variant="contained"
            onClick={onAddressClicked}
            style={{ color: "black", boxSizing: "content-box", backgroundColor: "rgb(255, 174, 128)" }}
          >
            <Typography className={classes2.headBtnTxt}>
              {account && account.address
                ? formatAddress(account.address)
                : "Connect Wallet"}

            </Typography>
          </Button> */}
          {<MyConnectWallet onClick={onAddressClicked} />}
          {unlockOpen && (
            <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />
          )}
          <TransactionQueue setQueueLength={setQueueLength} />
        </Paper>
      </div>
    );
  } else if (isChainInvaild) {
    return (
      <div className={classes.root}>
        <EnhancedTableToolbar props={isMainnet} />
        <Paper
          elevation={0}
          className={classes.tableContainer}
          style={{
            display: "flex",
            justifyContent: "center",
            borderRadius: "10px",
            boxShadow:
              "0 0 6px rgb(0 0 0/4%), 0 14px 20px rgb(0 0 0/1%), 0 20px 28px rgb(0 0 0/1%)",
            height: "400px",
            alignItems: "center",
          }}
        >
          <Button
            disableElevation
            className={classes2.accountButton}
            variant="contained"
            onClick={switchChain}
            style={{ color: "black", boxSizing: "content-box" }}
          >
            <Typography className={classes2.headBtnTxt}>
              Switch Network
            </Typography>
          </Button>
          {unlockOpen && (
            <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />
          )}
          <TransactionQueue setQueueLength={setQueueLength} />
        </Paper>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <EnhancedTableToolbar props={isMainnet} />
      <Paper
        elevation={0}
        className={classes.tableContainer}
        style={{ borderRadius: "10px" }}
      >
        <TableContainer>
          <Table
            aria-labelledby="tableTitle"
            size={"medium"}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(vestNFTs, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  if (!row) {
                    return null;
                  }
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      key={labelId}
                      className={`${classes2.assetTableRow}`}
                      onClick={() => {
                        onView(row);
                      }}
                    >
                      <TableCell className={classes.cell}>
                        <div className={classes.inline}>
                          <div className={classes.doubleImages}>
                            <img
                              className={classes.img1Logo}
                              src={govToken?.logoURI}
                              width="35"
                              height="35"
                              alt=""
                              onError={(e) => {
                                (e.target as HTMLImageElement).onerror = null;
                                (e.target as HTMLImageElement).src =
                                  "/tokens/unknown-logo.png";
                              }}
                            />
                          </div>
                          <div>
                            <Typography
                              variant="h2"
                              className={classes.textSpaced}
                            >
                              {row.id}
                            </Typography>
                            <Typography
                              variant="h5"
                              className={classes.textSpaced}
                              color="textSecondary"
                            >
                              NFT ID
                            </Typography>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={classes.cell} align="right">
                        <Typography variant="h2" className={classes.textSpaced}>
                          {formatCurrency(row.lockAmount)}
                        </Typography>
                        <Typography
                          variant="h5"
                          className={classes.textSpaced}
                          color="textSecondary"
                        >
                          {govToken?.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell className={classes.cell} align="right">
                        <Typography variant="h2" className={classes.textSpaced}>
                          {formatCurrency(row.lockValue)}
                        </Typography>
                        <Typography
                          variant="h5"
                          className={classes.textSpaced}
                          color="textSecondary"
                        >
                          {veToken?.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell className={classes.cell} align="right">
                        <Typography variant="h2" className={classes.textSpaced}>
                          {moment.unix(row.lockEnds).format("YYYY-MM-DD")}
                        </Typography>
                        <Typography
                          variant="h5"
                          className={classes.textSpaced}
                          color="textSecondary"
                        >
                          Expires {moment.unix(row.lockEnds).fromNow()}
                        </Typography>
                      </TableCell>
                      <TableCell className={classes.cell} align="right">
                        <Button
                          onClick={() => {
                            onView(row);
                          }}
                          style={{ padding: "7px 0px", minWidth: "40px" }}
                        >
                          <ArrowForward style={{ color: "white" }} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={vestNFTs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
