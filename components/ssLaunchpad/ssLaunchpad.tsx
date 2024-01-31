import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import type { AbiItem } from "web3-utils";
import LinearProgress from "@mui/material/LinearProgress";
import Timer from "./timer";
import { withTheme } from "@mui/styles";
import { CONTRACTLIST } from "../../stores/constants/constants";
import classes from "./ssLaunchpad.module.css";
import BigNumber from "bignumber.js";

import Web3 from "web3";
import stores from "../../stores";
import { supportedChainIdList } from "../../stores/connectors/connectors";

declare global {
  interface Window {
    ethereum?: any;
  }
}
let CONTRACTS;
function Setup() {
  const [updateDate, setUpdateDate] = useState(0);
  const [updateDate_ends, setUpdateDateEnds] = useState(0);
  const [claimable, setClaimable] = useState("");
  const [tokenPrice, setTokenPrice] = useState("");
  const [maxCap, setMaxCap] = useState("");
  const [totalRaised, setTotalRaised] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [shouldShowImage, setShouldShowImage] = useState(
    window.innerWidth >= 1000
  );
  const [shouldShowTimerImage, setShouldShowTimerImage] = useState(
    window.innerWidth >= 1000
  );
  const accountStore = stores.accountStore.getStore("account");
  const chainInvalid = stores.accountStore.getStore("chainInvalid");
  const [account, setAccount] = useState(accountStore);
  const [isChainInvaild, setIsChainInvaild] = useState(chainInvalid);
  CONTRACTS = CONTRACTLIST[3441005]; //TODO: change to mainnet WHEN MAINNET CONTRACT DEPLOYED
  const contractAddress = CONTRACTS.IDO_ADDRESS;
  const IDO_ABI = CONTRACTS.IDO_ABI;
  //const web3 = new Web3(window.ethereum);
  const web3 = new Web3("https://pacific-rpc.testnet.manta.network/http");
  const minterContract = new web3.eth.Contract(
    CONTRACTS.IDO_ABI as AbiItem[],
    CONTRACTS.IDO_ADDRESS
  );

  const isWithdrawButtonDisabled = () => {
    const currentDate = new Date();
    const endDate = new Date(updateDate_ends * 1000);
    return currentDate > endDate;
  };

  const isDepositButtonDisabled = () => {
    const currentDate = new Date();
    const endDate = new Date(updateDate * 1000);
    ////console.log("currentDate", currentDate);
    ////console.log("endDate", endDate);
    ////console.log("currentDate < endDate", currentDate < endDate);
    return currentDate < endDate;
  };
  useEffect(() => {
    let isMounted = true;
    const ssupdate = async () => {
      if (isMounted) {
        const startTime = await minterContract.methods.startTime().call();
        const endTime = await minterContract.methods.endTime().call();

        const accountStore = stores.accountStore.getStore("account");
        const chainInvalid = stores.accountStore.getStore("chainInvalid");

        const _updateDate = parseInt(startTime);
        const _updateDate_ends = parseInt(endTime);

        setAccount(accountStore);
        setIsChainInvaild(chainInvalid);
        setUpdateDate(_updateDate);
        setUpdateDateEnds(_updateDate_ends);
      }
    };

    const handleResize = () => {
      const newWindowWidth = window.innerWidth;
      setWindowWidth(newWindowWidth);
      setShouldShowImage(newWindowWidth >= 1200);
      setShouldShowTimerImage(newWindowWidth >= 490);
    };

    const chain = stores.accountStore.getStore("chainId");
    const isChainSupported = supportedChainIdList.includes(chain);
    if (isChainSupported) {
      CONTRACTS = CONTRACTLIST[chain];
    } else {
      CONTRACTS = CONTRACTLIST[3441005];
    }

    window.addEventListener("resize", handleResize);
    ssupdate();

    return () => {
      window.removeEventListener("resize", handleResize);
      isMounted = false;
    };
  }, []);

  function getFormattedDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  function getStartDate() {
    return getFormattedDate(updateDate);
  }

  function getEndDate() {
    return getFormattedDate(updateDate_ends);
  }

  const tableData = [
    {
      symbol: "EASY",
      startDate: getStartDate(),
      endDate: getEndDate(),
      saleType: "Private Sale",
      tge: "Token Launch Event",
      l_price: "$0.18",
      supply: "100,000,000",
      s_cap: "250 ETH",
      initial_circulating_supply: "33,500,000",
      m_contrib: "0.01 ETH",
      fdv: "10,000 ETH",
      format: "FCFS",
    },
  ];

  function getStatus() {
    const currentDate = new Date();
    const startDateObj = new Date(updateDate * 1000);
    const endDateObj = new Date(updateDate_ends * 1000);

    if (currentDate < startDateObj) {
      return "Not Started";
    } else if (currentDate > endDateObj) {
      return "Ended";
    } else {
      return "In Progress";
    }
  }

  const SaleDetails: React.FC<{
    tableData: any[];
    updateDate: number;
    updateDate_ends: number;
    shouldShowImage: boolean;
    shouldShowTimerImage: boolean;
  }> = React.memo(
    ({
      tableData,
      updateDate,
      updateDate_ends,
      shouldShowImage,
      shouldShowTimerImage,
    }) => {
      const maxCapNumber = parseFloat(maxCap);
      const formattedMaxCap = maxCapNumber.toLocaleString();
      const paperStyle = {
        backgroundImage:
          "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
        marginBottom: "2.5vh",
      };

      const titleStyle = {
        fontWeight: "500",
        fontSize: "30px",
      };

      const inProgressItems =
        tableData.length > 0 ? tableData[tableData.length - 1] : null;

      return (
        <Paper
          elevation={0}
          style={paperStyle}
          className={`${classes.saleDetailsContainer} ${classes.tableContainer}`}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              width: "100%",
            }}
          >
            <div>
              <Typography style={titleStyle}>Details</Typography>
            </div>
          </div>
          {/* <hr style={hrStyle} /> */}
          {shouldShowImage && (
            <div className={`${classes.linearPeriod}`}>
              <Typography style={{ fontWeight: "600", fontSize: "18px" }}>
                48h
              </Typography>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="818"
                height="80"
                fill="none"
              >
                <rect
                  id="backgroundrect"
                  width="100%"
                  height="100%"
                  x="0"
                  y="0"
                  fill="none"
                  stroke="none"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_96_435"
                    x1="-0.24388739466667175"
                    y1="1.000004768371582"
                    x2="0.9896088242530823"
                    y2="1.000004768371582"
                  >
                    <stop stopColor="#FFEADE" />
                    <stop offset="1" stopColor="#FF9A5F" />
                  </linearGradient>
                </defs>
                <g>
                  <title>Layer 1</title>
                  <g id="svg_4">
                    <path
                      d="M38.22627663612366,45.99999995698181 C90.89297663612365,33.843092537777096 241.62627663612366,9.529195742504271 423.22627663612366,9.529195742504271 C604.8262766361237,9.529195742504271 734.8932766361237,33.843092537777096 777.2262766361237,45.99999995698181 "
                      stroke="#FF9A5F"
                      strokeWidth="2"
                      strokeDasharray="10 10"
                      id="svg_5"
                    />
                  </g>
                  <g id="svg_6">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M38.010872996616364,66.4160578250885 C35.173372996616365,74.0093578250885 27.853172996616365,79.4160578250885 19.270072996616364,79.4160578250885 C8.224372996616363,79.4160578250885 -0.7299270033836367,70.4617578250885 -0.7299270033836367,59.4160578250885 C-0.7299270033836367,48.370357825088504 8.224372996616363,39.4160578250885 19.270072996616364,39.4160578250885 C28.225372996616365,39.4160578250885 35.80597299661636,45.3018478250885 38.354472996616366,53.4160578250885 H778.1860729966164 C780.7340729966164,45.3018478250885 788.3150729966163,39.4160578250885 797.2700729966164,39.4160578250885 C808.3160729966164,39.4160578250885 817.2700729966164,48.370357825088504 817.2700729966164,59.4160578250885 C817.2700729966164,70.4617578250885 808.3160729966164,79.4160578250885 797.2700729966164,79.4160578250885 C788.6870729966164,79.4160578250885 781.3670729966163,74.0093578250885 778.5290729966164,66.4160578250885 H38.010872996616364 z"
                      fill="url(#paint0_linear_96_435)"
                      id="svg_1"
                    />
                    <circle
                      cx="18.854030668735504"
                      cy="59.05109429359436"
                      r="9.255474090576172"
                      fill="white"
                      id="svg_2"
                    />
                    <circle
                      cx="797.2482224106789"
                      cy="59.3430655002594"
                      r="9.255474090576172"
                      fill="white"
                      id="svg_3"
                    />
                  </g>
                </g>
              </svg>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "1rem 6rem",
                }}
              >
                <div className={`${classes.columnCenterStyle}`}>
                  <Typography className={`${classes.tableItemStyle}`}>
                    Start Date
                  </Typography>
                  <Typography className={`${classes.tableItemStyle}`}>
                    {inProgressItems ? inProgressItems.startDate : ""}
                  </Typography>
                </div>
                <div className={`${classes.columnCenterStyle}`}>
                  <Typography className={`${classes.tableItemStyle}`}>
                    End Date
                  </Typography>
                  <Typography className={`${classes.tableItemStyle}`}>
                    {inProgressItems ? inProgressItems.endDate : ""}
                  </Typography>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "2rem",
              padding: "2rem",
            }}
            className={`${classes.gridMobile}`}
          >
            <div
              style={{
                backgroundColor: "#FFF8F3",
                borderRadius: "15px",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
              }}
            >
              <img src="/images/supplyOverview.png" alt="overview"></img>
              <div style={{ margin: "3rem 0" }}>
                <Typography className={`${classes.tableTitle}`}>
                  Supply Overview
                </Typography>
                <Typography className={`${classes.tableItemStyle}`}>
                  - Total Supply :{" "}
                  {inProgressItems ? inProgressItems.supply : ""}{" "}
                  {inProgressItems ? inProgressItems.symbol : ""}
                </Typography>
                <Typography className={`${classes.tableItemStyle}`}>
                  - Initial circulating supply :{" "}
                  {inProgressItems
                    ? inProgressItems.initial_circulating_supply
                    : ""}{" "}
                  {inProgressItems ? inProgressItems.symbol : ""}
                </Typography>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#FF9A5F",
                borderRadius: "15px",
                padding: "2rem",
              }}
            >
              <div style={{ margin: "2rem 0" }}>
                <Typography className={`${classes.tableItemStyleWhite}`}>
                  • Token Price : {parseFloat(tokenPrice).toFixed(7)} ETH
                </Typography>
                <Typography className={`${classes.tableItemStyleWhite}`}>
                  • Listing Price :{" "}
                  {inProgressItems ? inProgressItems.l_price : ""}
                </Typography>
                <Typography className={`${classes.tableItemStyleWhite}`}>
                  • Hardcap : {formattedMaxCap} ETH
                </Typography>
                <Typography className={`${classes.tableItemStyleWhite}`}>
                  • Softcap : {inProgressItems ? inProgressItems.s_cap : ""}
                </Typography>
                <Typography className={`${classes.tableItemStyleWhite}`}>
                  • Minimum Contribution :{" "}
                  {inProgressItems ? inProgressItems.m_contrib : ""}
                </Typography>
                <Typography className={`${classes.tableItemStyleWhite}`}>
                  • FDV : {inProgressItems ? inProgressItems.fdv : ""}
                </Typography>
                <Typography className={`${classes.tableItemStyleWhite}`}>
                  • Format : {inProgressItems ? inProgressItems.format : ""}
                </Typography>

                <div
                  style={{
                    border: "2px solid #FFF",
                    width: "100%",
                    borderRadius: "9px",
                    marginTop: "7rem",
                  }}
                  className={`${classes.buttonHover}`}
                >
                  <a href="" className={`${classes.linkHover}`} target="_blank">
                    More Information
                  </a>
                </div>
              </div>
            </div>

            {/* <div style={{ flex: 1 }}>
            <Typography className={`${classes.tableCellStyle}`}>
              Sale Type
            </Typography>
            <Typography className={`${classes.tableItemStyle}`}>
              {inProgressItems ? inProgressItems.saleType : ''}
            </Typography>
          </div>
          <div style={{ flex: 1 }}>
            <Typography className={`${classes.tableCellStyle}`}>
              TGE
            </Typography>
            <Typography className={`${classes.tableItemStyle}`}>
              {inProgressItems ? inProgressItems.tge : ''}
            </Typography>
          </div>
          <div style={{ flex: 1, marginLeft: "2vh" }}>
            <Typography className={`${classes.tableCellStyle}`}>
              Listing Price
            </Typography>
            <Typography className={`${classes.tableItemStyle}`}>
              {tableData.length > 0 && tokenPrice ? `${tokenPrice} ETH` : ''}
            </Typography>
          </div>
          <div style={{ flex: 1 }}>
            <Typography className={`${classes.tableCellStyle}`}>
              Hard Cap
            </Typography>
            <Typography className={`${classes.tableItemStyle}`}>
              {tableData.length > 0 && maxCap ? `${maxCap} ETH` : ''}
            </Typography>
          </div> */}
          </div>
        </Paper>
      );
    }
  );

  const Sale = React.memo(() => {
    const [inputValue, setInputValue] = useState("");
    const [ethBalance, setEthBalance] = useState("");
    const [warning, setWarning] = useState("");

    const paperStyle = {
      backgroundImage:
        "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
    };

    const titleStyle = {
      fontWeight: "600",
      marginBottom: "1vh",
      fontSize: "24px",
    };

    const hrStyle = {
      borderTop: "1px solid rgba(126, 153, 176, 0.2)",
      marginBottom: "3vh",
      width: "100%",
    };

    const handleInputChange = (event) => {
      setInputValue(event.target.value);
    };

    const handleBlur = () => {
      if (parseFloat(inputValue) > parseFloat(ethBalance)) {
        setWarning("Cannot exceed balance");
        setInputValue("");

        setTimeout(() => {
          setWarning("");
        }, 2700);
      }
    };

    const handleMaxClick = async () => {
      if (account && account.address) {
        // const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        // const address = accounts[0];
        const account = stores.accountStore.getStore("account");
        const balanceWei = await web3.eth.getBalance(account.address);
        const balanceEth = web3.utils.fromWei(balanceWei, "ether");

        const balanceEthtoBigNumber = new BigNumber(balanceEth);

        const maxCaptoBigNumber = new BigNumber(maxCap);
        const totalRaisedtoBigNumber = new BigNumber(totalRaised);
        if (
          balanceEthtoBigNumber.isGreaterThan(
            maxCaptoBigNumber.minus(totalRaisedtoBigNumber)
          )
        ) {
          setInputValue(
            maxCaptoBigNumber.minus(totalRaisedtoBigNumber).toString()
          );
          return;
        }
        setInputValue(balanceEth);
      }
    };

    const updateBalance = async () => {
      if (account.address) {
        const account = stores.accountStore.getStore("account");
        if (account && account.address) {
          const address = account.address;
          const balanceWei = await web3.eth.getBalance(address);
          const balanceEth = web3.utils.fromWei(balanceWei, "ether");
          const formattedBalance = parseFloat(balanceEth).toFixed(5);
          setEthBalance(formattedBalance);
        }
      }
    };

    const handleDeposit = async () => {
      if (isDepositButtonDisabled()) {
        setWarning("IDO not Started yet");
        setTimeout(() => {
          setWarning("");
        }, 3000);
        return;
      }

      if (inputValue === "" || inputValue === "0") {
        setWarning("Please enter an amount");
        setTimeout(() => {
          setWarning("");
        }, 3000);
        return;
      }

      if (
        parseFloat(inputValue) + parseFloat(totalRaised) >
        parseFloat(maxCap)
      ) {
        setWarning("Input amount exceeds hardcap");
        setTimeout(() => {
          setWarning("");
        }, 3000);
        return;
      }

      if (account.address && !isChainInvaild) {
        //const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        //const address = accounts[0];
        const account = stores.accountStore.getStore("account");

        const amountInWei = web3.utils.toWei(inputValue, "ether");

        const contract = new web3.eth.Contract(
          IDO_ABI as AbiItem[],
          contractAddress
        );
        try {
          const tx = await contract.methods.deposit().send({
            from: account.address,
            value: amountInWei,
          });

          const tx_ = await contract.methods.balanceOf(account.address).call();
          const claimable_ = web3.utils.fromWei(tx_, "ether");
          setClaimable(claimable_);
          updateBalance();
        } catch (error) {
          ////console.error("Transaction error:", error);
        }
      }
    };

    useEffect(() => {
      updateBalance();
    }, []);

    return (
      <Paper
        elevation={0}
        style={paperStyle}
        className={`${classes.saleDetailsContainer} ${classes.tableContainer}`}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1vh",
          }}
        >
          <div>
            <Typography variant="h4" style={titleStyle}>
              Sale
            </Typography>
          </div>
        </div>
        <hr style={hrStyle} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <TextField
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            label="Enter Amount"
            variant="outlined"
            onBlur={handleBlur}
            autoComplete="off"
            InputProps={{
              inputProps: {
                style: { WebkitAppearance: "none" },
                step: 1,
              },
              startAdornment: (
                <InputAdornment position="start">
                  <img src="tokens/eth_32x32.png" alt="Ethereum Icon" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleMaxClick}
                    style={{ color: "white" }}
                  >
                    MAX
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                {
                  display: "none",
                },
            }}
          />
          <Typography variant="body1" style={{ marginLeft: "1rem" }}>
            Wallet Balance: {ethBalance} ETH
          </Typography>
        </div>

        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleDeposit}
            fullWidth
            sx={{
              color: "#FF9A5F",
              backgroundColor: "white",
              border: "1px solid #FF9A5F",
              "&:hover": {
                color: "white",
                backgroundColor: "#FF9A5F",
              },
            }}
          >
            DEPOSIT
          </Button>
        </div>
        {warning && (
          <Typography
            variant="body2"
            color="error"
            style={{ marginLeft: "0.5vh" }}
          >
            {warning}
          </Typography>
        )}
      </Paper>
    );
  });

  const Claim = React.memo(() => {
    const [userPerToken, setUserPerToken] = useState("");
    const [warning, setWarning] = useState("");

    const paperStyle = {
      backgroundImage:
        "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
    };

    const titleStyle = {
      fontWeight: "600",
      marginBottom: "1vh",
      fontSize: "24px",
    };

    const hrStyle = {
      borderTop: "1px solid rgba(126, 153, 176, 0.2)",
      marginBottom: "3vh",
      width: "100%",
    };
    const inProgressItems =
      tableData.length > 0 ? tableData[tableData.length - 1] : null;

    const inprogress = inProgressItems;

    const updateTotalRaised = async () => {
      if (account.address && !isChainInvaild) {
        try {
          const tx = await minterContract.methods.totalRaised().call();
          const total_raised = web3.utils.fromWei(tx, "ether");
          setTotalRaised(total_raised);
        } catch (error) {
          ////console.error("Transaction error:", error);
        }
      }
    };

    const updateBalance = async () => {
      //const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      try {
        let claimable_;
        if (account.address && !isChainInvaild) {
          const tx = await minterContract.methods
            .balanceOf(account.address)
            .call();
          claimable_ = web3.utils.fromWei(tx, "ether");
        } else {
          claimable_ = 0;
        }

        const multicallContract = new web3.eth.Contract(
          CONTRACTS.MULTICALL_ABI as AbiItem[],
          CONTRACTS.MULTICALL_ADDRESS
        );

        const calls = [
          {
            target: CONTRACTS.IDO_ADDRESS,
            callData: minterContract.methods.tokenprice().encodeABI(),
          },
          {
            target: CONTRACTS.IDO_ADDRESS,
            callData: minterContract.methods.hardCap().encodeABI(),
          },
          {
            target: CONTRACTS.IDO_ADDRESS,
            callData: minterContract.methods.totalRaised().encodeABI(),
          },
        ];

        const aggregateRes1 = await multicallContract.methods
          .aggregate(calls)
          .call();

        const hexValues = aggregateRes1.returnData;

        const tokenPrice_ = web3.eth.abi.decodeParameter(
          "uint256",
          hexValues[0]
        );
        const tx_ = web3.eth.abi.decodeParameter("uint256", hexValues[1]);
        const tx_1 = web3.eth.abi.decodeParameter("uint256", hexValues[2]);

        const price = web3.utils.fromWei(String(tokenPrice_), "ether");
        const hardcap = web3.utils.fromWei(String(tx_), "ether");
        const total_raised = web3.utils.fromWei(String(tx_1), "ether");
        const tokenPerUser_ = BigNumber(claimable_).dividedBy(BigNumber(price));
        setClaimable(claimable_);
        setTokenPrice(price);
        setUserPerToken(tokenPerUser_.toString());
        setMaxCap(hardcap);
        setTotalRaised(total_raised);
      } catch (error) {
        ////console.error("Transaction error:", error);
      }
    };

    const handleClaim = async () => {
      if (!isWithdrawButtonDisabled()) {
        setWarning("IDO not Ended yet");
        setTimeout(() => {
          setWarning("");
        }, 3000);
        return;
      }

      if (claimable == "0") {
        setWarning("You don't have any claimable tokens");
        setTimeout(() => {
          setWarning("");
        }, 3000);
        return;
      }
      if (account.address && isChainInvaild) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];
        const account = stores.accountStore.getStore("account");

        try {
          const tx = await minterContract.methods.withdraw().send({
            from: account.address,
          });
          setClaimable("0");
          updateBalance();
        } catch (error) {
          // //console.error("Transaction error:", error);
        }
      }
    };
    useEffect(() => {
      let isMounted = true;
      updateBalance();
      const watchTotalRaisedEvent = () => {
        ////console.log("web3web3", web3);
        // TotalRaisedUpdated 이벤트를 구독합니다.
        if (isMounted) {
          minterContract.events
            .Deposit()
            .on("data", (event) => {
              // 이벤트가 발생할 때 업데이트합니다.
              updateTotalRaised();
            })
            .on("error", (error) => {
              ////console.error("Event error:", error);
            });
        } else {
          minterContract.events.Deposit().removeAllListeners();
        }
      };

      watchTotalRaisedEvent();
      return () => {
        isMounted = false;
        minterContract.events.Deposit().removeAllListeners();
      };
    }, []);

    return (
      <Paper
        elevation={0}
        style={paperStyle}
        className={`${classes.saleDetailsContainer} ${classes.tableContainer}`}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1vh",
          }}
        >
          <div>
            <Typography variant="h4" style={titleStyle}>
              Claim
            </Typography>
          </div>
        </div>
        <hr style={hrStyle} />
        <div style={{ display: "flex", flexDirection: "column-reverse" }}>
          <div style={{ display: "block" }}>
            <Typography
              variant="body1"
              style={{
                marginLeft: "1rem",
                fontSize: "16px",
                marginBottom: "1vh",
              }}
            >
              Your Deposit: {claimable} ETH
            </Typography>
            <Typography
              variant="body1"
              style={{
                marginLeft: "1rem",
                fontSize: "16px",
                marginBottom: "1vh",
              }}
            >
              Claimable: {userPerToken} {inprogress && inprogress.symbol}
            </Typography>
          </div>
          <div
            style={{ display: "block", marginBottom: "5%", marginTop: "1rem" }}
          >
            <Typography className={`${classes.claimTotalRaised}`}>
              Total Raised: {totalRaised} ETH{" "}
              {`(${(
                (parseFloat(totalRaised) / parseFloat(maxCap)) *
                100
              ).toFixed(2)}%)`}
            </Typography>
            <div style={{ width: "100%", marginTop: "1rem" }}>
              <LinearProgress
                variant="determinate"
                value={(parseFloat(totalRaised) / parseFloat(maxCap)) * 100}
                sx={{
                  height: 20,
                  borderRadius: "10px",
                  backgroundColor: "#FFDCC8",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#FF9A5F",
                    animation: "none",
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleClaim}
            fullWidth
            sx={{
              color: "FF9A5F",
              backgroundColor: "white",
              border: "1px solid #FF9A5F",
              "&:hover": {
                color: "white",
                backgroundColor: "#FF9A5F",
              },
            }}
          >
            WITHDRAW
          </Button>
        </div>
        {warning && (
          <Typography
            variant="body2"
            color="error"
            style={{ marginLeft: "0.5vh" }}
          >
            {warning}
          </Typography>
        )}
      </Paper>
    );
  });

  function getStatusColor() {
    const status = getStatus();

    switch (status) {
      case "Not Started":
        return "rgba(255, 0, 0)";
      case "In Progress":
        return "rgba(0, 255, 0)";
      case "Ended":
        return "rgba(255, 0, 0)";
      default:
        return "black";
    }
  }

  return (
    <div>
      <div style={{ width: "100%" }}>
        <Timer
          starts={updateDate}
          ends={updateDate_ends}
          shouldShowTimer={shouldShowImage}
          shouldShow={shouldShowTimerImage}
        />
      </div>
      <div className={classes.container}>
        <div className={classes.descriptionTimerBox}>
          <div className={classes.descriptionBox}>
            <Typography
              style={{
                fontSize: "52px",
                fontWeight: "400",
                color: "#000",
                fontFamily: "Buttershine Serif",
                letterSpacing: "1px",
                margin: "0 1rem",
              }}
            >
              Launchpad
            </Typography>
            <div className={classes.titleHR}></div>
            {/* <Typography style={{ fontSize: "18px", fontWeight: "400", marginTop: "10px" }}>
            /
          </Typography> */}
          </div>
        </div>
        <div style={{ marginBottom: "4vh" }}></div>
        {/* <div className={classes.topBarContainer}>
        <Grid container spacing={1}>
          <Grid item lg={true} md={true} sm={12} xs={12}>
            <Typography variant="h4" style={{ marginBottom: "10px", fontWeight: "bold" }}>List</Typography>
          </Grid>
          <Grid item lg="auto" sm={12} xs={12}>
            <div className={classes.tokenIDContainer}></div>
          </Grid>
        </Grid>
      </div> */}
        {/* <Paper elevation={0} className={classes.tableContainer}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Sale Type</TableCell>
                <TableCell>TGE</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.length > 0 ? (
                tableData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.symbol}</TableCell>
                    <TableCell>{row.startDate}</TableCell>
                    <TableCell>{row.endDate}</TableCell>
                    <TableCell>{row.saleType}</TableCell>
                    <TableCell>{row.tge}</TableCell>
                    <TableCell style={{ color: getStatusColor(), fontWeight: "bold" }}>
                      {getStatus()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>No data available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper> */}
        <SaleDetails
          tableData={tableData}
          updateDate={updateDate}
          updateDate_ends={updateDate_ends}
          shouldShowImage={shouldShowImage}
          shouldShowTimerImage={shouldShowTimerImage}
        />
        <div className={`${classes.SaleClaimMobile}`}>
          <Sale />
          <Claim />
        </div>
        <div></div>
      </div>
    </div>
  );
}

export default withTheme(Setup);
