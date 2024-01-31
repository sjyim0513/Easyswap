import { useState, useEffect, useMemo, Fragment } from "react";
import { makeStyles } from "@mui/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import InputAdornment from "@mui/material/InputAdornment";
import { useRouter } from "next/router";
import Grid from "@mui/material/Grid";
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Typography,
  Slider,
  TextField,
  colors,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import BigNumber from "bignumber.js";

import { formatCurrency } from "../../utils/utils";
import { Pair, Vote, VestNFT } from "../../stores/types/types";
import { ArrowRight, BorderColor, BorderRight } from "@mui/icons-material";

import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";
import TransactionQueue from "../transactionQueue/transactionQueue";
import Unlock from "../unlock/unlockModal";
import { formatAddress } from "../../utils/utils";
import classes2 from "./ssVotes.module.css";
import { MyConnectWallet } from "../MyConnectWallet";
import { switchChain } from "../header/header";

const MAX_SLIDER_VALUE = 100;

const headCells = [
  { id: "asset", numeric: false, disablePadding: false, label: "Asset" },
  // {
  //   id: "balance",
  //   numeric: true,
  //   disablePadding: false,
  //   label: "My Stake",
  // },
  // {
  //   id: "liquidity",
  //   numeric: true,
  //   disablePadding: false,
  //   label: "Total Liquidity",
  // },
  {
    id: "total_rewards",
    numeric: true,
    disablePadding: false,
    label: "Total Rewards",
  },
  {
    id: "votes_apr",
    numeric: true,
    disablePadding: false,
    label: "Voting APR",
  },

  // {
  //   id: "totalVotes",
  //   numeric: true,
  //   disablePadding: false,
  //   label: "Total Votes",
  // },
  // {
  //   id: "apy",
  //   numeric: true,
  //   disablePadding: false,
  //   label: "Bribes",
  // },
  {
    id: "myVotes",
    numeric: true,
    disablePadding: false,
    label: "My Votes",
  },
  {
    id: "actions",
    numeric: true,
    disablePadding: false,
    label: "Actions",
  },
  // {
  //   id: "mvp",
  //   numeric: true,
  //   disablePadding: false,
  //   label: "My Vote %",
  // },
] as const;

type OrderBy = (typeof headCells)[number]["id"];

