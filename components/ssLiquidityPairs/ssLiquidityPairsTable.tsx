import React, { useState, useEffect, useMemo, Fragment, useRef } from "react";
import classes2 from "./ssLiquidityPairs.module.css";
import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";
import { formatAddress } from "../../utils/utils";
import { ThemeProvider } from "@mui/material/styles";
import Unlock from "../unlock/unlockModal";
import { createTheme } from "@mui/material/styles";
import TransactionQueue from "../transactionQueue/transactionQueue";
import { makeStyles } from "@mui/styles";
import {
  Skeleton,
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
  Tooltip,
  Toolbar,
  IconButton,
  TextField,
  InputAdornment,
  Popper,
  Fade,
  Grid,
  Switch,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import { useRouter } from "next/router";
import BigNumber from "bignumber.js";
import {
  FilterList,
  Search,
  AddCircleOutline,
  ArrowForward,
  Close,
} from "@mui/icons-material";

import { formatCurrency } from "../../utils/utils";
import { Pair } from "../../stores/types/types";
import { MyConnectWallet } from "../MyConnectWallet";
import { switchChain } from "../header/header";

type EthWindow = Window &
  typeof globalThis & {
    ethereum?: any;
  };

const headCells = [
  { id: "pair", numeric: false, disablePadding: false, label: "Pair" },
  // {
  //   id: "balance",
  //   numeric: true,
  //   disablePadding: false,
  //   label: "Wallet",
  // },
  // {
  //   id: "poolBalance",
  //   numeric: true,
  //   disablePadding: false,
  //   label: "My Pool Amount",
  // },
  // {
  //   id: "stakedBalance",
  //   numeric: true,
  //   disablePadding: false,
  //   label: "My Staked Amount",
  // },
  {
    id: "poolAmount",
    numeric: true,
    disablePadding: false,
    label: "Liquidity",
  },
  // {
  //   id: "stakedAmount",
  //   numeric: true,
  //   disablePadding: false,
  //   label: "Total Pool Staked",
  // },
  {
    id: "apr",
    numeric: true,
    disablePadding: false,
    label: "APR",
  },
  {
    id: "",
    numeric: true,
    disablePadding: false,
    label: "Actions",
  },
] as const;

type OrderBy = (typeof headCells)[number]["id"];
function EnhancedTableHead(props: {
  classes: ReturnType<typeof useStyles>;
  order: "asc" | "desc";
  orderBy: OrderBy;
  onRequestSort: (_e: any, property: OrderBy) => void;
}) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: OrderBy) => (_e) => {
    onRequestSort(_e, property);
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
              backgroundColor: "transparent",
              textAlign: headCell.id === "pair" ? "left" : "right",
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
      color: "rgba(255, 174, 128, 0.6)",
    },
    "&.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "rgba(255, 174, 128, 0.5)",
    },
  },

  PagmenuItem: {
    "&:hover": {
      backgroundColor: "rgb(45, 45, 45)",
    },
  },

  tableCell: {
    padding: "2rem",
    borderRadius: "14px",
    background: "linear-gradient(155deg, #FCB993 15.8%, #FF9A5F 46.58%)",
    "@media (min-width: 1280px)": {
      minWidth: "250px",
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
    "@media (max-width: 900px)": {
      flexDirection: "column",
      width: "fit-content",
      gap: "1rem",
    },
  },
  inlineEnd: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    "@media (max-width: 1000px)": {
      display: "block",
    },
  },
  inlineEnd2: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },
  icon: {
    marginRight: "12px",
  },
  textSpaced: {
    fontSize: "16px",
    "@media (max-width: 1000px)": {
      fontSize: "14px !important",
    },
  },
  headerText: {
    fontWeight: "200",
    fontSize: "12px",
  },
  cell: {},
  cellSuccess: {
    color: "#4eaf0a",
  },
  cellStyles: {
    display: "flex",
    justifyContent: "space-evenly",
    gap: "1rem",
    "@media (max-width: 940px)": {
      display: "grid !important",
      gridTemplateColumns: "repeat(2, 1fr) !important",
      gap: "1rem !important",
      width: "fit-content",
    },
    "@media (max-width: 600px)": {
      gridTemplateColumns: "repeat(1, 1fr) !important",
    },
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
    gap: "6px",
    "@media (max-width: 1000px)": {
      display: "block !important",
    },
  },
  summarycontent: {
    "@media (max-width: 1400px)": {
      width: "37% !important",
    },
    "@media (max-width: 900px)": {
      width: "100% !important",
      justifyContent: "space-between !important",
    },
  },
  detailsTitle: {
    lineHeight: "1.5",
    fontSize: "14px",
    fontWeight: "500",
    color: "white",
    display: "flex",
    justifyContent: "center",
    marginBottom: "1rem",
    whiteSpace: "pre",
  },
  detailsContent: {
    lineHeight: "1.5",
    fontSize: "16px",
    fontWeight: "500",
    color: "white",
    margin: "2px",
    overflowWrap: "anywhere",
    textAlign: "left",
  },
  detailsTitleContra: {
    lineHeight: "1.5",
    fontSize: "14px",
    fontWeight: "600",
    color: "#FF9A5F",
    display: "flex",
    justifyContent: "center",
    marginBottom: "1rem",
    whiteSpace: "pre",
  },
  detailsContentContra: {
    lineHeight: "1.5",
    fontSize: "16px",
    fontWeight: "600",
    color: "#FF9A5F",
    margin: "2px",
    overflowWrap: "anywhere",
    textAlign: "left",
  },
  symbolContra: {
    color: "#FF9A5F",
    fontWeight: "600",
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
    fontWeight: 500,
    alignItems: "center",
    height: "50px",
    paddingLeft: "26px",
    paddingRight: "26px",
    fontSize: "1.3vw",
    borderRadius: "90px",
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
  makeMinWidth100: {
    "@media (max-width: 940px)": {
      width: "fit-content !important",
      minWidth: "0px !important",
    },
  },
  paddingResizeMobile: {
    "@media (max-width: 940px)": {
      padding: "2rem 0.5rem !important",
      display: "flex",
      justifyContent: "center",
    },
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
    height: "30px",
    borderRadius: "30px",
    background: "rgb(25, 33, 56)",
  },
  img2Logo: {
    height: "30px",
    borderRadius: "30px",
    background: "rgb(25, 33, 56)",
  },
  overrideTableHead: {
    borderBottom: "1px solid rgba(126,153,176,0.01) !important",
    "@media (max-width: 1000px)": {
      display: "none",
    },
  },
  doubleImages: {
    display: "flex",
    position: "relative",
    width: "25%",
    height: "35px",
    alignItems: "center",
    "@media (max-width: 900px)": {
      width: "auto",
      marginBottom: "2rem",
    },
  },
  searchContainer: {
    flex: 1,
    display: "flex",
    width: "100%",
    height: "100%",
    background: "transparent",
    borderRadius: "10px",
  },
  buttonOverride: {
    width: "100%",
    background: "#FF9A5F",
    fontWeight: "500",
    borderRadius: "13px",
    color: "#FFF",
    boxShadow: "0px 3px 4px 0px rgba(0, 0, 0, 0.2)",
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
    background: "#F8C4A3",
    color: "#84593F",
    width: "100%",
    height: "100%",
    borderRadius: "10px",
    "&:hover": {
      background: "#EAAF8A",
    },
  },
  actionButtonText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#FFF",
    whiteSpace: "pre",
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoIcon: {
    color: "#FFF",
    fontSize: "16px",
    marginLeft: "10px",
  },
  symbol: {
    color: "white",
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
    "@media (max-width: 1000px)": {
      display: "block",
    },
  },
}));

