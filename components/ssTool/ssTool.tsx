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
  IconButton,
} from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import SearchIcon from "@mui/icons-material/Search";
import Close from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import ButtonBase from "@mui/material/ButtonBase";
import { withTheme } from "@mui/styles";
import classes from "./ssTool.module.css";
import { FavoritesProvider, useFavorites } from "./FavoritesProvider";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface FavoriteListProps {
  userAddress: string;
}

const FavoriteList: React.FC<FavoriteListProps> = ({ userAddress }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { favorites, setFavorites } = useFavorites();
  const [copiedAddress, setCopiedAddress] = useState("");

  const serverAddress = "http://127.0.0.1:5000";

  const containerStyle = {
    display: "flex",
    alignItems: "center", // 수직 가운데 정렬
  };

  const addressStyle = {
    marginRight: "0.5vh", // 주소값과 아이콘 사이의 오른쪽 여백
  };

  const fetchFavorites = async () => {
    // setIsLoading(true); // 로딩 시작
    // try {
    //   const response = await fetch(`${serverAddress}/api/favorites/${userAddress}`);
    //   if (response.ok) {
    //     const data = await response.json();
    //     setFavorites(data.favorites);
    //   } else {
    //     //console.error("Failed to fetch favorites");
    //   }
    // } catch (error) {
    //   //console.error("Error fetching favorites:", error);
    // } finally {
    //   setIsLoading(false); // 로딩 종료 (무조건 실행)
    // }
  };

  const copyToClipboard = (text) => {
    // 클립보드에 복사
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // 성공적으로 복사되면 상태를 업데이트하여 메시지를 표시할 수 있습니다.
        setCopiedAddress(text);
      })
      .catch((error) => {
        ////console.error("Error copying to clipboard:", error);
      });

    setTimeout(() => {
      setCopiedAddress(null);
    }, 2500);
  };

  useEffect(() => {
    if (userAddress) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [userAddress]);

  const removeFromFavorites = async (walletAddress) => {
    try {
      const response = await fetch(`${serverAddress}/api/favorite`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_address: userAddress,
          wallet_address: walletAddress,
        }),
      });

      if (response.ok) {
        // 성공적으로 삭제되었으면 favorites 상태 업데이트
        setFavorites((prevFavorites) =>
          prevFavorites.filter((address) => address !== walletAddress)
        );
      } else {
        ////console.error("Failed to remove from favorites");
      }
    } catch (error) {
      ////console.error("Error removing from favorites:", error);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <Typography
        style={{
          marginBottom: "1.5rem",
          color: "#FF9A5F",
          whiteSpace: "pre",
          fontWeight: "600",
          fontSize: "20px",
        }}
      >
        Your Watch List
      </Typography>
      {isLoading ? (
        <CircularProgress color="secondary" />
      ) : favorites.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Wallet Address</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {favorites.map((walletAddress, index) => (
                <TableRow key={index}>
                  <TableCell style={containerStyle}>
                    <span style={addressStyle}>{walletAddress}</span>
                    <IconButton
                      onClick={() => copyToClipboard(walletAddress)}
                      style={{ padding: 0 }}
                    >
                      <FileCopyIcon style={{ color: "white", fontSize: 16 }} />
                    </IconButton>
                    {copiedAddress === walletAddress && (
                      <Typography
                        variant="body2"
                        className={`${classes.popup}`}
                      >
                        Copied!
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => removeFromFavorites(walletAddress)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography style={{ fontSize: "16px" }}>
          No favorite wallets found.
        </Typography>
      )}
    </div>
  );
};

function Setup() {
  const [viewdata, setViewData] = useState({});
  const [current_address, setAddress] = useState("");
  const [user_address, setUserAddress] = useState("");
  const initialRecentSearches = localStorage.getItem("recentSearches");
  const initialRecentSearchesArray = initialRecentSearches
    ? JSON.parse(initialRecentSearches)
    : [];
  const initialRecentSearchesSet = new Set(
    initialRecentSearchesArray.map((item) => item.trim())
  ); // 각 주소값을 trim하여 Set으로 변환
  const [recentSearches, setRecentSearches] = useState(
    initialRecentSearchesSet
  );
  const [isLoading, setIsLoading] = useState(false);

  const checkWeb3Connection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
        } else {
          // Handle case when the user disconnects their wallet
          setUserAddress(""); // Set to empty string
        }
      } catch (error) {
        ////console.error("Error connecting to Web3 wallet:", error);
      }
    } else {
      // Handle the case when there's no Ethereum provider (e.g., MetaMask not installed)
      setUserAddress(""); // Set to empty string
    }
  };
  // 로딩 이미지 JSX
  const loadingIndicator = (
    <div>
      <CircularProgress color="secondary" />
    </div>
  );

  useEffect(() => {
    checkWeb3Connection();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setUserAddress(accounts[0]);
      } else {
        // Handle case when the user disconnects their wallet
        setUserAddress(""); // Set to empty string
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      // Cleanup the event listener when the component unmounts
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  const Search = React.memo(() => {
    const [inputValue, setInputValue] = useState("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [warning, setWarning] = useState("");

    const paperStyle = {
      marginBottom: "2rem",
    };

    const titleStyle = {
      fontWeight: "600",
      fontSize: "20px",
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
      const ethAddressPattern = /^(0x)?[0-9a-fA-F]{40}$/;
      if (inputValue !== "" && !ethAddressPattern.test(inputValue)) {
        setWarning("Invalid Ethereum address format");
        setInputValue("");

        setTimeout(() => {
          setWarning("");
        }, 2700);
      }
    };

    const handleSearch = async () => {
      // if (isButtonDisabled) return;
      // setIsButtonDisabled(true);

      // // 로딩 상태를 true로 설정
      // setIsLoading(true);
      // const inputValueCopy = inputValue;
      // if (inputValueCopy === "") {
      //   setWarning("Please enter an address");
      //   setTimeout(() => {
      //     setWarning("");
      //   }, 2700);
      //   setIsButtonDisabled(false);
      //   setIsLoading(false); // 에러 발생 시 로딩 상태를 다시 false로 설정
      //   return;
      // }
      // // JSON 데이터 생성
      // const requestData = {
      //   address: inputValueCopy,
      // };

      // // 서버로 전송할 옵션 설정
      // const requestOptions = {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(requestData),
      // };

      try {
        setWarning("This feature is not yet available. Stay tuned!");
        setTimeout(() => {
          setWarning("");
        }, 5000);
        // 서버 주소 및 경로 설정
        // const serverAddress = "http://127.0.0.1:5000";
        // const apiPath = "/api/address";

        // const [response, currentAddress] = await Promise.all([
        //   fetch(`${serverAddress}${apiPath}`, requestOptions),
        //   Promise.resolve(inputValueCopy),
        // ]);

        // // 서버 응답 처리
        // if (response.status === 200) {
        //   const data = await response.json();
        //   setViewData(data);
        // } else {
        //   setWarning("Failed to process request");
        //   setViewData({});
        //   setTimeout(() => {
        //     setWarning("");
        //   }, 2700);
        // }

        // setAddress(currentAddress);
        // setRecentSearches((prevSearches) => {
        //   const newSearches = new Set(prevSearches);
        //   newSearches.add(inputValueCopy);
        //   localStorage.setItem(
        //     "recentSearches",
        //     JSON.stringify([...newSearches])
        //   );

        //   return newSearches;
        // });
      } catch (error) {
        ////console.error('Error:', error);
        setWarning("An error occurred");
        setTimeout(() => {
          setWarning("");
        }, 2700);
      } finally {
        // 요청 완료 후 로딩 상태를 false로 설정
        setIsLoading(false);
      }

      // 서버 요청 후 inputValue를 초기 값으로 복원
      // setInputValue(inputValueCopy);
      // setIsButtonDisabled(false);
    };

    const handleRecentSearchClick = (search) => {
      setInputValue(search);
    };

    const handleRemoveRecentSearch = (search) => {
      setRecentSearches((prevSearches) => {
        const newSearches = new Set(prevSearches);
        newSearches.delete(search);
        // 로컬 스토리지에서 해당 검색을 삭제합니다.
        localStorage.setItem(
          "recentSearches",
          JSON.stringify([...newSearches])
        );
        return newSearches;
      });
    };

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
            <Typography style={titleStyle}>Search Wallet</Typography>
          </div>
        </div>
        <hr style={hrStyle} />
        <div
          style={{ display: "block", margin: "0 4.5vh" }}
          className={`${classes.searcBoxhMobile}`}
        >
          <TextField
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            label="Enter Address"
            variant="outlined"
            onBlur={handleBlur}
            autoComplete="off"
            InputLabelProps={{ style: { color: "#FFAE80" } }}
            InputProps={{
              inputProps: {
                style: { WebkitAppearance: "none", color: "#FFAE80" },
                step: 1,
              },
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    onClick={() => setInputValue("")}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      outline: "none",
                      marginRight: "0.5vh",
                      boxShadow: "none",
                    }}
                    sx={{
                      "&.MuiButtonBase-root:active": {
                        backgroundColor: "transparent !important",
                        boxShadow: "none",
                        animation: "none",
                      },
                      padding: "1px",
                    }}
                  >
                    <Close style={{ color: "#FFAE80" }} />
                  </Button>
                </InputAdornment>
              ),
              startAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    color="primary"
                    aria-label="Search"
                    onClick={handleSearch}
                    disabled={isButtonDisabled}
                  >
                    <SearchIcon style={{ color: "#FFAE80" }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                {
                  display: "none",
                },
              width: "100%",
            }}
          />
          <div style={{ minHeight: "2.5vh", marginTop: "0.25vh" }}>
            {warning && (
              <Typography
                variant="body2"
                color="error"
                className={classes.warningText}
              >
                {warning}
              </Typography>
            )}
          </div>
        </div>
        {recentSearches.size > 0 && (
          <div className={classes.dropdown}>
            <ul style={{ display: "flex" }}>
              {([...recentSearches] as React.ReactNode[]).map(
                (search, index) => (
                  <li
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    style={{ marginRight: "2vh" }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "gray",
                        cursor: "pointer",
                      }}
                    >
                      {search}
                    </span>
                    <span onClick={() => handleRemoveRecentSearch(search)}>
                      <Close style={{ color: "red", fontSize: "16px" }} />
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </Paper>
    );
  });

  function formatNumber(value, decimalPlaces) {
    // 숫자로 형변환
    value = parseFloat(value);

    // 숫자가 아닌 경우 처리
    if (isNaN(value)) {
      return "Invalid Number";
    }

    // e 표기법을 가진 데이터는 그대로 반환
    if (value.toString().includes("e")) {
      return value.toString();
    }

    // 숫자를 문자열로 변환
    const stringValue = value.toString();

    // 숫자 앞에 있는 0의 개수를 세기
    let leadingZeros = 0;
    for (let i = 0; i < stringValue.length; i++) {
      if (stringValue[i] === "0") {
        leadingZeros++;
      } else {
        break;
      }
    }

    // 0이 아닌 숫자를 찾기
    let firstNonZeroIndex = -1;
    for (let i = leadingZeros; i < stringValue.length; i++) {
      if (stringValue[i] !== "0" && stringValue[i] !== ".") {
        firstNonZeroIndex = i;
        break;
      }
    }

    // 반올림 적용
    if (
      firstNonZeroIndex !== -1 &&
      firstNonZeroIndex + decimalPlaces < stringValue.length
    ) {
      // 반올림 대상을 찾았을 때
      const roundedValue = parseFloat(
        value.toFixed(decimalPlaces - leadingZeros)
      );
      return roundedValue.toString();
    } else {
      // 반올림 대상이 없을 때
      return stringValue;
    }
  }

  const Result = React.memo(() => {
    const { favorites, setFavorites } = useFavorites();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "" });
    const [warning, setWaring] = useState("");

    const columnHeaderStyle = {
      alignItems: "center",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      boxShadow: "0px 2px 4px rgba(100, 100, 100, 0.2)",
    };

    const columnHeaderArrowStyle = {
      marginLeft: "4px",
      fontSize: "12px",
    };

    const columnBodyCellStyle = {
      fontWeight: "bold",
      fontFamily: "inherit",
      fontSize: "18px",
    };

    const requestSort = (key) => {
      let direction = "ascending";
      if (sortConfig.key === key && sortConfig.direction === "ascending") {
        direction = "descending";
      }
      setSortConfig({ key, direction });
    };

    const handleFavoriteAdd = async () => {
      if (!user_address) {
        setWaring("Please connect your wallet first.");
        setTimeout(() => {
          setWaring("");
        }, 3000);
        return;
      }

      if (current_address === "") {
        setWaring("Search the wallet first.");
        setTimeout(() => {
          setWaring("");
        }, 3000);
        return;
      }

      if (favorites.includes(current_address)) {
        // Handle the case when it's already in favorites (you can show a message or take any other action)
        setWaring("Wallet address is already in favorites.");
        setTimeout(() => {
          setWaring("");
        }, 3000);
        return;
      }
      const serverAddress = "http://127.0.0.1:5000";
      try {
        const response = await fetch(`${serverAddress}/api/favorite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_address: user_address,
            wallet_address: current_address,
          }),
        });

        if (response.ok) {
          if (!favorites.includes(current_address)) {
            setFavorites([...favorites, current_address]);
          }
          ////////console.log('Added to favorites successfully.');
        } else {
          ////console.error("Failed to add to favorites");
        }
      } catch (error) {
        ////console.error("Error adding to favorites:", error);
      }
    };

    const handleCellClick = (token_address) => {
      if (token_address) {
        // 토큰 주소와 함께 링크 생성
        const link = `https://etherscan.io/address/${token_address}`;

        // 새 탭에서 링크 열기
        window.open(link, "_blank");
      }
    };

    const getClassNamesFor = (name) => {
      if (!sortConfig) {
        return;
      }
      return sortConfig.key === name ? sortConfig.direction : undefined;
    };
    // responseData 객체를 배열로 파싱
    let responseDataArray = [];

    if (typeof viewdata === "string") {
      try {
        responseDataArray = JSON.parse(viewdata);
      } catch (error) {
        // 파싱 오류 처리
        responseDataArray = [];
      }
    }

    const filteredData = responseDataArray.filter((item) => {
      let symbol = item.symbol;
      return !(symbol === "USDT" || symbol === "USDC" || symbol === "DAI");
    });

    const sortedData = [...filteredData].sort((a, b) => {
      if (sortConfig.direction === "ascending") {
        if (sortConfig.key === "symbol") {
          // SYMBOL 열을 알파벳 순서로 정렬
          return a[sortConfig.key].localeCompare(b[sortConfig.key]);
        }
        return a[sortConfig.key] - b[sortConfig.key];
      }
      if (sortConfig.direction === "descending") {
        if (sortConfig.key === "symbol") {
          // SYMBOL 열을 알파벳 역순으로 정렬
          return b[sortConfig.key].localeCompare(a[sortConfig.key]);
        }
        return b[sortConfig.key] - a[sortConfig.key];
      }
      return null;
    });

    const paperStyle = {
      backgroundImage:
        "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
    };

    const hrStyle = {
      borderTop: "1px solid rgba(126, 153, 176, 0.2)",
      marginBottom: "3vh",
      width: "100%",
    };

    return (
      <Paper
        elevation={0}
        style={paperStyle}
        className={`${classes.saleDetailsContainer} ${classes.tableContainer}`}
      >
        <Typography
          style={{ marginBottom: "1vh", fontSize: "20px", fontWeight: "600" }}
        >
          Results
        </Typography>
        <hr style={hrStyle} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "0.5vh",
          }}
          className={`${classes.ResultsMobile}`}
        >
          <div style={{ display: "flex" }}>
            <Typography style={{ padding: "1rem 0", fontSize: "18px" }}>
              Address:
            </Typography>
            <Typography
              style={{
                padding: "1rem 0",
                fontSize: "20px",
                overflow: "hidden",
              }}
            >
              {current_address}
            </Typography>
          </div>

          <Button
            color="primary"
            onClick={handleFavoriteAdd}
            style={{
              boxShadow: "1px 1px 1px 1px rgba(255, 255, 255, 0.5)",
              backgroundColor: "rgba(255, 174, 128, 0.5)",
              color: "black",
              border: "none",
            }}
            className={`${classes.addToWatchList}`}
          >
            Add to Watchlist
          </Button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "left",
            minHeight: "2.5vh",
          }}
        >
          {warning && (
            <Typography
              variant="body2"
              color="error"
              className={classes.warningText}
            >
              {warning}
            </Typography>
          )}
        </div>

        {filteredData.length > 0 ? (
          <TableContainer component={Paper}>
            <Table
              style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    style={columnHeaderStyle}
                    onClick={() => requestSort("symbol")}
                  >
                    <ButtonBase className={getClassNamesFor("symbol")}>
                      Symbol
                    </ButtonBase>
                    {sortConfig.key === "symbol" && (
                      <span
                        style={columnHeaderArrowStyle} // 화살표 스타일 적용
                      >
                        {sortConfig.direction === "ascending" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    style={columnHeaderStyle}
                    onClick={() => requestSort("realized_profit")}
                  >
                    <ButtonBase className={getClassNamesFor("realized_profit")}>
                      Realized Profit
                    </ButtonBase>
                    {sortConfig.key === "realized_profit" && (
                      <span
                        style={columnHeaderArrowStyle} // 화살표 스타일 적용
                      >
                        {sortConfig.direction === "ascending" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    style={columnHeaderStyle}
                    onClick={() => requestSort("unrealized_profit")}
                  >
                    <ButtonBase
                      className={getClassNamesFor("unrealized_profit")}
                    >
                      Unrealized Profit
                    </ButtonBase>
                    {sortConfig.key === "unrealized_profit" && (
                      <span
                        style={columnHeaderArrowStyle} // 화살표 스타일 적용
                      >
                        {sortConfig.direction === "ascending" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    style={columnHeaderStyle}
                    onClick={() => requestSort("trade_counts")}
                  >
                    <ButtonBase className={getClassNamesFor("trade_counts")}>
                      Trade Counts
                    </ButtonBase>
                    {sortConfig.key === "trade_counts" && (
                      <span
                        style={columnHeaderArrowStyle} // 화살표 스타일 적용
                      >
                        {sortConfig.direction === "ascending" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell style={columnHeaderStyle}>Avg.Buy Price</TableCell>
                  <TableCell style={columnHeaderStyle}>
                    Avg.Sell Price
                  </TableCell>
                  <TableCell
                    style={columnHeaderStyle}
                    onClick={() => requestSort("total_profit")}
                  >
                    <ButtonBase className={getClassNamesFor("total_profit")}>
                      Total Profit
                    </ButtonBase>
                    {sortConfig.key === "total_profit" && (
                      <span
                        style={columnHeaderArrowStyle} // 화살표 스타일 적용
                      >
                        {sortConfig.direction === "ascending" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((data, index) => (
                  <TableRow
                    key={index}
                    style={{
                      borderBottom: "1px solid #ddd", // 수평선 스타일 지정
                    }}
                  >
                    <TableCell
                      style={{ ...columnBodyCellStyle, cursor: "pointer" }}
                      onClick={() => handleCellClick(data.token_address)}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={data.logo}
                          alt={`${data.symbol} Logo`}
                          style={{
                            marginRight: "0.8vh",
                            width: "32px",
                            height: "32px",
                          }}
                        />
                        {data.symbol.includes("token")
                          ? data.symbol.replace("token", "")
                          : data.symbol}
                      </div>
                    </TableCell>

                    <TableCell style={columnBodyCellStyle}>
                      $ {formatNumber(data.realized_profit, 1)}
                    </TableCell>
                    <TableCell style={columnBodyCellStyle}>
                      $ {formatNumber(data.unrealized_profit, 1)}
                    </TableCell>
                    <TableCell style={columnBodyCellStyle}>
                      {data.trade_counts}
                    </TableCell>
                    <TableCell style={columnBodyCellStyle}>
                      $ {formatNumber(data.avg_buy_price, 10)}
                    </TableCell>
                    <TableCell style={columnBodyCellStyle}>
                      $ {formatNumber(data.avg_sell_price, 10)}
                    </TableCell>
                    <TableCell style={columnBodyCellStyle}>
                      $ {formatNumber(data.total_profit, 1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "1rem",
              fontSize: "16px",
            }}
          >
            No data available
          </Typography>
        )}
      </Paper>
    );
  });

  return (
    <FavoritesProvider>
      <div className={classes.container}>
        <div className={classes.descriptionTimerBox}>
          <div className={classes.descriptionBox}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="36"
                viewBox="0 0 44 40"
                fill="none"
              >
                <path
                  d="M40.25 7.75H5.25C4.78587 7.75 4.34075 7.56563 4.01256 7.23744C3.68437 6.90925 3.5 6.46413 3.5 6C3.5 5.53587 3.68437 5.09075 4.01256 4.76256C4.34075 4.43437 4.78587 4.25 5.25 4.25H35C35.4641 4.25 35.9092 4.06563 36.2374 3.73744C36.5656 3.40925 36.75 2.96413 36.75 2.5C36.75 2.03587 36.5656 1.59075 36.2374 1.26256C35.9092 0.934375 35.4641 0.75 35 0.75H5.25C3.85761 0.75 2.52226 1.30312 1.53769 2.28769C0.553124 3.27226 0 4.60761 0 6V34C0 35.3924 0.553124 36.7277 1.53769 37.7123C2.52226 38.6969 3.85761 39.25 5.25 39.25H40.25C41.1783 39.25 42.0685 38.8812 42.7249 38.2249C43.3812 37.5685 43.75 36.6783 43.75 35.75V11.25C43.75 10.3217 43.3812 9.4315 42.7249 8.77513C42.0685 8.11875 41.1783 7.75 40.25 7.75ZM32.375 25.25C31.8558 25.25 31.3483 25.096 30.9166 24.8076C30.4849 24.5192 30.1485 24.1092 29.9498 23.6295C29.7511 23.1499 29.6992 22.6221 29.8004 22.1129C29.9017 21.6037 30.1517 21.136 30.5188 20.7688C30.886 20.4017 31.3537 20.1517 31.8629 20.0504C32.3721 19.9492 32.8999 20.0011 33.3795 20.1998C33.8592 20.3985 34.2692 20.7349 34.5576 21.1666C34.846 21.5983 35 22.1058 35 22.625C35 23.3212 34.7234 23.9889 34.2312 24.4812C33.7389 24.9734 33.0712 25.25 32.375 25.25Z"
                  fill="#FF9A5F"
                />
              </svg>
              <Typography
                style={{
                  fontSize: "52px",
                  fontWeight: "400",
                  color: "#000",
                  fontFamily: "Buttershine Serif",
                  margin: "0 1rem",
                }}
              >
                Wallet Analyzer
              </Typography>
            </div>
          </div>
        </div>
        <div className={classes.titleHR}></div>
        <div style={{ marginBottom: "4vh" }}></div>
        <div
          style={{ display: "flex", width: "100%" }}
          className={`${classes.SearchAndwatchListmobile}`}
        >
          <Search />
          <FavoriteList userAddress={user_address} />
        </div>
        <div style={{ width: "100%" }}>
          {isLoading ? (
            loadingIndicator // 로딩 중일 때 로딩 이미지 표시
          ) : (
            <Result /> // 로딩이 완료되면 결과를 표시
          )}
        </div>
      </div>
    </FavoritesProvider>
  );
}

export default withTheme(Setup);