function EnhancedTableHead(props: {
  classes: ReturnType<typeof useStyles>;
  order: "asc" | "desc";
  orderBy: OrderBy;
  onRequestSort: (event: any, property: OrderBy) => void;
}) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: OrderBy) => (event) => {
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
            style={{
              textAlign: headCell.id === "actions" ? "center" : "right",
              backgroundColor: "transparent",
            }}
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

const useStyles = makeStyles((theme) => ({
  switchRoot: {
    "&.Mui-checked": {
      color: "rgba(255, 174, 128, 0.6)", // 토글된 상태의 스위치 색상 (초록색)
    },
    "&.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "rgba(255, 174, 128, 0.5)", // 토글된 상태의 트랙 색상 (초록색)
    },
  },
  sliderMobile: {
    "@media (max-width: 900px)": {
      marginRight: "0rem !important",
      marginLeft: "1rem",
    },
  },
  PagmenuItem: {
    "&:hover": {
      backgroundColor: "rgb(45, 45, 45)",
    },
  },

  selectDropdown: {
    color: "#fff",
    backgroundColor: "rgb(27, 27, 27)",
  },

  tablePaginationSelectIcon: {
    color: "white",
  },

  root: {
    width: "100%",
  },
  assetTableRow: {
    "&:hover": {
      background: "rgb(32, 32, 32)",
    },
    background: "rgb(27, 27, 27)",
  },
  paper: {
    width: "100%",
    //@ts-expect-error we dont have proper type for DefaultTheme
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
    width: "100%",
    justifyContent: "space-between",
    "@media (max-width: 1250px)": {
      flexDirection: "column",
    },
  },
  inlineEnd: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    "@media (max-width: 1250px)": {
      display: "block",
    },
  },
  icon: {
    marginRight: "12px",
  },
  textSpaced: {
    lineHeight: "1.5",
    fontWeight: "500",
    fontSize: "16px",
    textAlign: "center",
    "@media (max-width: 450px)": {
      fontSize: "14px",
    },
  },
  textSpacedOrange: {
    lineHeight: "1.5",
    fontWeight: "500",
    fontSize: "16px",
    color: "#E07334",
    textAlign: "center",
  },
  headerText: {
    fontWeight: "200",
    fontSize: "12px",
  },
  tableHeader: {
    border: "2px solid #FF9A5F",
    background: "linear-gradient(155deg, #FCB993 15.8%, #FF9A5F 46.58%)",
    padding: "0.5rem 3rem",
    borderRadius: "12px 12px 0 0",
  },
  tableBody: {
    background: "#FFE0CF",
    borderRadius: "0 0 14px 14px",
    display: "flex",
    height: "-webkit-fill-available",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem 3rem",
    "@media (max-width: 480px)": {
      padding: "1rem",
    },
  },
  tableCell: {
    padding: "0",
    margin: "0 0.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  cell: { minWidth: "10%" },
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
  summaryTitle: {
    "@media (max-width: 1000px)": {
      display: "block !important",
    },
  },
  makeMinWidth100: {
    "@media (max-width: 1250px)": {
      minWidth: "0% !important",
      gap: "4rem",
    },
    "@media (max-width: 480px)": {
      minWidth: "0% !important",
      gap: "1.5rem",
      // flexDirection: "column !important",
    },
  },
  summarycontent: {
    minWidth: "70%",
    "@media (max-width: 1250px)": {
      width: "fit-content !important",
      justifyContent: "center !important",
      gap: "4rem",
    },
    "@media (max-width: 480px)": {
      minWidth: "0% !important",
      gap: "1.5rem",
      alignItems: "flex-start !important",
    },
  },
  summarycontentMobile: {
    "@media (max-width: 1250px)": {
      display: "block !important",
    },
  },
  createBribeButton: {
    cursor: "pointer",
    border: "2px solid #FF9A5F",
    background: "linear-gradient(155deg, #FCB993 15.8%, #FF9A5F 46.58%)",
    padding: "1rem",
    borderRadius: "12px",
    "@media (max-width: 1000px)": {
      height: "100%",
      display: "flex",
    },
  },
  detailsTitle: {
    lineHeight: "1.5",
    fontSize: "14px",
    fontWeight: "500",
    color: "white",
    display: "flex",
    justifyContent: "center",
  },
  detailsContent: {
    lineHeight: "1.5",
    fontSize: "18px",
    fontWeight: "500",
    color: "rgb(0, 0, 0)",
    margin: "2px",
  },
  paddingRemovedMobile: {
    "@media (max-width: 450px)": {
      padding: "1rem 0.5rem !important",
    },
  },
  skelly: {
    marginBottom: "12px",
    marginTop: "12px",
    borderRadius: "8px",
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
  accountButton: {
    marginRight: "10px",
    fontWeight: 500,
    lineHeight: "20px",
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    height: "50px",
    marginLeft: "14px",
    paddingLeft: "26px",
    paddingRight: "26px",
    fontSize: "1.3vw",
    background: "transparent",
    borderRadius: "90px",
    filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.1))",
    color: "#FFF",
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
    width: "30px",
    borderRadius: "30px",
    background: "rgb(25, 33, 56)",
  },
  img2Logo: {
    width: "30px",
    borderRadius: "30px",
    background: "rgb(25, 33, 56)",
  },
  makeFlextoGridMobile: {
    "@media (max-width: 1000px)": {
      display: "grid !important",
      gap: "0.5rem",
    },
  },
  marginRemovedMobile: {
    "@media (max-width: 1000px)": {
      margin: "0px !important",
    },
  },
  overrideTableHead: {
    borderBottom: "1px solid rgba(126,153,176,0.01) !important",
    "@media (max-width: 1250px)": {
      display: "none",
    },
  },
  doubleImages: {
    display: "flex",
    position: "relative",
    flexDirection: "column",

    "@media (max-width: 1250px)": {
      marginBottom: "2rem",
    },
    "@media (max-width: 900px)": {
      width: "auto",
      gap: "1rem",
    },
  },
  searchContainer: {
    flex: 1,
    display: "flex",
    width: "100%",
    height: "100%",
    background: "transparent",
    border: "1px solid rgba(0,0,0,0.3)",
    borderRadius: "10px",
  },
  buttonOverride: {
    width: "100%",
    color: "#000",
    background: "transparent",
    fontWeight: "700",
    "&:hover": {
      background: "#877e7e",
    },
    border: "1px solid rgba(0, 0, 0, 0.25)",
    filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
    borderRadius: "10px",
    boxShadow: "none",
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
    background: "#FFF8F3",
  },
  filterButton: {
    background: "transparent",
    border: "1px solid rgba(0, 0, 0, 0.25)",
    color: "#000",
    width: "100%",
    height: "94.5%",
    borderRadius: "10px",
  },
  actionButtonText: {
    fontSize: "15px",
    fontWeight: "700",
  },
  filterContainer: {
    background: "#ffffff",
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
    fontSize: "15px",
  },
  filterListTitle: {
    marginBottom: "10px",
    paddingBottom: "20px",
    borderBottom: "1px solid rgba(126,153,176,0.2)",
  },
  infoIcon: {
    color: "#FFF",
    fontSize: "16px",
    marginLeft: "10px",
  },
  symbol: {
    minWidth: "40px",
  },
  hiddenMobile: {
    "@media (max-width: 1000px)": {
      display: "none",
    },
  },
  hiddenSmallMobile: {
    "@media (max-width: 600px)": {
      display: "none",
    },
  },
  labelAdd: {
    display: "none",
    fontSize: "14px",
    "@media (max-width: 1250px)": {
      display: "block",
    },
  },
  textField: {
    width: "66px",
  },
}));