const switchToMainnet = async () => {
  let hexChain = "0xA9"; // + Number(process.env.NEXT_PUBLIC_CHAINID).toString(16);
  try {
    const ethereum = (window as EthWindow).ethereum;
    if (!ethereum) {
      // if there's isn't any wallet
      return;
    }

    const currentChainId = stores.accountStore.getStore("chainId");

    await (window as EthWindow).ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: hexChain,
          chainName: "Manta Pacific Mainnet",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: ["https://pacific-rpc.manta.network/http"],
          blockExplorerUrls: ["https://pacific-explorer.manta.network"],
        },
      ],
    });
    if (currentChainId !== parseInt(hexChain, 16)) {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChain }],
      });
    }
  } catch (error) {
    //
  }
};

const getLocalToggles = () => {
  let localToggles = {
    toggleActive: false,
    toggleActiveGauge: false,
    toggleVariable: true,
    toggleStable: true,
  };
  // get locally saved toggles
  try {
    const localToggleString = localStorage.getItem("solidly-pairsToggle-v1");
    if (localToggleString && localToggleString.length > 0) {
      localToggles = JSON.parse(localToggleString);
    }
  } catch (ex) {}

  return localToggles;
};

const EnhancedTableToolbar = (props) => {
  const classes = useStyles();
  const router = useRouter();

  const localToggles = getLocalToggles();

  const [search, setSearch] = useState("");
  const [toggleActive, setToggleActive] = useState(localToggles.toggleActive);
  const [toggleActiveGauge, setToggleActiveGauge] = useState(
    localToggles.toggleActiveGauge
  );
  const [toggleStable, setToggleStable] = useState(localToggles.toggleStable);
  const [toggleVariable, setToggleVariable] = useState(
    localToggles.toggleVariable
  );

  const onSearchChanged = (event) => {
    setSearch(event.target.value);
    props.setSearch(event.target.value);
  };

  const customTheme = createTheme({
    palette: {
      primary: {
        main: "#your-primary-color", // 기본 primary 색상
      },
      secondary: {
        main: "#your-custom-color", // 커스텀 primary 색상
      },
      error: {
        main: "rgb(255, 174, 128)", // 커스텀 primary 색상
      },
      warning: {
        main: "#4caf50", // 커스텀 primary 색상
      },
    },
  });

  const onToggle = (event) => {
    const localToggles = getLocalToggles();

    switch (event.target.name) {
      case "toggleActive":
        setToggleActive(event.target.checked);
        props.setToggleActive(event.target.checked);
        localToggles.toggleActive = event.target.checked;
        break;
      case "toggleActiveGauge":
        setToggleActiveGauge(event.target.checked);
        props.setToggleActiveGauge(event.target.checked);
        localToggles.toggleActiveGauge = event.target.checked;
        break;
      case "toggleStable":
        setToggleStable(event.target.checked);
        props.setToggleStable(event.target.checked);
        localToggles.toggleStable = event.target.checked;
        break;
      case "toggleVariable":
        setToggleVariable(event.target.checked);
        props.setToggleVariable(event.target.checked);
        localToggles.toggleVariable = event.target.checked;
        break;
      default:
    }

    // set locally saved toggles
    try {
      localStorage.setItem(
        "solidly-pairsToggle-v1",
        JSON.stringify(localToggles)
      );
    } catch (ex) {}
  };

  const onCreate = () => {
    router.push("/liquidity/create");
  };
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const popperRef = useRef(null);
  const filterRef = useRef(null);

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setOpen(!open);
  };

  const handleOutsideClick = (event) => {
    if (filterRef.current && filterRef.current.contains(event.target)) return;
    if (popperRef.current && !popperRef.current.contains(event.target)) {
      setOpen(false);

      setAnchorEl(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const id = open ? "transitions-popper" : undefined;

  return (
    <Toolbar className={classes.toolbar}>
      <Grid container spacing={2}>
        <Grid item lg={2} md={2} sm={12} xs={12}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddCircleOutline />}
            size="large"
            className={classes.buttonOverride}
            onClick={onCreate}
          >
            <Typography className={classes.actionButtonText}>
              ADD Liquidity
            </Typography>
          </Button>
        </Grid>
        <Grid item lg={9} md={9} sm={10} xs={10}>
          <TextField
            className={classes.searchContainer}
            fullWidth
            placeholder="EASY, USDC, 0x..."
            value={search}
            autoComplete="off"
            onChange={onSearchChanged}
            InputProps={{
              style: { height: "100%" },
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item lg={1} md={true} sm={2} xs={2}>
          <Tooltip placement="top" title="Filter list">
            <IconButton
              aria-describedby={open ? "popper" : undefined}
              onClick={handleClick}
              className={classes.filterButton}
              aria-label="filter list"
              ref={filterRef}
            >
              <FilterList />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>

      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        transition
        placement="bottom-end"
        ref={popperRef}
      >
        {({ TransitionProps }) => (
          <ThemeProvider theme={customTheme}>
            <Fade {...TransitionProps} timeout={350}>
              <div className={classes.filterContainer}>
                <div className={classes.filterListTitle}>
                  <Typography variant="h5">List Filters</Typography>
                  <IconButton onClick={handleClick} aria-label="close">
                    <Close />
                  </IconButton>
                </div>

                <Grid container spacing={0}>
                  <Grid item lg={9} className={classes.labelColumn}>
                    <Typography className={classes.filterLabel} variant="body1">
                      My Deposits
                    </Typography>
                  </Grid>
                  <Grid item lg={3} className={classes.alignContentRight}>
                    <Switch
                      color="error"
                      checked={toggleActive}
                      name={"toggleActive"}
                      onChange={onToggle}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={0}>
                  <Grid item lg={9} className={classes.labelColumn}>
                    <Typography className={classes.filterLabel} variant="body1">
                      Show Active Gauges
                    </Typography>
                  </Grid>
                  <Grid item lg={3} className={classes.alignContentRight}>
                    <Switch
                      color="error"
                      checked={toggleActiveGauge}
                      name={"toggleActiveGauge"}
                      onChange={onToggle}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={0}>
                  <Grid item lg={9} className={classes.labelColumn}>
                    <Typography className={classes.filterLabel} variant="body1">
                      Show Stable Pools
                    </Typography>
                  </Grid>
                  <Grid item lg={3} className={classes.alignContentRight}>
                    <Switch
                      color="error"
                      checked={toggleStable}
                      name={"toggleStable"}
                      onChange={onToggle}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={0}>
                  <Grid item lg={9} className={classes.labelColumn}>
                    <Typography className={classes.filterLabel} variant="body1">
                      Show Volatile Pools
                    </Typography>
                  </Grid>
                  <Grid item lg={3} className={classes.alignContentRight}>
                    <Switch
                      color="error"
                      checked={toggleVariable}
                      name={"toggleVariable"}
                      onChange={onToggle}
                    />
                  </Grid>
                </Grid>
              </div>
            </Fade>
          </ThemeProvider>
        )}
      </Popper>
    </Toolbar>
  );
};

export default function EnhancedTable({ pairs }: { pairs: Pair[] }) {
  const classes = useStyles();
  const router = useRouter();

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<OrderBy>("poolAmount");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const localToggles = getLocalToggles();

  const [search, setSearch] = useState("");
  const [toggleActive, setToggleActive] = useState(localToggles.toggleActive);
  const [toggleActiveGauge, setToggleActiveGauge] = useState(
    localToggles.toggleActiveGauge
  );
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [toggleStable, setToggleStable] = useState(localToggles.toggleStable);
  const [toggleVariable, setToggleVariable] = useState(
    localToggles.toggleVariable
  );
  const accountStore = stores.accountStore.getStore("account");
  const chainInvalid = stores.accountStore.getStore("chainInvalid");
  const [account, setAccount] = useState(accountStore);
  const [isChainInvaild, setIsChainInvaild] = useState(chainInvalid);
  const [transactionQueueLength, setTransactionQueueLength] = useState(0);
  const { CONNECT_WALLET, ACCOUNT_CONFIGURED } = ACTIONS;

  const [expanded, setExpanded] = useState(null);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const closeUnlock = () => {
    setUnlockOpen(false);
  };

  useEffect(() => {
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

    stores.emitter.on(ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(CONNECT_WALLET, connectWallet);
    return () => {
      stores.emitter.removeListener(ACCOUNT_CONFIGURED, accountConfigure);
      stores.emitter.removeListener(CONNECT_WALLET, connectWallet);
    };
  }, []);

  const setQueueLength = (length) => {
    setTransactionQueueLength(length);
  };

  const onAddressClicked = () => {
    setUnlockOpen(true);
  };

  const handleRequestSort = (_e, property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  if (!pairs) {
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

  const onView = (pair) => {
    router.push(`/liquidity/address?add=${pair.address}`);
  };

  const renderTooltip = (pair) => {
    return (
      <div>
        <Typography>Ve Emissions</Typography>
        <Typography>0.00</Typography>
      </div>
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredPairs = useMemo(
    () =>
      pairs
        .filter((pair) => {
          if (!search || search === "") {
            return true;
          }

          const searchLower = search.toLowerCase();

          if (
            pair.symbol.toLowerCase().includes(searchLower) ||
            pair.address.toLowerCase().includes(searchLower) ||
            pair.token0.symbol.toLowerCase().includes(searchLower) ||
            pair.token0.address.toLowerCase().includes(searchLower) ||
            pair.token0.name.toLowerCase().includes(searchLower) ||
            pair.token1.symbol.toLowerCase().includes(searchLower) ||
            pair.token1.address.toLowerCase().includes(searchLower) ||
            pair.token1.name.toLowerCase().includes(searchLower)
          ) {
            return true;
          }

          return false;
        })
        .filter((pair) => {
          if (toggleStable !== true && pair.stable === true) {
            return false;
          }
          if (toggleVariable !== true && pair.stable === false) {
            return false;
          }
          if (
            toggleActiveGauge === true &&
            (!pair.gauge || !pair.gauge.address)
          ) {
            return false;
          }
          if (toggleActive === true) {
            if (
              !BigNumber(pair?.gauge?.balance).gt(0) &&
              !BigNumber(pair?.balance).gt(0)
            ) {
              return false;
            }
          }

          return true;
        }),
    [
      pairs,
      toggleActiveGauge,
      toggleActive,
      toggleStable,
      toggleVariable,
      search,
    ]
  );

  const sortedPairs = useMemo(
    () =>
      stableSort(filteredPairs, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [filteredPairs, order, orderBy, page, rowsPerPage]
  );

  const emptyRows = 5 - Math.min(5, filteredPairs.length - page * 5);

  // if (!account) {
  //   return (
  //     <div className={classes.root}>
  //       <EnhancedTableToolbar
  //         setSearch={setSearch}
  //         setToggleActive={setToggleActive}
  //         setToggleActiveGauge={setToggleActiveGauge}
  //         setToggleStable={setToggleStable}
  //         setToggleVariable={setToggleVariable}
  //       />
  //       <Paper
  //         elevation={0}
  //         className={classes.tableContainer}
  //         style={{ borderRadius: "10px", }}
  //       >
  //         <TableContainer>
  //           <Table
  //             aria-labelledby="tableTitle"
  //             size={"medium"}
  //             aria-label="enhanced table"
  //             style={{ position: 'relative' }}
  //           >
  //             <div
  //               style={{
  //                 display: 'flex',
  //                 justifyContent: 'center',
  //                 alignItems: 'center',
  //                 position: 'absolute',
  //                 top: '50%',
  //                 left: '50%',
  //                 transform: 'translate(-50%, -50%)',
  //                 width: '100%',
  //               }}
  //             >
  //               <Button
  //                 disableElevation
  //                 className={classes.accountButton}
  //                 style={{ backgroundColor: "rgb(255, 174, 128)", color: "black" }}
  //                 variant="contained"
  //                 onClick={onAddressClicked}
  //               >
  //                 {account && account.address && (
  //                   <div
  //                     className={`${classes2.accountIcon} ${classes2.metamask}`}
  //                   ></div>
  //                 )}
  //                 <Typography className={classes2.headBtnTxt}>
  //                   {account && account.address
  //                     ? formatAddress(account.address)
  //                     : "Connect Wallet"}

  //                 </Typography>
  //               </Button>
  //               {unlockOpen && (
  //                 <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />
  //               )}
  //               <TransactionQueue setQueueLength={setQueueLength} />
  //             </div>
  //             <TableBody>
  //               {emptyRows > 0 && (
  //                 <TableRow style={{ height: 80 * emptyRows }}>
  //                   <TableCell colSpan={7} />
  //                 </TableRow>
  //               )}
  //             </TableBody>
  //           </Table>
  //         </TableContainer>
  //       </Paper>
  //     </div>
  //   )
  // }
  return (
    <div className={classes.root}>
      <EnhancedTableToolbar
        setSearch={setSearch}
        setToggleActive={setToggleActive}
        setToggleActiveGauge={setToggleActiveGauge}
        setToggleStable={setToggleStable}
        setToggleVariable={setToggleVariable}
      />
      <Paper
        elevation={0}
        className={classes.tableContainer}
        style={{ borderRadius: "10px", boxShadow: "none" }}
      >
        <TableContainer style={{ width: "100%" }}>
          <Table
            aria-labelledby="tableTitle"
            size={"medium"}
            aria-label="enhanced table"
            style={{ position: "relative" }}
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {sortedPairs.map((row, index) => (
                <Fragment key={index}>
                  <TableRow>
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
                          style={{ padding: "15px", borderRadius: "10px" }}
                          className={`${classes2.accordionSummary}`}
                        >
                          <div className={classes.inline}>
                            <div className={classes.doubleImages}>
                              <div
                                style={{
                                  display: "flex",
                                  padding: "1px",
                                  marginRight: "1rem",
                                  minWidth: "60px",
                                }}
                              >
                                <img
                                  className={classes.img1Logo}
                                  src={row?.token0?.logoURI || ""}
                                  width="30"
                                  height="30"
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
                                  src={row?.token1?.logoURI || ""}
                                  width="30"
                                  height="30"
                                  alt=""
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).onerror =
                                      null;
                                    (e.target as HTMLImageElement).src =
                                      "/tokens/unknown-logo.png";
                                  }}
                                />
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                                className={classes.summaryTitle}
                              >
                                <Typography
                                  variant="h2"
                                  className={classes.textSpaced}
                                  noWrap
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
                            <div
                              style={{
                                display: "flex",
                                width: "33rem",
                                justifyContent: "space-around",
                              }}
                              className={classes.summarycontent}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  justifyItems: "baseline",
                                  minWidth: "14rem",
                                }}
                                className={classes.makeMinWidth100}
                              >
                                {row && row.reserve0 && row.token0 && (
                                  <div className={classes.inlineEnd}>
                                    <Typography
                                      variant="h2"
                                      className={classes.labelAdd}
                                    >
                                      Liquidity
                                    </Typography>
                                    <Typography
                                      variant="h2"
                                      className={classes.textSpaced}
                                    >
                                      $ {formatCurrency(row.tvl)}
                                    </Typography>
                                    {/* <Typography
                                      variant="h5"
                                      className={`${classes.textSpaced} ${classes.symbol}`}
                                      color="textSecondary"
                                    >
                                      {row.token0.symbol}
                                    </Typography> */}
                                  </div>
                                )}
                                {!(row && row.reserve0 && row.token0) && (
                                  <div className={classes.inlineEnd}>
                                    <Skeleton
                                      variant="rectangular"
                                      width={120}
                                      height={16}
                                      style={{
                                        marginTop: "1px",
                                        marginBottom: "1px",
                                      }}
                                    />
                                  </div>
                                )}
                                {/* {row && row.reserve1 && row.token1 && (
                                  <div className={classes.inlineEnd}>
                                    <Typography
                                      variant="h2"
                                      className={classes.textSpaced}
                                    >
                                      {formatCurrency(row.reserve1)}
                                    </Typography>
                                    <Typography
                                      variant="h5"
                                      className={`${classes.textSpaced} ${classes.symbol}`}
                                      color="textSecondary"
                                    >
                                      {row.token1.symbol}
                                    </Typography>
                                  </div>
                                )}
                                {!(row && row.reserve1 && row.token1) && (
                                  <div className={classes.inlineEnd}>
                                    <Skeleton
                                      variant="rectangular"
                                      width={120}
                                      height={16}
                                      style={{ marginTop: "1px", marginBottom: "1px" }}
                                    />
                                  </div>
                                )} */}
                              </div>

                              <div
                                className={`${classes.cell} ${classes.makeMinWidth100}`}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  minWidth: "8rem",
                                  marginRight: "1.5rem",
                                }}
                              >
                                <div
                                  style={{
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                  }}
                                >
                                  <Typography
                                    variant="h2"
                                    className={classes.labelAdd}
                                  >
                                    APR
                                  </Typography>
                                  <Typography
                                    variant="h2"
                                    className={classes.textSpaced}
                                  >
                                    {row.apr ? `${row.apr.toFixed(2)}%` : "-"}
                                  </Typography>
                                </div>
                              </div>
                            </div>
                            <Button
                              style={{
                                height: "fit-content",
                                padding: "6px 0",
                                color: "white",
                                minWidth: "36px",
                              }}
                              onClick={(e) => {
                                onView(row);
                                e.stopPropagation();
                              }}
                            >
                              <ArrowForward />
                            </Button>
                          </div>
                        </AccordionSummary>
                        <AccordionDetails
                          style={{
                            width: "100%",
                            padding: "2rem",
                            borderTop: "2px solid rgba(0, 0, 0, 0.1)",
                          }}
                          className={classes.paddingResizeMobile}
                        >
                          {account.address && !isChainInvaild ? (
                            <div className={classes.cellStyles}>
                              <div
                                className={classes.tableCell}
                                style={{
                                  background: "white",
                                  border: "2px solid #FF9A5F",
                                }}
                              >
                                <Typography
                                  className={classes.detailsTitleContra}
                                >
                                  Total Pool Amount
                                </Typography>
                                {row &&
                                  row.token0 &&
                                  "balance" in row.token0 &&
                                  row.token0.balance && (
                                    <div className={classes.inlineEnd2}>
                                      <Typography
                                        variant="h2"
                                        className={classes.detailsContentContra}
                                      >
                                        {formatCurrency(
                                          BigNumber(row.reserve0)
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={`${classes.textSpaced} ${classes.symbolContra}`}
                                      >
                                        {row.token0.symbol}
                                      </Typography>
                                    </div>
                                  )}
                                {!(
                                  row &&
                                  row.token0 &&
                                  "balance" in row.token0 &&
                                  row.token0.balance
                                ) && (
                                  <div className={classes.inlineEnd2}>
                                    <Skeleton
                                      variant="rectangular"
                                      width={120}
                                      height={16}
                                      style={{
                                        marginTop: "1px",
                                        marginBottom: "1px",
                                      }}
                                    />
                                  </div>
                                )}
                                {row &&
                                  row.token1 &&
                                  "balance" in row.token1 &&
                                  row.token1.balance && (
                                    <div className={classes.inlineEnd2}>
                                      <Typography
                                        variant="h2"
                                        className={classes.detailsContentContra}
                                      >
                                        {formatCurrency(
                                          BigNumber(row.reserve1)
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={`${classes.textSpaced} ${classes.symbolContra}`}
                                      >
                                        {row.token1.symbol}
                                      </Typography>
                                    </div>
                                  )}
                                {!(
                                  row &&
                                  row.token1 &&
                                  "balance" in row.token1 &&
                                  row.token1.balance
                                ) && (
                                  <div className={classes.inlineEnd2}>
                                    <Skeleton
                                      variant="rectangular"
                                      width={120}
                                      height={16}
                                      style={{
                                        marginTop: "1px",
                                        marginBottom: "1px",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className={classes.tableCell}>
                                <Typography className={classes.detailsTitle}>
                                  Wallet Balance
                                </Typography>
                                {row &&
                                  row.token0 &&
                                  "balance" in row.token0 &&
                                  row.token0.balance && (
                                    <div className={classes.inlineEnd2}>
                                      <Typography
                                        variant="h2"
                                        className={classes.detailsContent}
                                      >
                                        {formatCurrency(row.token0.balance)}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={`${classes.textSpaced} ${classes.symbol}`}
                                      >
                                        {row.token0.symbol}
                                      </Typography>
                                    </div>
                                  )}
                                {!(
                                  row &&
                                  row.token0 &&
                                  "balance" in row.token0 &&
                                  row.token0.balance
                                ) && (
                                  <div className={classes.inlineEnd2}>
                                    <Skeleton
                                      variant="rectangular"
                                      width={120}
                                      height={16}
                                      style={{
                                        marginTop: "1px",
                                        marginBottom: "1px",
                                      }}
                                    />
                                  </div>
                                )}
                                {row &&
                                  row.token1 &&
                                  "balance" in row.token1 &&
                                  row.token1.balance && (
                                    <div className={classes.inlineEnd2}>
                                      <Typography
                                        variant="h2"
                                        className={classes.detailsContent}
                                      >
                                        {formatCurrency(row.token1.balance)}
                                      </Typography>
                                      <Typography
                                        variant="h5"
                                        className={`${classes.textSpaced} ${classes.symbol}`}
                                      >
                                        {row.token1.symbol}
                                      </Typography>
                                    </div>
                                  )}
                                {!(
                                  row &&
                                  row.token1 &&
                                  "balance" in row.token1 &&
                                  row.token1.balance
                                ) && (
                                  <div className={classes.inlineEnd2}>
                                    <Skeleton
                                      variant="rectangular"
                                      width={120}
                                      height={16}
                                      style={{
                                        marginTop: "1px",
                                        marginBottom: "1px",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>

                              <div className={classes.tableCell}>
                                <Typography className={classes.detailsTitle}>
                                  My Pool Amount
                                </Typography>
                                {row && row.balance && row.totalSupply && (
                                  <>
                                    <div className={classes.inlineEnd2}>
                                      <Typography
                                        variant="h2"
                                        className={classes.detailsContent}
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
                                      >
                                        {row.token0.symbol}
                                      </Typography>
                                    </div>
                                    <div className={classes.inlineEnd2}>
                                      <Typography
                                        variant="h5"
                                        className={classes.detailsContent}
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
                                      >
                                        {row.token1.symbol}
                                      </Typography>
                                    </div>
                                  </>
                                )}
                                {!(row && row.balance && row.totalSupply) && (
                                  <div className={classes.inlineEnd2}>
                                    <Skeleton
                                      variant="rectangular"
                                      width={120}
                                      height={16}
                                      style={{
                                        marginTop: "1px",
                                        marginBottom: "1px",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>

                              {row && row.gauge && row.gauge.address && (
                                <div className={classes.tableCell}>
                                  <Typography className={classes.detailsTitle}>
                                    My Staked Amount
                                  </Typography>
                                  {row &&
                                    row.gauge &&
                                    row.gauge.balance &&
                                    row.gauge.total_supply >= 0 && (
                                      <>
                                        <div className={classes.inlineEnd2}>
                                          <Typography
                                            variant="h2"
                                            className={classes.detailsContent}
                                          >
                                            {formatCurrency(
                                              BigNumber(row.gauge.balance)
                                                .div(row.gauge.total_supply)
                                                .times(row.gauge.reserve0)
                                            )}
                                          </Typography>
                                          <Typography
                                            variant="h5"
                                            className={`${classes.textSpaced} ${classes.symbol}`}
                                          >
                                            {row.token0.symbol}
                                          </Typography>
                                        </div>
                                        <div className={classes.inlineEnd2}>
                                          <Typography
                                            variant="h5"
                                            className={classes.detailsContent}
                                          >
                                            {formatCurrency(
                                              BigNumber(row.gauge.balance)
                                                .div(row.gauge.total_supply)
                                                .times(row.gauge.reserve1)
                                            )}
                                          </Typography>
                                          <Typography
                                            variant="h5"
                                            className={`${classes.textSpaced} ${classes.symbol}`}
                                          >
                                            {row.token1.symbol}
                                          </Typography>
                                        </div>
                                      </>
                                    )}
                                  {!(
                                    row &&
                                    row.gauge &&
                                    row.gauge.balance &&
                                    row.gauge.totalSupply
                                  ) && (
                                    <div className={classes.inlineEnd2}>
                                      <Skeleton
                                        variant="rectangular"
                                        width={120}
                                        height={16}
                                        style={{
                                          marginTop: "1px",
                                          marginBottom: "1px",
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                              {!(row && row.gauge && row.gauge.address) && (
                                <div
                                  className={classes.tableCell}
                                  style={{
                                    justifyContent: "center",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {/* 기존에 있던 내용 추가 */}
                                  <Typography
                                    variant="h5"
                                    className={`${classes.textSpaced} ${classes.symbol}`}
                                  >
                                    Gauge not available
                                  </Typography>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              {isChainInvaild && account ? (
                                <Button
                                  disableElevation
                                  className={classes2.accountButton}
                                  variant="contained"
                                  onClick={switchToMainnet}
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
              ))}
              {sortedPairs.length === 0 &&
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
            count={filteredPairs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            SelectProps={
              {
                //   MenuProps: { classes: { paper: classes.selectDropdown } }
                // }}
                // backIconButtonProps={{
                //   style: {
                //     color: 'white',
                //   },
                // }}
                // nextIconButtonProps={{
                //   style: {
                //     color: 'white',
                //   },
              }
            }
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            classes={
              {
                //selectIcon: classes.tablePaginationSelectIcon,
                //menuItem: classes.PagmenuItem,
              }
            }
            nextIconButtonProps={{
              style: { color: "gray" },
            }}
            backIconButtonProps={{
              style: { color: "gray" },
            }}
          />
        </div>
      </Paper>
    </div>
  );
}

function descendingComparator(a: Pair, b: Pair, orderBy: OrderBy) {
  if (!a || !b) {
    return 0;
  }

  switch (orderBy) {
    // case "balance":
    //   if (!("balance" in a.token0 || "balance" in a.token1)) return 0;
    //   let balanceA = BigNumber((a?.token0 as BaseAsset)?.balance)
    //     .plus((a?.token1 as BaseAsset)?.balance)
    //     .toNumber();
    //   let balanceB = BigNumber((b?.token0 as BaseAsset)?.balance)
    //     .plus((b?.token1 as BaseAsset)?.balance)
    //     .toNumber();

    //   if (BigNumber(balanceB).lt(balanceA)) {
    //     return -1;
    //   }
    //   if (BigNumber(balanceB).gt(balanceA)) {
    //     return 1;
    //   }
    //   return 0;

    case "pair":
      if (b?.symbol < a?.symbol) {
        return -1;
      }
      if (b?.symbol > a?.symbol) {
        return 1;
      }
      return 0;

    case "apr":
      if (BigNumber(b?.apr).lt(a?.apr)) {
        return -1;
      }
      if (BigNumber(b?.apr).gt(a?.apr)) {
        return 1;
      }
      return 0;

    // case "poolBalance":
    //   if (BigNumber(b?.balance).lt(a?.balance)) {
    //     return -1;
    //   }
    //   if (BigNumber(b?.balance).gt(a?.balance)) {
    //     return 1;
    //   }
    //   return 0;

    // case "stakedBalance":
    //   if (!(a && a.gauge)) {
    //     return 1;
    //   }

    //   if (!(b && b.gauge)) {
    //     return -1;
    //   }

    //   if (BigNumber(b?.gauge?.balance).lt(a?.gauge?.balance)) {
    //     return -1;
    //   }
    //   if (BigNumber(b?.gauge?.balance).gt(a?.gauge?.balance)) {
    //     return 1;
    //   }
    //   return 0;

    case "poolAmount":
      let reserveA = BigNumber(a?.tvl).toNumber();
      let reserveB = BigNumber(b?.tvl).toNumber();

      if (BigNumber(reserveB).lt(reserveA)) {
        return -1;
      }
      if (BigNumber(reserveB).gt(reserveA)) {
        return 1;
      }
      return 0;

    // case "stakedAmount":
    //   if (!(a && a.gauge)) {
    //     return 1;
    //   }

    //   if (!(b && b.gauge)) {
    //     return -1;
    //   }

    //   let reserveAA = BigNumber(a?.gauge?.reserve0)
    //     .plus(a?.gauge?.reserve1)
    //     .toNumber();
    //   let reserveBB = BigNumber(b?.gauge?.reserve0)
    //     .plus(b?.gauge?.reserve1)
    //     .toNumber();

    //   if (BigNumber(reserveBB).lt(reserveAA)) {
    //     return -1;
    //   }
    //   if (BigNumber(reserveBB).gt(reserveAA)) {
    //     return 1;
    //   }
    //   return 0;

    // default:
    //   return 0;
  }
}

function getComparator(order: "asc" | "desc", orderBy: OrderBy) {
  return order === "desc"
    ? (a: Pair, b: Pair) => descendingComparator(a, b, orderBy)
    : (a: Pair, b: Pair) => -descendingComparator(a, b, orderBy);
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