export default function EnhancedTable({
  gauges,
  setParentSliderValues,
  defaultVotes,
  token,
}: {
  gauges: Pair[];
  setParentSliderValues: React.Dispatch<
    React.SetStateAction<
      (Pick<Vote, "address"> & {
        value: number;
      })[]
    >
  >;
  defaultVotes: Array<Pick<Vote, "address"> & { value: number }>;
  token: VestNFT;
}) {
  const classes = useStyles();
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<OrderBy>("total_rewards");
  const [sliderValues, setSliderValues] = useState(defaultVotes);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [inputValue, setInputValue] = useState(50);

  const [shouldShow, setShouldShow] = useState(window.innerWidth >= 1000);
  const accountStore = stores.accountStore.getStore("account");
  const chainInvalid = stores.accountStore.getStore("chainInvalid");
  const [account, setAccount] = useState(accountStore);
  const [isChainInvaild, setIsChainInvaild] = useState(chainInvalid);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [transactionQueueLength, setTransactionQueueLength] = useState(0);
  const { CONNECT_WALLET, ACCOUNT_CONFIGURED } = ACTIONS;
  const [totalSliderValuesSum, setTotalSliderValuesSum] = useState(0);

  const router = useRouter();

  const [expanded, setExpanded] = useState(null);

  const [showAll, setShowAll] = useState(false);
  const maxItemsToShow = 2;

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

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
    const handleResize = () => {
      const newWindowWidth = window.innerWidth;
      setShouldShow(newWindowWidth >= 1250);
    };
    const accountConfigure = () => {
      const accountStore = stores.accountStore.getStore("account");
      const chainInvalid = stores.accountStore.getStore("chainInvalid");
      setAccount(accountStore);
      setIsChainInvaild(chainInvalid);
      closeUnlock();
    };
    const connectWallet = () => {
      onAddressClicked();
    };

    window.addEventListener("resize", handleResize);
    stores.emitter.on(ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(CONNECT_WALLET, connectWallet);
    return () => {
      window.removeEventListener("resize", handleResize);
      stores.emitter.removeListener(ACCOUNT_CONFIGURED, accountConfigure);
      stores.emitter.removeListener(CONNECT_WALLET, connectWallet);
    };
  }, []);

  useEffect(() => {
    setSliderValues(defaultVotes);
  }, [defaultVotes]);

  const theme = createTheme({
    palette: {
      warning: {
        main: "#7E999F",
      },
      error: {
        main: "#FFF",
      },
    },
  });

  const handleInputChange = (event, value, asset) => {
    const newValue = parseFloat(value);

    if (isNaN(newValue)) {
      return;
    }

    let newSliderValues = [...sliderValues];

    newSliderValues = newSliderValues.map((val) => {
      if (asset?.address === val.address) {
        val.value = parseInt(value);
      }

      return val;
    });

    const newTotalSliderValuesSum = newSliderValues.reduce(
      (sum, val) => sum + val.value,
      0
    );

    setParentSliderValues(newSliderValues);
    setTotalSliderValuesSum(newTotalSliderValuesSum);
  };

  const onSliderChange = (event, value, asset) => {
    let newSliderValues = [...sliderValues];

    newSliderValues = newSliderValues.map((val) => {
      if (asset?.address === val.address) {
        val.value = value;
      }
      return val;
    });

    const newTotalSliderValuesSum = newSliderValues.reduce(
      (sum, val) => sum + val.value,
      0
    );
    setParentSliderValues(newSliderValues);
    setTotalSliderValuesSum(newTotalSliderValuesSum);
  };

  const toggleShowAll = () => {
    setShowAll((prevShowAll) => !prevShowAll);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const moreIcon = (
    <svg
      width="12"
      height="7"
      viewBox="0 0 12 7"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0.97168 1L6.20532 6L11.439 1" stroke="#000"></path>
    </svg>
  );

  const lessIcon = (
    <svg
      width="12"
      height="7"
      viewBox="0 0 12 7"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0.97168 6L6.20532 1L11.439 6" stroke="#000"></path>
    </svg>
  );

  const CheckBribeAmount = (bribes) => {
    if (!bribes) return false;

    const hasRewardAmount = bribes.some((bribe) => bribe.rewardAmount);

    if (hasRewardAmount) {
      return true;
    } else {
      return false;
    }
  };

  if (!gauges) {
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

  // const renderTooltip = (pair) => {
  //   return (
  //     <div className={classes.tooltipContainer}>
  //       {pair?.gauge?.bribes.map((bribe, idx) => {
  //         let earned = 0;
  //         if (pair.gauge.bribesEarned && pair.gauge.bribesEarned.length > idx) {
  //           earned = pair.gauge.bribesEarned[idx].earned;
  //         }

  //         return (
  //           <div className={classes.inlineBetween} key={bribe.token.symbol}>
  //             <Typography>Bribe:</Typography>
  //             <Typography>
  //               {formatCurrency(bribe.rewardAmount)} {bribe.token.symbol}
  //             </Typography>
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, gauges.length - page * rowsPerPage);
  const marks = [
    {
      value: -100,
      label: "-100",
    },
    {
      value: 0,
      label: "0",
    },
    {
      value: 100,
      label: "100",
    },
  ];

  const sortedGauges = useMemo(
    () =>
      stableSort(gauges, getComparator(order, orderBy, defaultVotes)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [gauges, order, orderBy, page, rowsPerPage, defaultVotes]
  );

  // if (!account.address) {
  //   return (
  //     <div
  //       className={classes.root}
  //     >
  //       <Paper
  //         elevation={0}
  //         className={classes.tableContainer}
  //         style={{
  //           display: 'flex',
  //           justifyContent: 'center',
  //           borderRadius: "10px",
  //           boxShadow: "0 0 6px rgb(0 0 0/4%), 0 14px 20px rgb(0 0 0/1%), 0 20px 28px rgb(0 0 0/1%)",
  //           height: "400px",
  //           alignItems: "center",
  //         }}
  //       >
  //         <Button
  //           disableElevation
  //           className={classes2.accountButton}
  //           style={{ backgroundColor: "rgb(255, 174, 128)", color: "black", boxSizing: "content-box" }}
  //           variant="contained"
  //           onClick={onAddressClicked}
  //         >
  //           <Typography className={classes2.headBtnTxt}>
  //             {account && account.address
  //               ? formatAddress(account.address)
  //               : "Connect Wallet"}

  //           </Typography>
  //         </Button>
  //         {unlockOpen && (
  //           <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />
  //         )}
  //         <TransactionQueue setQueueLength={setQueueLength} />
  //       </Paper>
  //     </div>
  //   );
  // }
  return (
    <div className={classes.root} style={{}}>
      {/* <TransactionQueue setQueueLength={setQueueLength} /> */}
      <Paper
        elevation={0}
        className={classes.tableContainer}
        style={{ borderRadius: "10px", boxShadow: "none" }}
      >
        <TableContainer
          style={{
            borderRadius: "10px",
            width: "100%",
          }}
        >
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
              {sortedGauges.map((row, index) => {
                if (!row) {
                  return null;
                }
                let sliderValue = sliderValues.find(
                  (el) => el.address === row?.address
                )?.value;
                if (sliderValue) {
                  sliderValue = BigNumber(sliderValue).toNumber();
                } else {
                  sliderValue = 0;
                }

                const handleTextFieldClick = (e) => {
                  e.stopPropagation();

                  e.target.value = "";
                };

                const bribesToDisplay = showAll
                  ? row.gauge.bribes.filter((bribe) => bribe.rewardAmount !== 0)
                  : row.gauge.bribes
                      .filter((bribe) => bribe.rewardAmount !== 0)
                      .slice(0, maxItemsToShow);

                return (
                  <Fragment key={index}>
                    <TableRow key={row?.gauge?.address}>
                      <TableCell
                        colSpan={8}
                        style={{
                          width: "100%",
                          backgroundColor: "transparent",
                          padding: "10px",
                        }}
                      >
                        <Accordion
                          expanded={expanded === `panel${index}`}
                          onChange={handleChange(`panel${index}`)}
                          style={{
                            width: "100%",
                            boxShadow:
                              "0 0 6px rgb(0 0 0/4%), 0 14px 20px rgb(0 0 0/1%), 0 20px 28px rgb(0 0 0/1%)",
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                          }}
                        >
                          <AccordionSummary
                            style={{ padding: "1rem", borderRadius: "10px" }}
                            className={`${classes.paddingRemovedMobile} ${classes2.accordionSummary}`}
                          >
                            <div className={classes.inline}>
                              <div className={classes.doubleImages}>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "1rem",
                                    padding: "1rem 0",
                                  }}
                                >
                                  <div style={{ display: "flex" }}>
                                    <div>
                                      <img
                                        className={classes.img1Logo}
                                        src={
                                          row &&
                                          row.token0 &&
                                          row.token0.logoURI
                                            ? row.token0.logoURI
                                            : ``
                                        }
                                        width="30"
                                        height="30"
                                        alt=""
                                        onError={(e) => {
                                          (
                                            e.target as HTMLImageElement
                                          ).onerror = null;
                                          (e.target as HTMLImageElement).src =
                                            "/tokens/unknown-logo.png";
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <img
                                        className={classes.img2Logo}
                                        src={
                                          row &&
                                          row.token1 &&
                                          row.token1.logoURI
                                            ? row.token1.logoURI
                                            : ``
                                        }
                                        width="30"
                                        height="30"
                                        alt=""
                                        onError={(e) => {
                                          (
                                            e.target as HTMLImageElement
                                          ).onerror = null;
                                          (e.target as HTMLImageElement).src =
                                            "/tokens/unknown-logo.png";
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      marginBottom: "1rem",
                                    }}
                                    className={classes.summaryTitle}
                                  >
                                    <Typography
                                      variant="h2"
                                      className={classes.textSpaced}
                                      style={{ fontWeight: "500" }}
                                    >
                                      {row?.symbol}
                                    </Typography>
                                    <div
                                      style={{
                                        backgroundColor: row?.stable
                                          ? "#51A1FF"
                                          : "#ff9a5f",
                                        borderRadius: "14px",
                                        boxSizing: "border-box",
                                        width: "fit-content",
                                        marginLeft: "6px",
                                        padding: "1px 5px",
                                      }}
                                    >
                                      <Typography
                                        variant="h2"
                                        className={classes.headerText}
                                        style={{ color: "white" }}
                                      >
                                        {row?.stable ? "Stable" : "Volatile"}
                                      </Typography>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: "1.5rem" }}>
                                  <div>
                                    {!shouldShow && (
                                      <div style={{ margin: "1rem 0" }}>
                                        <Typography
                                          style={{
                                            fontWeight: "600",
                                            fontSize: "18px",
                                          }}
                                        >
                                          Assets
                                        </Typography>
                                      </div>
                                    )}
                                    <div
                                      style={{ display: "grid", gap: "1rem" }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                        className={classes.makeFlextoGridMobile}
                                      >
                                        <Typography
                                          style={{
                                            color: "rgb(148, 163, 184)",
                                            fontSize: "12px",
                                            marginRight: "0.5rem",
                                          }}
                                        >
                                          Votes
                                        </Typography>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Typography
                                            variant="h2"
                                            className={classes.textSpaced}
                                          >
                                            {formatCurrency(row?.gauge?.weight)}
                                          </Typography>
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <ArrowRight />
                                            <div>
                                              <Typography
                                                variant="h5"
                                                className={classes.textSpaced}
                                                style={{ whiteSpace: "pre" }}
                                              >
                                                {formatCurrency(
                                                  row?.gauge?.weightPercent
                                                )}{" "}
                                                %
                                              </Typography>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                        className={classes.makeFlextoGridMobile}
                                      >
                                        <Typography
                                          style={{
                                            color: "rgb(148, 163, 184)",
                                            fontSize: "12px",
                                            marginRight: "0.5rem",
                                          }}
                                        >
                                          TVL
                                        </Typography>
                                        <Typography
                                          variant="h2"
                                          className={classes.textSpaced}
                                          style={{ textAlign: "left" }}
                                        >
                                          ${formatCurrency(row?.tvl)}
                                        </Typography>
                                      </div>
                                    </div>
                                  </div>
                                  {!shouldShow && (
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "end",
                                      }}
                                    >
                                      <div style={{ margin: "1rem 0" }}>
                                        <Typography
                                          variant="h2"
                                          className={classes.labelAdd}
                                          style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            whiteSpace: "pre",
                                          }}
                                        >
                                          Total Rewards
                                        </Typography>
                                      </div>
                                      <div style={{ display: "grid" }}>
                                        <Typography>
                                          $
                                          {formatCurrency(
                                            BigNumber(row?.gauge?.fees).plus(
                                              row.gauge.bribes.reduce(
                                                (total, bribe) => {
                                                  if (
                                                    bribe.rewardAmount !== 0
                                                  ) {
                                                    return (
                                                      total +
                                                      bribe.token.price *
                                                        bribe.rewardAmount
                                                    );
                                                  }
                                                  return total;
                                                },
                                                0
                                              )
                                            )
                                          )}
                                        </Typography>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                                className={classes.summarycontent}
                              >
                                {shouldShow && (
                                  <div
                                    style={{
                                      display: "flex",
                                      minWidth: "15%",
                                      marginLeft: "1rem",
                                      justifyContent: "center",
                                    }}
                                    className={classes.summarycontentMobile}
                                  >
                                    <Typography
                                      variant="h2"
                                      className={classes.labelAdd}
                                    >
                                      Total Rewards
                                    </Typography>

                                    <Typography>
                                      {/* ${formatCurrency(BigNumber(row?.gauge?.fees))} */}
                                      $
                                      {formatCurrency(
                                        BigNumber(row?.gauge?.fees).plus(
                                          row.gauge.bribes.reduce(
                                            (total, bribe) => {
                                              if (bribe.rewardAmount !== 0) {
                                                return (
                                                  total +
                                                  bribe.token.price *
                                                    bribe.rewardAmount
                                                );
                                              }
                                              return total;
                                            },
                                            0
                                          )
                                        )
                                      )}
                                    </Typography>
                                  </div>
                                )}

                                <div
                                  style={{
                                    display: "flex",
                                  }}
                                  className={classes.summarycontentMobile}
                                >
                                  <Typography
                                    variant="h2"
                                    className={classes.labelAdd}
                                  >
                                    Voting APR
                                  </Typography>
                                  <Typography
                                    variant="h2"
                                    className={classes.textSpaced}
                                  >
                                    {row?.gauge?.votingApr
                                      ? `${formatCurrency(
                                          row?.gauge?.votingApr
                                        )}%`
                                      : "-"}
                                  </Typography>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    minWidth: "32%",
                                    justifyContent: "space-between",
                                  }}
                                  className={classes.makeMinWidth100}
                                >
                                  <div className={classes.summarycontentMobile}>
                                    <Typography
                                      variant="h2"
                                      className={classes.labelAdd}
                                    >
                                      My Votes
                                    </Typography>
                                    <Typography
                                      variant="h2"
                                      className={classes.textSpaced}
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      {formatCurrency(
                                        BigNumber(sliderValue)
                                          .div(100)
                                          .times(token?.lockValue)
                                      )}
                                    </Typography>
                                    <TextField
                                      // placeholder={sliderValue.toString()}
                                      onClick={handleTextFieldClick}
                                      autoComplete="off"
                                      onInput={(e: any) => {
                                        const target = e.target;
                                        target.value = e.target.value.replace(
                                          /[^0-9.]/g,
                                          ""
                                        );
                                      }}
                                      className={classes.textField}
                                      variant="standard"
                                      size="small"
                                      style={{
                                        color: "#000",
                                      }}
                                      sx={{
                                        border: "1px solid rgba(0, 0, 0, 0.5)",
                                        borderRadius: "8px",
                                        padding: "1px 3px",
                                      }}
                                      value={sliderValue}
                                      inputProps={{
                                        style: {
                                          padding: "2px",
                                          textAlign: "right",
                                          fontSize: "14px",
                                        },
                                      }}
                                      InputProps={{
                                        disableUnderline: true,
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <span
                                              style={{
                                                color: "#000",
                                                fontSize: "8px",
                                              }}
                                            >
                                              %
                                            </span>
                                          </InputAdornment>
                                        ),
                                      }}
                                      onChange={(event) =>
                                        handleInputChange(
                                          event,
                                          event.target.value,
                                          row
                                        )
                                      }
                                    />
                                  </div>
                                  <div
                                    style={{
                                      minWidth: "5rem",
                                      marginRight: "2rem",
                                    }}
                                    className={classes.sliderMobile}
                                  >
                                    <Slider
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      valueLabelDisplay="auto"
                                      value={sliderValue}
                                      onChange={(event, value) => {
                                        const remainingSpace =
                                          MAX_SLIDER_VALUE -
                                          totalSliderValuesSum +
                                          sliderValue;
                                        const newValue = Array.isArray(value)
                                          ? value[0]
                                          : value; // value가 배열이면 첫 번째 요소로 설정
                                        if (newValue < 0) {
                                          value = 0;
                                          onSliderChange(event, value, row);
                                        }
                                        if (newValue > remainingSpace) {
                                          value = remainingSpace;
                                          onSliderChange(event, value, row);
                                        }
                                        if (newValue <= remainingSpace) {
                                          // newValue가 remainingSpace 이하일 때만 업데이트
                                          onSliderChange(event, newValue, row);
                                        }
                                      }}
                                      min={0}
                                      max={MAX_SLIDER_VALUE}
                                      marks
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </AccordionSummary>
                          <AccordionDetails
                            style={{
                              width: "100%",
                              padding: "2rem",
                              borderTop: "2px solid rgba(0, 0, 0, 0.1)",
                            }}
                            className={classes.paddingRemovedMobile}
                          >
                            {account.address && !isChainInvaild ? (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-evenly",
                                }}
                                className={classes.makeFlextoGridMobile}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    marginLeft: "3rem",
                                  }}
                                  className={classes.marginRemovedMobile}
                                >
                                  <div className={classes.tableCell}>
                                    <div className={classes.tableHeader}>
                                      <Typography
                                        className={classes.detailsTitle}
                                      >
                                        Fees
                                      </Typography>
                                    </div>
                                    <div className={classes.tableBody}>
                                      <div>
                                        <Typography
                                          variant="h2"
                                          className={classes.textSpaced}
                                        >
                                          $
                                          {formatCurrency(
                                            BigNumber(row?.gauge?.fees)
                                          )}
                                        </Typography>
                                      </div>
                                    </div>
                                  </div>
                                  <div className={classes.tableCell}>
                                    {row?.gauge.address && (
                                      <>
                                        {CheckBribeAmount(row.gauge.bribes) ? (
                                          <div style={{ display: "flex" }}>
                                            <div>
                                              <div
                                                className={classes.tableHeader}
                                              >
                                                <Typography
                                                  className={
                                                    classes.detailsTitle
                                                  }
                                                >
                                                  Bribes
                                                </Typography>
                                              </div>
                                              <div
                                                className={classes.tableBody}
                                                style={{
                                                  flexDirection: "column",
                                                }}
                                              >
                                                <Typography
                                                  variant="h2"
                                                  className={`${classes.textSpaced}`}
                                                  style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  $
                                                  {formatCurrency(
                                                    row.gauge.bribes.reduce(
                                                      (total, bribe) => {
                                                        if (
                                                          bribe.rewardAmount !==
                                                          0
                                                        ) {
                                                          return (
                                                            total +
                                                            bribe.token.price *
                                                              bribe.rewardAmount
                                                          );
                                                        }
                                                        return total;
                                                      },
                                                      0
                                                    )
                                                  )}
                                                </Typography>
                                                {bribesToDisplay.map(
                                                  (bribe, idx) => {
                                                    if (
                                                      bribe.rewardAmount !== 0
                                                    ) {
                                                      return (
                                                        <div
                                                          key={
                                                            bribe.token.symbol
                                                          }
                                                          style={{
                                                            display: "flex",
                                                          }}
                                                        >
                                                          <Typography
                                                            variant="h2"
                                                            className={
                                                              classes.textSpaced
                                                            }
                                                          >
                                                            {formatCurrency(
                                                              bribe.rewardAmount
                                                            )}
                                                          </Typography>
                                                          <Typography
                                                            variant="h5"
                                                            className={
                                                              classes.textSpaced
                                                            }
                                                            color="textSecondary"
                                                          >
                                                            &nbsp;
                                                            {bribe.token.symbol}
                                                          </Typography>
                                                        </div>
                                                      );
                                                    }
                                                    return null;
                                                  }
                                                )}
                                                {row.gauge.bribes.length >
                                                  maxItemsToShow && (
                                                  <div
                                                    style={{
                                                      display: "flex",
                                                      justifyContent: "center",
                                                    }}
                                                  >
                                                    <button
                                                      onClick={toggleShowAll}
                                                      style={{
                                                        paddingTop: "1rem",
                                                      }}
                                                    >
                                                      {showAll
                                                        ? lessIcon
                                                        : moreIcon}
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                            <div
                                              style={{
                                                alignItems: "center",
                                                display: "flex",
                                              }}
                                            >
                                              <Button
                                                variant="contained"
                                                onClick={() => {
                                                  router.push({
                                                    pathname: "/bribe/create",
                                                    query: {
                                                      address: row.address,
                                                    },
                                                  });
                                                }}
                                                sx={{
                                                  minWidth: "5px",
                                                  minHeight: "5px",
                                                  width: "35px",
                                                  height: "35px",
                                                  fontSize: "20px",
                                                  borderRadius: "50%",
                                                  color: "white",
                                                  margin: "0 0.25rem",
                                                  boxShadow:
                                                    "1px 2px 4px 0px rgba(0,0,0,0.3)",
                                                }}
                                                title="Add Bribe"
                                              >
                                                +
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div
                                            key={row.gauge.address}
                                            className={
                                              classes.createBribeButton
                                            }
                                            onClick={() => {
                                              router.push({
                                                pathname: "/bribe/create",
                                                query: {
                                                  address: row.address,
                                                },
                                              });
                                            }}
                                          >
                                            <Button
                                              fullWidth
                                              variant="contained"
                                              color="primary"
                                              size="small"
                                              sx={{
                                                backgroundColor: "transparent",
                                                "&.MuiButtonBase-root:hover": {
                                                  backgroundColor:
                                                    "transparent",
                                                },
                                              }}
                                              title="Create Bribe"
                                            >
                                              <Typography
                                                className={classes.detailsTitle}
                                              >
                                                Create Bribe
                                              </Typography>
                                            </Button>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className={classes.tableCell}>
                                  <div className={classes.tableHeader}>
                                    <Typography
                                      className={classes.detailsTitle}
                                    >
                                      My Stake
                                    </Typography>
                                  </div>
                                  <div
                                    className={classes.tableBody}
                                    style={{ flexDirection: "column" }}
                                  >
                                    <div className={classes.inlineEnd}>
                                      <Typography
                                        variant="h2"
                                        className={classes.textSpaced}
                                      >
                                        {formatCurrency(
                                          BigNumber(row?.gauge?.balance)
                                            .div(row?.gauge?.total_supply)
                                            .times(row?.reserve0)
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={classes.textSpacedOrange}
                                      >
                                        &nbsp;
                                        {row?.token0?.symbol}
                                      </Typography>
                                    </div>
                                    <div className={classes.inlineEnd}>
                                      <Typography
                                        variant="h5"
                                        className={classes.textSpaced}
                                      >
                                        {formatCurrency(
                                          BigNumber(row?.gauge?.balance)
                                            .div(row?.gauge?.total_supply)
                                            .times(row?.reserve1)
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={classes.textSpacedOrange}
                                      >
                                        &nbsp;
                                        {row?.token1?.symbol}
                                      </Typography>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                {isChainInvaild ? (
                                  <Button
                                    disableElevation
                                    className={classes2.accountButton}
                                    variant="contained"
                                    onClick={switchChain}
                                    style={{
                                      color: "black",
                                      boxSizing: "content-box",
                                    }}
                                  >
                                    <Typography className={classes2.headBtnTxt}>
                                      Switch Network
                                    </Typography>
                                  </Button>
                                ) : (
                                  <MyConnectWallet onClick={onAddressClicked} />
                                )}
                              </div>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}
              {sortedGauges.length === 0 &&
                Array.from({ length: rowsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={8}>
                      <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={66}
                        sx={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
                        className={classes.skelly}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        {unlockOpen && (
          <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />
        )}
        <div
          style={{
            width: "100%",
            //border: "1px outset",
            //borderColor: "#FFF",
            borderRadius: "0 0 10px 10px",
            background: "transparent",
          }}
        >
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={gauges.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </Paper>
    </div>
  );
}
function descendingComparator(
  a: Pair,
  b: Pair,
  orderBy: OrderBy,
  defaultVotes: any
) {
  const voteValueA = getVoteValue(a, defaultVotes);
  const voteValueB = getVoteValue(b, defaultVotes);
  if (!a || !b) {
    return 0;
  }

  switch (orderBy) {
    // case "balance":
    //   if (BigNumber(b?.gauge?.balance).lt(a?.gauge?.balance)) {
    //     return -1;
    //   }
    //   if (BigNumber(b?.gauge?.balance).gt(a?.gauge?.balance)) {
    //     return 1;
    //   }
    //   return 0;

    // case "liquidity":
    //   let reserveA = BigNumber(a?.reserve0).plus(a?.reserve1).toNumber();
    //   let reserveB = BigNumber(b?.reserve0).plus(b?.reserve1).toNumber();

    //   if (BigNumber(reserveB).lt(reserveA)) {
    //     return -1;
    //   }
    //   if (BigNumber(reserveB).gt(reserveA)) {
    //     return 1;
    //   }
    //   return 0;
    case "asset":
      if (BigNumber(b?.tvl).lt(a?.tvl)) {
        return -1;
      }
      if (BigNumber(b?.tvl).gt(a?.tvl)) {
        return 1;
      }
      return 0;

    case "votes_apr":
      if (BigNumber(b?.gauge?.votingApr).lt(a?.gauge?.votingApr)) {
        return -1;
      }
      if (BigNumber(b?.gauge?.votingApr).gt(a?.gauge?.votingApr)) {
        return 1;
      }
      return 0;

    case "total_rewards":
      let reserveA = BigNumber(a?.gauge?.fees)
        .plus(
          a.gauge.bribes.reduce((total, bribe) => {
            if (bribe.rewardAmount !== 0) {
              return total + bribe.token.price * bribe.rewardAmount;
            }
            return total;
          }, 0)
        )
        .toNumber();

      let reserveB = BigNumber(b?.gauge?.fees).plus(
        b.gauge.bribes.reduce((total, bribe) => {
          if (bribe.rewardAmount !== 0) {
            return total + bribe.token.price * bribe.rewardAmount;
          }
          return total;
        }, 0)
      );

      if (BigNumber(reserveB).lt(reserveA)) {
        return -1;
      }
      if (BigNumber(reserveB).gt(reserveA)) {
        return 1;
      }
      return 0;
    // case "totalVotes":
    //   if (BigNumber(b?.gauge?.weightPercent).lt(a?.gauge?.weightPercent)) {
    //     return -1;
    //   }
    //   if (BigNumber(b?.gauge?.weightPercent).gt(a?.gauge?.weightPercent)) {
    //     return 1;
    //   }
    //   return 0;

    // case "apy":
    //   if (BigNumber(b?.gauge?.bribes.length).lt(a?.gauge?.bribes.length)) {
    //     return -1;
    //   }
    //   if (BigNumber(b?.gauge?.bribes.length).gt(a?.gauge?.bribes.length)) {
    //     return 1;
    //   }
    //   return 0;

    case "myVotes":
      if (voteValueA < voteValueB) {
        return 1;
      }
      if (voteValueA > voteValueB) {
        return -1;
      }
      return 0;

    case "actions":
      if (voteValueA < voteValueB) {
        return 1;
      }
      if (voteValueA > voteValueB) {
        return -1;
      }
      return 0;

    default:
      return 0;
  }
}

function getVoteValue(pair: Pair, defaultVotes: any) {
  const pairAddress = pair.address;
  const defaultVote = defaultVotes.find((vote) => vote.address === pairAddress);

  return defaultVote ? defaultVote.value : 0;
}

function getComparator(
  order: "asc" | "desc",
  orderBy: OrderBy,
  defaultVotes: any
) {
  return order === "desc"
    ? (a: Pair, b: Pair) => descendingComparator(a, b, orderBy, defaultVotes)
    : (a: Pair, b: Pair) => -descendingComparator(a, b, orderBy, defaultVotes);
}

function stableSort(array: Pair[], comparator: (a: Pair, b: Pair) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as const);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}
