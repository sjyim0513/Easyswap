import { useState, useEffect, useRef } from "react";
import type { AbiItem } from "web3-utils";
import { CONTRACTLIST } from "../../stores/constants/constants";
import { useRouter } from "next/router";
import {
  Paper,
  Grid,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
  IconButton,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Dialog,
} from "@mui/material";
import {
  Add,
  ArrowDownward,
  ArrowBack,
  Search,
  SyncAltSharp,
  EditOutlined,
  CloseSharp,
  ParkOutlined,
  AssessmentOutlined,
} from "@mui/icons-material";
import BigNumber from "bignumber.js";

import type { BaseAsset } from "../../stores/types/types";

import stores from "../../stores";
import {
  ACTIONS,
  W_NATIVE_ADDRESS_LIST,
} from "../../stores/constants/constants";
import { formatCurrency } from "../../utils/utils";

import classes from "./ssLiquidityManage.module.css";

const initialEmptyToken = {
  id: "0",
  lockAmount: "0",
  lockEnds: "0",
  lockValue: "0",
};

let CONTRACTS;

import Web3 from "web3";
import { supportedChainIdList } from "../../stores/connectors/connectors";

export default function ssLiquidityManage() {
  const router = useRouter();
  const amount0Ref = useRef(null);
  const amount1Ref = useRef(null);

  const [pairReadOnly, setPairReadOnly] = useState(false);

  const [pair, setPair] = useState(null);

  const [depositLoading, setDepositLoading] = useState(false);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [depositStakeLoading, setDepositStakeLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [amount0, setAmount0] = useState("");
  const [amount0Error, setAmount0Error] = useState<string | false>(false);
  const [amount1, setAmount1] = useState("");
  const [amount1Error, setAmount1Error] = useState<string | false>(false);

  const [stable, setStable] = useState(false);

  const [asset0, setAsset0] = useState(null);
  const [asset1, setAsset1] = useState(null);
  const [assetOptions, setAssetOptions] = useState([]);

  const [withdrawAsset, setWithdrawAsset] = useState(null);
  const [withdrawAassetOptions, setWithdrawAssetOptions] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAmountError, setWithdrawAmountError] = useState<
    string | false
  >(false);

  const [withdrawAmount0, setWithdrawAmount0] = useState("");
  const [withdrawAmount1, setWithdrawAmount1] = useState("");

  // const [withdrawAmount0Percent, setWithdrawAmount0Percent] = useState("");
  // const [withdrawAmount1Percent, setWithdrawAmount1Percent] = useState("");

  const [activeTab, setActiveTab] = useState("deposit");
  const [quote, setQuote] = useState(null);
  const [withdrawQuote, setWithdrawQuote] = useState(null);

  const [priorityAsset, setPriorityAsset] = useState(0);
  const [advanced, setAdvanced] = useState(false);

  const [token, setToken] = useState(initialEmptyToken);
  const liq_slippage = stores.accountStore.getStore("liquidity_slippage");
  const [slippage, setSlippage] = useState(liq_slippage);
  const slp_slippage_ = stores.accountStore.getStore("swap_slippage");
  const [slp_slippage, setSlpSlippage] = useState(slp_slippage_);
  const [slippageError, setSlippageError] = useState(false);
  const [shouldShowImage, setShouldShowImage] = useState(
    window.innerWidth >= 1280
  );
  const [shouldShowSymbol, setShouldShowSymbol] = useState(
    window.innerWidth >= 600
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMainnet, setIsMainnet] = useState(true);

  const SettingModal = ({ onClose }) => {
    const [slippage_, setSlippage_] = useState(slippage);
    const [slp_slippage_, setSlpSlippage_] = useState(slp_slippage);
    const handleSlippageChanged = (newSlippage) => {
      if (newSlippage || Object.keys(newSlippage).length > 0) {
        setSlippage_(newSlippage);
      } else {
        setSlippage_(slippage_);
      }
    };

    const handleSLPSlippageChanged = (newSlippage) => {
      if (newSlippage || Object.keys(newSlippage).length > 0) {
        setSlpSlippage_(newSlippage);
      } else {
        setSlpSlippage_(slp_slippage_);
      }
    };

    const handleClose = () => {
      onClose({ slippage_, slp_slippage_ });
    };

    return (
      <Dialog
        open={isModalOpen}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ style: { overflowY: "hidden" } }}
      >
        <div className={`${classes.settingModal}`}>
          <div className={`${classes.modalContent}`}>
            <div className={`${classes.modalHeader}`}>
              <Typography style={{ fontSize: "14px", fontWeight: "bold" }}>
                Slippage
              </Typography>
              <div
                style={{
                  display: "flex",
                  justifyContent: "end",
                  height: "fit-content",
                }}
              >
                <button className="close-button" onClick={handleClose}>
                  <CloseSharp />
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div
                style={{
                  display: "flex",
                  padding: "0 1rem",
                  marginBottom: "2rem",
                }}
              >
                {renderSmallInput(
                  "slippage",
                  slippage,
                  slp_slippage,
                  slippageError,
                  onSlippageChanged,
                  handleSlippageChanged,
                  handleSLPSlippageChanged
                )}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    );
  };

  const openSettingModal = () => {
    setIsModalOpen(true);
  };

  const closeSettingModal = (props) => {
    setIsModalOpen(false);
    setSlippage(props.slippage_);
    setSlpSlippage(props.slp_slippage_);
    // if (typeof props === "number") {
    //   setSlippage(props.toString());
    // } else {
    //   setSlippage(props);
    // }
  };

  const ssUpdated = async () => {
    //console.log("ssUpdated");
    const chain = stores.accountStore.getStore("chainId");
    const isChainSupported = supportedChainIdList.includes(chain);
    if (isChainSupported) {
      CONTRACTS = CONTRACTLIST[chain];
    } else {
      CONTRACTS = CONTRACTLIST[3441005];
    }
    if (chain === 169) {
      setIsMainnet(true);
    } else {
      setIsMainnet(false);
    }
    //console.log("chain", chain);
    const storeAssetOptions = stores.stableSwapStore.getStore("baseAssets");
    //console.log("storeAssetOptions", storeAssetOptions);
    const pairs = stores.stableSwapStore.getStore("pairs");
    const onlyWithBalance = pairs.filter((ppp) => {
      return (
        BigNumber(ppp.balance).gt(0) ||
        (ppp.gauge && BigNumber(ppp.gauge.balance).gt(0))
      );
    });
    setWithdrawAssetOptions(onlyWithBalance);
    setAssetOptions(storeAssetOptions);
    setSLPcount(1);
    const add = router.query.add;

    if (add && add !== "create") {
      setPairReadOnly(true);

      const pp = pairs.find((ppp) => add === ppp.address);
      setPair(pp);

      if (pp) {
        //console.log("create");
        setWithdrawAsset(pp);
        setAsset0(pp.token0);
        setAsset1(pp.token1);
        setStable(pp.isStable);
      }

      // if (pp && BigNumber(pp.balance).gt(0)) {
      //   setAdvanced(true);
      // }
    } else {
      let aa0 = asset0;
      let aa1 = asset1;
      if (storeAssetOptions.length > 0 && asset0 == null) {
        setAsset0(storeAssetOptions[0]);
        aa0 = storeAssetOptions[0];
      }
      if (storeAssetOptions.length > 0 && asset1 == null) {
        setAsset1(storeAssetOptions[1]);
        aa1 = storeAssetOptions[1];
      }
      if (withdrawAassetOptions.length > 0 && withdrawAsset == null) {
        setWithdrawAsset(withdrawAassetOptions[1]);
      }

      if (aa0 && aa1) {
        const p = await stores.stableSwapStore.getPair(
          aa0.address,
          aa1.address,
          stable,
          aa0.symbol,
          aa1.symbol
        );
        setPair(p);
      }
    }
  };

  useEffect(() => {
    const depositReturned = () => {
      setDepositLoading(false);
      setStakeLoading(false);
      setDepositStakeLoading(false);
      setCreateLoading(false);

      setAmount0("");
      setAmount1("");
      setQuote(null);
      setWithdrawAmount("");
      setWithdrawAmount0("");
      setWithdrawAmount1("");
      setWithdrawQuote(null);

      onBack();
    };

    const createGaugeReturned = () => {
      setCreateLoading(false);
      ssUpdated();
    };

    const errorReturned = () => {
      setDepositLoading(false);
      setStakeLoading(false);
      setDepositStakeLoading(false);
      setCreateLoading(false);
    };

    const quoteAddReturned = (res) => {
      setQuote(res.output);
    };

    const quoteRemoveReturned = (res) => {
      if (!res) {
        return;
      }
      setWithdrawQuote(res.output);
      setWithdrawAmount0(res.output.amount0);
      setWithdrawAmount1(res.output.amount1);
    };

    const assetsUpdated = () => {
      setAssetOptions(stores.stableSwapStore.getStore("baseAssets"));
    };

    stores.emitter.on(ACTIONS.UPDATED, ssUpdated);
    stores.emitter.on(ACTIONS.LIQUIDITY_ADDED, depositReturned);
    stores.emitter.on(ACTIONS.ADD_LIQUIDITY_AND_STAKED, depositReturned);
    stores.emitter.on(ACTIONS.LIQUIDITY_REMOVED, depositReturned);
    stores.emitter.on(ACTIONS.REMOVE_LIQUIDITY_AND_UNSTAKED, depositReturned);
    stores.emitter.on(ACTIONS.LIQUIDITY_STAKED, depositReturned);
    stores.emitter.on(ACTIONS.LIQUIDITY_UNSTAKED, depositReturned);
    stores.emitter.on(ACTIONS.PAIR_CREATED, depositReturned);
    stores.emitter.on(ACTIONS.QUOTE_ADD_LIQUIDITY_RETURNED, quoteAddReturned);
    stores.emitter.on(
      ACTIONS.QUOTE_REMOVE_LIQUIDITY_RETURNED,
      quoteRemoveReturned
    );
    stores.emitter.on(ACTIONS.CREATE_GAUGE_RETURNED, createGaugeReturned);
    stores.emitter.on(ACTIONS.BASE_ASSETS_UPDATED, assetsUpdated);
    stores.emitter.on(ACTIONS.ERROR, errorReturned);

    const handleResize = () => {
      const newWindowWidth = window.innerWidth;
      setShouldShowImage(newWindowWidth >= 1280);
      setShouldShowSymbol(newWindowWidth >= 600);
    };

    window.addEventListener("resize", handleResize);
    ssUpdated();

    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated);
      stores.emitter.removeListener(ACTIONS.LIQUIDITY_ADDED, depositReturned);
      stores.emitter.removeListener(
        ACTIONS.ADD_LIQUIDITY_AND_STAKED,
        depositReturned
      );
      stores.emitter.removeListener(ACTIONS.LIQUIDITY_REMOVED, depositReturned);
      stores.emitter.removeListener(
        ACTIONS.REMOVE_LIQUIDITY_AND_UNSTAKED,
        depositReturned
      );
      stores.emitter.removeListener(ACTIONS.LIQUIDITY_STAKED, depositReturned);
      stores.emitter.removeListener(
        ACTIONS.LIQUIDITY_UNSTAKED,
        depositReturned
      );
      stores.emitter.removeListener(ACTIONS.PAIR_CREATED, depositReturned);
      stores.emitter.removeListener(
        ACTIONS.QUOTE_ADD_LIQUIDITY_RETURNED,
        quoteAddReturned
      );
      stores.emitter.removeListener(
        ACTIONS.QUOTE_REMOVE_LIQUIDITY_RETURNED,
        quoteRemoveReturned
      );
      stores.emitter.removeListener(
        ACTIONS.CREATE_GAUGE_RETURNED,
        createGaugeReturned
      );
      stores.emitter.removeListener(ACTIONS.BASE_ASSETS_UPDATED, assetsUpdated);
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    ssUpdated();
  }, [router.query]);

  const onBack = () => {
    router.push("/liquidity");
  };

  const callQuoteAddLiquidity = (
    amountA,
    amountB,
    pa,
    sta,
    pp,
    assetA,
    assetB
  ) => {
    if (!pp) {
      return null;
    }

    let invert = false;
    //TODO: Add check that asset0.address === pp.token0, otherwise we need to invert the calcs

    let addy0 = assetA.address;
    let addy1 = assetB.address;

    const chain = stores.accountStore.getStore("chainId");
    if (assetA.symbol === "ETH") {
      addy0 = W_NATIVE_ADDRESS_LIST[chain];
    }
    if (assetB.symbol === "ETH") {
      addy1 = W_NATIVE_ADDRESS_LIST[chain];
    }

    if (
      addy1.toLowerCase() == pp.token0.address.toLowerCase() &&
      addy0.toLowerCase() == pp.token1.address.toLowerCase()
    ) {
      invert = true;
    }

    if (pa == 0) {
      if (amountA == "") {
        setAmount1("");
      } else {
        if (invert) {
          amountB = BigNumber(amountA)
            .times(pp.reserve0)
            .div(pp.reserve1)
            .toFixed(pp.token0.decimals > 6 ? 6 : pp.token0.decimals);
        } else {
          amountB = BigNumber(amountA)
            .times(pp.reserve1)
            .div(pp.reserve0)
            .toFixed(pp.token1.decimals > 6 ? 6 : pp.token1.decimals);
        }
        setAmount1(amountB);
      }
    }
    if (pa == 1) {
      if (amountB == "") {
        setAmount0("");
      } else {
        if (invert) {
          amountA = BigNumber(amountB)
            .times(pp.reserve1)
            .div(pp.reserve0)
            .toFixed(pp.token1.decimals > 6 ? 6 : pp.token1.decimals);
        } else {
          amountA = BigNumber(amountB)
            .times(pp.reserve0)
            .div(pp.reserve1)
            .toFixed(pp.token0.decimals > 6 ? 6 : pp.token0.decimals);
        }
        setAmount0(amountA);
      }
    }

    if (
      BigNumber(amountA).lte(0) ||
      BigNumber(amountB).lte(0) ||
      isNaN(amountA) ||
      isNaN(amountB)
    ) {
      return null;
    }

    stores.dispatcher.dispatch({
      type: ACTIONS.QUOTE_ADD_LIQUIDITY,
      content: {
        pair: pp,
        token0: pp.token0,
        token1: pp.token1,
        amount0: amountA,
        amount1: amountB,
        stable: sta,
      },
    });
  };

  const callQuoteRemoveLiquidity = (p, amount) => {
    if (!pair) {
      return null;
    }

    stores.dispatcher.dispatch({
      type: ACTIONS.QUOTE_REMOVE_LIQUIDITY,
      content: {
        pair: p,
        token0: p.token0,
        token1: p.token1,
        withdrawAmount: amount,
      },
    });
  };

  const swapAssets = () => {
    const fa = asset0;
    const ta = asset1;
    setAsset0(ta);
    setAsset1(fa);
    //callQuoteAddLiquidity(amount1, amount0, 0, stable, pair, ta, fa);
  };

  const handleChange = (event) => {
    setToken(event.target.value);
  };

  const onSlippageChanged = (event) => {
    if (event.target.value == "" || !isNaN(event.target.value)) {
      setSlippage(event.target.value);
    }
  };

  const setAmountPercent = (input, percent) => {
    setAmount0Error(false);
    setAmount1Error(false);

    if (input === "amount0") {
      let am = BigNumber(asset0.balance)
        .times(percent)
        .div(100)
        .toFixed(asset0.decimals);
      setAmount0(am);
      amount0Ref.current.focus();
      callQuoteAddLiquidity(am, amount1, 0, stable, pair, asset0, asset1);
    } else if (input === "amount1") {
      let am = BigNumber(asset1.balance)
        .times(percent)
        .div(100)
        .toFixed(asset1.decimals);
      setAmount1(am);
      amount1Ref.current.focus();
      callQuoteAddLiquidity(amount0, am, 1, stable, pair, asset0, asset1);
    } else if (input === "withdraw") {
      let am = "";
      if (pair && pair.gauge && pair.gauge.balance > 0) {
        am = BigNumber(pair.gauge.balance).times(percent).div(100).toFixed(18);
        setWithdrawAmount(am);
      } else {
        am = BigNumber(pair.balance).times(percent).div(100).toFixed(18);
        setWithdrawAmount(am);
      }

      if (am === "") {
        setWithdrawAmount0("");
        setWithdrawAmount1("");
      } else if (am !== "" && !isNaN(+am)) {
        calcRemove(pair, am);
      }
    }
  };

  const calLiquidity = () => {
    let reserve0;
    let reserve1;
    let decimals0;
    let decimals1;

    // asset0가 pair의 token0이면 그대로 가고 아니면 바꿈
    // pair.token0 = EASY, pair.token1 = USDC
    // CASE1) asset0 - USDC, asset1 - EASY -> amountADesired = USDC, amountBDesired = EASY -> reserve0 = USDC reserve, reserve1 = EASY reserve
    // CASE2) asset1 - USDC, asset0 - EASY -> amountADesired = EASY, amountBDesired = USDC -> reserve0 = EASY reserve, reserve1 = USDC reserve
    if (asset0.address.toLowerCase() === pair.token0.address.toLowerCase()) {
      reserve0 = pair.reserve0;
      reserve1 = pair.reserve1;
      decimals0 = pair.token0.decimals;
      decimals1 = pair.token1.decimals;
    } else {
      reserve0 = pair.reserve1;
      reserve1 = pair.reserve0;
      decimals0 = pair.token1.decimals;
      decimals1 = pair.token0.decimals;
    }

    const amountADesired = BigNumber(amount0).times(10 ** decimals0);
    const amountBDesired = BigNumber(amount1).times(10 ** decimals1);

    const amountAOptimal = amountBDesired
      .times(reserve0)
      .times(10 ** decimals0)
      .div(reserve1)
      .div(10 ** decimals1);
    const amountBOptimal = amountADesired
      .times(reserve1)
      .times(10 ** decimals1)
      .div(reserve0)
      .div(10 ** decimals0);
    //console.log("ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ");
    //console.log("cal pair", pair);
    //console.log("asset0", asset0.symbol, reserve0, decimals0, amount0);
    //console.log("asset1", asset1.symbol, reserve1, decimals1, amount1);

    const sendSlippage = BigNumber(100).minus(slippage).div(100);

    const amountBmin = amountBDesired.times(sendSlippage).toNumber();
    const amountAmin = amountADesired.times(sendSlippage).toNumber();

    // //console.log(
    //   `amountBOptimal : ${amountBOptimal.toFixed()},
    //   amountBDesired : ${amountBDesired.toFixed()},
    //   amountBmin : ${amountBmin}`
    // );

    // //console.log(
    //   `amountAOptimal : ${amountAOptimal.toFixed()},
    //   amountADesired : ${amountADesired.toFixed()},
    //   amountAmin : ${amountAmin}`
    // );

    if (amountBOptimal.toNumber() <= amountBDesired.toNumber()) {
      if (amountBOptimal.toNumber() < amountBmin) {
        const minslippage = amountBOptimal
          .times(100)
          .div(amountBDesired)
          .toNumber();
        const roundedPriceimpact =
          Math.ceil((100 - minslippage) * 10000) / 10000;
        return `Increase Liquidity Slippage to ${roundedPriceimpact}`;
      }
    } else {
      if (amountAOptimal.toNumber() > amountADesired.toNumber()) {
        return "Insufficient Liquidity";
      }

      if (amountAOptimal.toNumber() < amountAmin) {
        const minslippage = amountAOptimal
          .times(100)
          .div(amountADesired)
          .toNumber();
        const roundedPriceimpact =
          Math.ceil((100 - minslippage) * 10000) / 10000;
        return `Increase Liquidity Slippage to ${roundedPriceimpact}`;
      }
    }
  };

  const onDeposit = async () => {
    setAmount0Error(false);
    setAmount1Error(false);

    let error = false;

    if (!amount0 || amount0 === "" || isNaN(+amount0)) {
      setAmount0Error("Amount 0 is required");
      error = true;
    } else {
      if (
        !asset0.balance ||
        isNaN(asset0.balance) ||
        BigNumber(asset0.balance).lte(0)
      ) {
        setAmount0Error("Invalid balance");
        error = true;
      } else if (BigNumber(amount0).lte(0)) {
        setAmount0Error("Invalid amount");
        error = true;
      } else if (asset0 && BigNumber(amount0).gt(asset0.balance)) {
        setAmount0Error(`Greater than your available balance`);
        error = true;
      } else {
        const calLiqResult = calLiquidity();
        if (calLiqResult) {
          setAmount0Error(calLiqResult);
          error = true;
        }
      }
    }

    if (!amount1 || amount1 === "" || isNaN(+amount1)) {
      setAmount1Error("Amount 0 is required");
      error = true;
    } else {
      if (
        !asset1.balance ||
        isNaN(asset1.balance) ||
        BigNumber(asset1.balance).lte(0)
      ) {
        setAmount1Error("Invalid balance");
        error = true;
      } else if (BigNumber(amount1).lte(0)) {
        setAmount1Error("Invalid amount");
        error = true;
      } else if (asset1 && BigNumber(amount1).gt(asset1.balance)) {
        setAmount1Error(`Greater than your available balance`);
        error = true;
      } else {
        const calLiqResult = calLiquidity();
        if (calLiqResult) {
          setAmount1Error(calLiqResult);
          error = true;
        }
      }
    }

    if (!error) {
      setDepositLoading(true);

      stores.dispatcher.dispatch({
        type: ACTIONS.ADD_LIQUIDITY,
        content: {
          pair: pair,
          token0: asset0,
          token1: asset1,
          amount0: amount0,
          amount1: amount1,
          minLiquidity: quote ? quote : "0",
          slippage: slippage && slippage != "" ? slippage : "2",
        },
      });
    }
  };

  const onStake = () => {
    setAmount0Error(false);
    setAmount1Error(false);

    let error = false;

    if (!error) {
      setStakeLoading(true);

      stores.dispatcher.dispatch({
        type: ACTIONS.STAKE_LIQUIDITY,
        content: {
          pair: pair,
          slippage: slippage && slippage != "" ? slippage : "2",
        },
      });
    }
  };

  const onDepositAndStake = () => {
    setAmount0Error(false);
    setAmount1Error(false);

    let error = false;

    if (!amount0 || amount0 === "" || isNaN(+amount0)) {
      setAmount0Error("Amount 0 is required");
      error = true;
    } else {
      if (
        !asset0.balance ||
        isNaN(asset0.balance) ||
        BigNumber(asset0.balance).lte(0)
      ) {
        setAmount0Error("Invalid balance");
        error = true;
      } else if (BigNumber(amount0).lte(0)) {
        setAmount0Error("Invalid amount");
        error = true;
      } else if (asset0 && BigNumber(amount0).gt(asset0.balance)) {
        setAmount0Error(`Greater than your available balance`);
        error = true;
      } else {
        const calLiqResult = calLiquidity();
        if (calLiqResult) {
          setAmount0Error(calLiqResult);
          error = true;
        }
      }
    }

    if (!amount1 || amount1 === "" || isNaN(+amount1)) {
      setAmount1Error("Amount 0 is required");
      error = true;
    } else {
      if (
        !asset1.balance ||
        isNaN(asset1.balance) ||
        BigNumber(asset1.balance).lte(0)
      ) {
        setAmount1Error("Invalid balance");
        error = true;
      } else if (BigNumber(amount1).lte(0)) {
        setAmount1Error("Invalid amount");
        error = true;
      } else if (asset1 && BigNumber(amount1).gt(asset1.balance)) {
        setAmount1Error(`Greater than your available balance`);
        error = true;
      } else {
        const calLiqResult = calLiquidity();
        if (calLiqResult) {
          setAmount1Error(calLiqResult);
          error = true;
        }
      }
    }

    if (!error) {
      setDepositStakeLoading(true);
      stores.dispatcher.dispatch({
        type: ACTIONS.ADD_LIQUIDITY_AND_STAKE,
        content: {
          pair: pair,
          token0: asset0,
          token1: asset1,
          amount0: amount0,
          amount1: amount1,
          minLiquidity: quote ? quote : "0",
          slippage: slippage && slippage != "" ? slippage : "2",
        },
      });
    }
  };

  const onCreateAndStake = () => {
    setAmount0Error(false);
    setAmount1Error(false);

    let error = false;

    if (!amount0 || amount0 === "" || isNaN(+amount0)) {
      setAmount0Error("Amount 0 is required");
      error = true;
    } else {
      if (
        !asset0.balance ||
        isNaN(asset0.balance) ||
        BigNumber(asset0.balance).lte(0)
      ) {
        setAmount0Error("Invalid balance");
        error = true;
      } else if (BigNumber(amount0).lte(0)) {
        setAmount0Error("Invalid amount");
        error = true;
      } else if (asset0 && BigNumber(amount0).gt(asset0.balance)) {
        setAmount0Error(`Greater than your available balance`);
        error = true;
      }
    }

    if (!amount1 || amount1 === "" || isNaN(+amount1)) {
      setAmount1Error("Amount 0 is required");
      error = true;
    } else {
      if (
        !asset1.balance ||
        isNaN(asset1.balance) ||
        BigNumber(asset1.balance).lte(0)
      ) {
        setAmount1Error("Invalid balance");
        error = true;
      } else if (BigNumber(amount1).lte(0)) {
        setAmount1Error("Invalid amount");
        error = true;
      } else if (asset1 && BigNumber(amount1).gt(asset1.balance)) {
        setAmount1Error(`Greater than your available balance`);
        error = true;
      }
    }

    if (!asset0 || asset0 === null) {
      setAmount0Error("Asset is required");
      error = true;
    }

    if (!asset1 || asset1 === null) {
      setAmount1Error("Asset is required");
      error = true;
    }

    if (!error) {
      setCreateLoading(true);
      stores.dispatcher.dispatch({
        type: ACTIONS.CREATE_PAIR_AND_STAKE,
        content: {
          token0: asset0,
          token1: asset1,
          amount0: amount0,
          amount1: amount1,
          isStable: stable,
          slippage: slippage && slippage != "" ? slippage : "2",
        },
      });
    }
  };

  const [SLPCount, setSLPcount] = useState(1);
  const [estimatedSLP, setEstimateSLP] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (SLPCount === 2) {
        const result = await estimateSLP(pair, pair.token0, withdrawAmount);
        setEstimateSLP(result);
        //setPairReadOnly(true);
      } else if (SLPCount === 3) {
        const result = await estimateSLP(pair, pair.token1, withdrawAmount);
        setEstimateSLP(result);
        //setPairReadOnly(true);
      } else {
        setPairReadOnly(false);
      }
    };

    fetchData();
  }, [SLPCount, pair, withdrawAmount]);

  const estimateSLP = async (pair, token, amount) => {
    if (!amount || !token || !pair) {
      return 0;
    }

    const web3 = await stores.accountStore.getWeb3Provider();

    if (!web3) {
      //////console.warn("web3 not found");
      return null;
    }

    const slpContract = new web3.eth.Contract(
      CONTRACTS.SLP_ABI as AbiItem[],
      CONTRACTS.SLP_ADDRESS
    );

    const Lpbalance = amount;

    const LpAmount = BigNumber(Lpbalance)
      .times(10 ** token.decimals)
      .toFixed(0);

    const estimated = await slpContract.methods
      .estimateSlpOutSwap(pair.address, LpAmount, token.address)
      .call();
    let result = 0;

    if (SLPCount === 2) {
      result =
        estimated[1] / 10 ** token.decimals +
        (parseFloat(Lpbalance) / Number(pair.totalSupply)) * pair.reserve0;
    } else if (SLPCount === 3) {
      result =
        estimated[1] / 10 ** token.decimals +
        (parseFloat(Lpbalance) / Number(pair.totalSupply)) * pair.reserve1;
    }

    setEstimateSLP(result);
  };

  const calSLP = async (flag) => {
    let assetA = flag ? asset0 : asset1;
    let assetB = flag ? asset1 : asset0;
    const amount = flag ? amount0 : amount1;
    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      return null;
    }

    let reserve0;
    let reserve1;

    if (assetA.address.toLowerCase() === pair.token0.address.toLowerCase()) {
      reserve0 = pair.reserve0;
      reserve1 = pair.reserve1;
    } else {
      reserve0 = pair.reserve1;
      reserve1 = pair.reserve0;
    }

    if (asset0.symbol === "ETH") {
      const baseAssets = stores.stableSwapStore.getStore("baseAssets");
      const eth = baseAssets.find((asset) => asset.symbol === "WETH");
      if (flag) {
        assetA.address = eth.address;
      } else {
        assetB.address = eth.address;
      }
    }

    if (asset1.symbol === "ETH") {
      const baseAssets = stores.stableSwapStore.getStore("baseAssets");
      const eth = baseAssets.find((asset) => asset.symbol === "WETH");
      if (flag) {
        assetB.address = eth.address;
      } else {
        assetA.address = eth.address;
      }
    }

    const slpContract = new web3.eth.Contract(
      CONTRACTS.SLP_ABI as AbiItem[],
      CONTRACTS.SLP_ADDRESS
    );
    const routerContract = new web3.eth.Contract(
      CONTRACTS.ROUTER_ABI as AbiItem[],
      CONTRACTS.ROUTER_ADDRESS
    );

    const AamountToSwap = await slpContract.methods
      .calculateAmountToSwap(
        pair.address,
        BigNumber(amount).times(10 ** assetA.decimals),
        assetA.address
      )
      .call();

    const payload = {
      content: {
        fromAsset: assetA,
        toAsset: assetB,
        fromAmount: BigNumber(AamountToSwap).div(10 ** assetA.decimals),
      },
    };

    const returnValues = await stores.stableSwapStore.quoteSwap(payload);

    const priceimpact = returnValues.priceImpact;

    if (BigNumber(priceimpact).gt(slp_slippage)) {
      const slippage = parseFloat(priceimpact);
      const roundedPriceimpact = Math.ceil(slippage * 10000) / 10000;
      return `Increase SLP Slippage to ${roundedPriceimpact}`;
    }

    const amountBout = returnValues.output.receiveAmounts[1];

    //console.log("amountBout", amountBout);

    const amountADesired = BigNumber(amount)
      .times(10 ** assetA.decimals)
      .minus(AamountToSwap);

    const amountBDesired = BigNumber(amountBout);
    const re = amountBDesired.div(10 ** assetB.decimals);
    const swapSlippage = BigNumber(100).minus(slp_slippage).div(100);
    const amountOutmin = Math.floor(re.times(swapSlippage).toNumber());

    // const swapSlippage = BigNumber(100).minus(slp_slippage).div(100);
    // const amountOutmin = BigNumber(amountBout).times(swapSlippage).toNumber();
    //console.log("min", amountOutmin);

    //console.log("pair", pair);
    //console.log("amount", amount);
    //console.log("A", reserve0, assetA.symbol, assetA.decimals);
    //console.log("B", reserve1, assetB.symbol, assetB.decimals);

    const amountAOptimal = amountBDesired
      .times(reserve0)
      .times(10 ** assetA.decimals)
      .div(reserve1)
      .div(10 ** assetB.decimals);
    const amountBOptimal = amountADesired
      .times(reserve1)
      .times(10 ** assetB.decimals)
      .div(reserve0)
      .div(10 ** assetA.decimals);

    const sendSlippage = BigNumber(100).minus(slippage).div(100);
    const amountBmin = amountBDesired.times(sendSlippage).toFixed();
    const amountAmin = amountADesired.times(sendSlippage).toFixed();

    // //console.log(
    //   `amountBOptimal : ${amountBOptimal.toFixed()},
    //   amountBDesired : ${amountBDesired.toFixed()},
    //   amountBmin : ${amountBmin}`
    // );

    // //console.log(
    //   `amountAOptimal : ${amountAOptimal.toFixed()},
    //   amountADesired : ${amountADesired.toFixed()},
    //   amountAmin : ${amountAmin}`
    // );

    // 2. amountBOptimal quoteLiquidity(amountADesired, reserveA, reserveB) >= amountBmin
    // 3. amountAOptimal quoteLiquidity(amountBDesired, reserveB, reserveA) <= amountAdesired
    // 4. amountAOptimal quoteLiquidity(amountBDesired, reserveB, reserveA) >= amountAmin

    if (amountBOptimal.toNumber() <= amountBDesired.toNumber()) {
      if (amountBOptimal.toNumber() < Number(amountBmin)) {
        const minslippage = amountBOptimal
          .times(100)
          .div(amountBDesired)
          .toNumber();
        const roundedPriceimpact =
          Math.ceil((100 - minslippage) * 10000) / 10000;
        return `Increase Liquidity Slippage to ${roundedPriceimpact}`;
      }
    } else {
      if (amountAOptimal.toNumber() > amountADesired.toNumber()) {
        return "Insufficient Liquidity";
      }
      if (amountAOptimal.toNumber() < Number(amountAmin)) {
        const minslippage = amountAOptimal
          .times(100)
          .div(amountADesired)
          .toNumber();

        const roundedPriceimpact =
          Math.ceil((100 - minslippage) * 10000) / 10000;
        return `Increase Liquidity Slippage to ${roundedPriceimpact}`;
      }
    }
    return amountOutmin;
  };

  const onSLPDeposit = async (symbol) => {
    setAmount0Error(false);
    let error = false;
    let swapMin = "";
    let reserve;
    if (SLPCount === 2) {
      if (asset0.address.toLowerCase() === pair.token0.address.toLowerCase()) {
        reserve = pair.reserve0;
      } else {
        reserve = pair.reserve1;
      }
      //console.log("reserve0", reserve, asset0.symbol, pair);
      if (!amount0 || amount0 === "" || isNaN(+amount0)) {
        setAmount0Error("Amount 0 is required");
        error = true;
      } else {
        if (
          !asset0.balance ||
          isNaN(asset0.balance) ||
          BigNumber(asset0.balance).lte(0)
        ) {
          setAmount0Error("Invalid balance");
          error = true;
        } else if (BigNumber(amount0).lte(0)) {
          setAmount0Error("Invalid amount");
          error = true;
        } else if (asset0 && BigNumber(amount0).gt(asset0.balance)) {
          setAmount0Error(`Greater than your available balance`);
          error = true;
        } else if (
          asset0 &&
          BigNumber(amount0).gt(BigNumber(pair.reserve).dividedBy(2))
        ) {
          setAmount0Error(`Insufficient Liquidity`);
          error = true;
        } else {
          const calSLPResult = await calSLP(true);
          if (typeof calSLPResult === "string") {
            setAmount0Error(calSLPResult);
            error = true;
          } else {
            swapMin = String(calSLPResult);
            //console.log("swapMin", swapMin);
          }
        }
      }
      if (!error) {
        setDepositLoading(true);
        stores.dispatcher.dispatch({
          type: ACTIONS.SLP_LIQUIDITY,
          content: {
            pair: pair,
            single: asset0,
            amount: amount0,
            swapMin: swapMin,
            slippage: slippage && slippage != "" ? slippage : "2",
          },
        });
      }
    } else if (SLPCount === 3) {
      if (asset1.address.toLowerCase() === pair.token0.address.toLowerCase()) {
        reserve = pair.reserve0;
      } else {
        reserve = pair.reserve1;
      }
      //console.log("reserve1", reserve, asset1.symbol, pair);
      if (!amount1 || amount1 === "" || isNaN(+amount1)) {
        setAmount1Error("Amount 1 is required");
        error = true;
      } else {
        if (
          !asset1.balance ||
          isNaN(asset1.balance) ||
          BigNumber(asset1.balance).lte(0)
        ) {
          setAmount1Error("Invalid balance");
          error = true;
        } else if (BigNumber(amount1).lte(0)) {
          setAmount1Error("Invalid amount");
          error = true;
        } else if (asset1 && BigNumber(amount1).gt(asset1.balance)) {
          setAmount1Error(`Greater than your available balance`);
          error = true;
        } else if (
          asset1 &&
          BigNumber(amount1).gt(BigNumber(pair.reserve).dividedBy(2))
        ) {
          setAmount1Error(`Insufficient Liquidity`);
          error = true;
        } else {
          const calSLPResult = await calSLP(false);
          if (typeof calSLPResult === "string") {
            setAmount1Error(calSLPResult);
            error = true;
          } else {
            swapMin = String(calSLPResult);
            //console.log("swapMin", swapMin);
          }
        }
      }

      if (!asset1 || asset1 === null) {
        setAmount1Error("Asset is required");
        error = true;
      }

      if (!error) {
        setDepositLoading(true);
        //const amout = SLPCount === 2 ? amount0 : amount1
        stores.dispatcher.dispatch({
          type: ACTIONS.SLP_LIQUIDITY,
          content: {
            pair: pair,
            single: asset1,
            amount: amount1,
            swapMin: swapMin,
            slippage: slippage && slippage != "" ? slippage : "2",
          },
        });
      }
    }
  };

  const onSLPDepositAndStake = async (asset) => {
    setAmount0Error(false);
    setAmount1Error(false);

    let error = false;
    let swapMin = "";
    if (SLPCount === 2) {
      let reserve;

      if (asset0.address.toLowerCase() === pair.token0.address.toLowerCase()) {
        reserve = pair.reserve0;
      } else {
        reserve = pair.reserve1;
      }

      if (!amount0 || amount0 === "" || isNaN(+amount0)) {
        setAmount0Error("Amount 0 is required");
        error = true;
      } else {
        if (
          !asset0.balance ||
          isNaN(asset0.balance) ||
          BigNumber(asset0.balance).lte(0)
        ) {
          setAmount0Error("Invalid balance");
          error = true;
        } else if (BigNumber(amount0).lte(0)) {
          setAmount0Error("Invalid amount");
          error = true;
        } else if (asset0 && BigNumber(amount0).gt(asset0.balance)) {
          setAmount0Error(`Greater than your available balance`);
          error = true;
        } else if (
          asset0 &&
          BigNumber(amount0).gt(BigNumber(reserve).dividedBy(2))
        ) {
          //console.log("amount0", amount0, reserve);
          setAmount0Error(`Insufficient Liquidity`);
          error = true;
        } else {
          const calSLPResult = await calSLP(true);
          if (typeof calSLPResult === "string") {
            setAmount0Error(calSLPResult);
            error = true;
          } else {
            swapMin = String(calSLPResult);
            //console.log("swapMin", swapMin);
          }
        }
      }

      if (!asset0 || asset0 === null) {
        setAmount0Error("Asset is required");
        error = true;
      }
    } else if (SLPCount === 3) {
      let reserve;

      if (asset1.address.toLowerCase() === pair.token0.address.toLowerCase()) {
        reserve = pair.reserve0;
      } else {
        reserve = pair.reserve1;
      }

      if (!amount1 || amount1 === "" || isNaN(+amount1)) {
        setAmount1Error("Amount 1 is required");
        error = true;
      } else {
        if (
          !asset1.balance ||
          isNaN(asset1.balance) ||
          BigNumber(asset1.balance).lte(0)
        ) {
          setAmount1Error("Invalid balance");
          error = true;
        } else if (BigNumber(amount1).lte(0)) {
          setAmount1Error("Invalid amount");
          error = true;
        } else if (asset1 && BigNumber(amount1).gt(asset1.balance)) {
          setAmount1Error(`Greater than your available balance`);
          error = true;
        } else if (
          asset1 &&
          BigNumber(amount1).gt(BigNumber(reserve).dividedBy(2))
        ) {
          //console.log("amount1", amount1, reserve);
          setAmount1Error(`Insufficient Liquidity`);
          error = true;
        } else {
          const calSLPResult = await calSLP(true);
          if (typeof calSLPResult === "string") {
            setAmount0Error(calSLPResult);
            error = true;
          } else {
            swapMin = String(calSLPResult);
            //console.log("swapMin", swapMin);
          }
        }
      }

      if (!asset1 || asset1 === null) {
        setAmount1Error("Asset is required");
        error = true;
      }
    }

    if (!error) {
      setDepositStakeLoading(true);
      const amout = SLPCount === 2 ? amount0 : amount1;
      const asset = SLPCount === 2 ? asset0 : asset1;
      stores.dispatcher.dispatch({
        type: ACTIONS.SLP_ADD_LIQUIDITY_AND_STAKE,
        content: {
          pair: pair,
          single: asset,
          amount: amout,
          swapMin: swapMin,
          slippage: slippage && slippage != "" ? slippage : "2",
        },
      });
    }
  };

  const setSLP = (cnt) => {
    setSLPcount(cnt);
  };

  const onCreateAndDeposit = () => {
    setAmount0Error(false);
    setAmount1Error(false);

    let error = false;

    if (!amount0 || amount0 === "" || isNaN(+amount0)) {
      setAmount0Error("Amount 0 is required");
      error = true;
    } else {
      if (
        !asset0.balance ||
        isNaN(asset0.balance) ||
        BigNumber(asset0.balance).lte(0)
      ) {
        setAmount0Error("Invalid balance");
        error = true;
      } else if (BigNumber(amount0).lte(0)) {
        setAmount0Error("Invalid amount");
        error = true;
      } else if (asset0 && BigNumber(amount0).gt(asset0.balance)) {
        setAmount0Error(`Greater than your available balance`);
        error = true;
      }
    }

    if (!amount1 || amount1 === "" || isNaN(+amount1)) {
      setAmount1Error("Amount 0 is required");
      error = true;
    } else {
      if (
        !asset1.balance ||
        isNaN(asset1.balance) ||
        BigNumber(asset1.balance).lte(0)
      ) {
        setAmount1Error("Invalid balance");
        error = true;
      } else if (BigNumber(amount1).lte(0)) {
        setAmount1Error("Invalid amount");
        error = true;
      } else if (asset1 && BigNumber(amount1).gt(asset1.balance)) {
        setAmount1Error(`Greater than your available balance`);
        error = true;
      }
    }

    if (!asset0 || asset0 === null) {
      setAmount0Error("Asset is required");
      error = true;
    }

    if (!asset1 || asset1 === null) {
      setAmount1Error("Asset is required");
      error = true;
    }

    if (!error) {
      setDepositLoading(true);
      stores.dispatcher.dispatch({
        type: ACTIONS.CREATE_PAIR_AND_DEPOSIT,
        content: {
          token0: asset0,
          token1: asset1,
          amount0: amount0,
          amount1: amount1,
          isStable: stable,
          slippage: slippage && slippage != "" ? slippage : "2",
        },
      });
    }
  };

  const calWithdraw = (assetA, assetB) => {
    const sendSlippage = BigNumber(100).minus(slippage).div(100);

    const amountA = BigNumber(withdrawAmount0).times(10 ** assetA.decimals);
    const amountB = BigNumber(withdrawAmount1).times(10 ** assetB.decimals);

    const amountAmin = amountA.times(sendSlippage);
    const amountBmin = amountB.times(sendSlippage);

    if (amountAmin.gt(amountA)) {
      return "Router: INSUFFICIENT_A_AMOUNT";
    } else if (amountBmin.gt(amountB)) {
      return "Router: INSUFFICIENT_B_AMOUNT";
    }
  };

  const calWithdrawAll = async (assetA, assetB) => {
    await callQuoteRemoveLiquidity(pair, pair.balance);
    const sendSlippage = BigNumber(100).minus(slippage).div(100);
    //console.log("withdrawQuote", withdrawQuote);
    //console.log("withdrawAmount", withdrawAmount0, withdrawAmount1);
    const balance = BigNumber(pair.balance)
      .div(10 ** pair.decimals)
      .toFixed();
    setWithdrawAmount(formatCurrency(pair.balance));
    const amountA = BigNumber(withdrawAmount0).times(10 ** assetA.decimals);
    const amountB = BigNumber(withdrawAmount1).times(10 ** assetB.decimals);

    const amountAmin = amountA.times(sendSlippage);
    const amountBmin = amountB.times(sendSlippage);

    if (amountAmin.gt(amountA)) {
      return "Router: INSUFFICIENT_A_AMOUNT";
    } else if (amountBmin.gt(amountB)) {
      return "Router: INSUFFICIENT_B_AMOUNT";
    }
  };

  const calSLPswap = async (amount, assetA, assetB) => {
    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      return null;
    }

    const calResult = calWithdraw(assetA, assetB);
    if (calResult) {
      return calResult;
    }
    //console.log("amount", amount);
    if (assetA.symbol === "ETH") {
      const baseAssets = stores.stableSwapStore.getStore("baseAssets");
      const eth = baseAssets.find((asset) => asset.symbol === "WETH");
      assetA.address = eth.address;
      assetB.address = eth.address;
    }

    const payload = {
      content: {
        fromAsset: assetA,
        toAsset: assetB,
        fromAmount: amount,
      },
    };

    const returnValues = await stores.stableSwapStore.quoteSwap(payload);

    const amountBout = returnValues.output.receiveAmounts[1];
    const amountBDesired = BigNumber(amountBout);
    const swapSlippage = BigNumber(100).minus(slp_slippage).div(100);
    const amountOutmin = Math.floor(
      amountBDesired.times(swapSlippage).toNumber()
    );

    const priceimpact = returnValues.priceImpact;
    //console.log("amountOutmin", amountOutmin);
    if (BigNumber(priceimpact).gt(slp_slippage)) {
      const slippage = parseFloat(priceimpact);
      const roundedPriceimpact = Math.ceil(slippage * 10000) / 10000;
      return `Increase SLP Slippage to ${roundedPriceimpact}`;
    }

    return amountOutmin;
  };

  const onNoneGaugeWithdraw = async () => {
    setWithdrawAmountError(false);
    let error = false;
    let swapMin = "";
    if (!withdrawAsset || withdrawAsset === null) {
      setWithdrawAmountError("Asset is required");
      error = true;
    } else {
      if (BigNumber(withdrawAmount).gt(pair.balance)) {
        //console.log("??");
        setWithdrawAmountError("Greater than your available balance");
        error = true;
      } else if (SLPCount === 2) {
        const calSLPResult = await calSLPswap(
          withdrawAmount1,
          pair.token1,
          pair.token0
        );
        if (typeof calSLPResult === "string") {
          setWithdrawAmountError(calSLPResult);
          error = true;
        } else {
          swapMin = String(calSLPResult);
          //console.log("swapMin", swapMin);
        }
      } else if (SLPCount === 3) {
        const calSLPResult = await calSLPswap(
          withdrawAmount0,
          pair.token0,
          pair.token1
        );
        if (typeof calSLPResult === "string") {
          setWithdrawAmountError(calSLPResult);
          error = true;
        } else {
          swapMin = String(calSLPResult);
          //console.log("swapMin", swapMin);
        }
      } else {
        const calResult = calWithdraw(pair.token0, pair.token1);
        if (calResult) {
          setWithdrawAmountError(calResult);
          error = true;
        }
      }
    }
    //console.log("Greater", withdrawAmount, pair.balance, error);
    if (!error) {
      setDepositLoading(true);
      if (SLPCount === 2) {
        stores.dispatcher.dispatch({
          type: ACTIONS.SLP_REMOVE_NONE_GAUGE_LIQUIDITY,
          content: {
            pair: pair,
            token: pair.token0,
            amount: withdrawAmount,
            swapMin: swapMin,
            slippage: slippage && slippage != "" ? slippage : "2",
          },
        });
      } else if (SLPCount === 3) {
        stores.dispatcher.dispatch({
          type: ACTIONS.SLP_REMOVE_NONE_GAUGE_LIQUIDITY,
          content: {
            pair: pair,
            token: pair.token1,
            amount: withdrawAmount,
            swapMin: swapMin,
            slippage: slippage && slippage != "" ? slippage : "2",
          },
        });
      } else if (SLPCount === 1) {
        const amountA = BigNumber(withdrawAmount0).times(
          10 ** pair.token0.decimals
        );
        const amountB = BigNumber(withdrawAmount1).times(
          10 ** pair.token1.decimals
        );
        stores.dispatcher.dispatch({
          type: ACTIONS.REMOVE_NONE_GAUGE_LIQUIDITY,
          content: {
            pair: pair,
            token0: pair.token0,
            token1: pair.token1,
            amount: withdrawAmount,
            amountA: withdrawAmount0,
            amountB: withdrawAmount1,
            slippage: slippage && slippage != "" ? slippage : "2",
          },
        });
      }
    }
  };

  const onWithdraw = async () => {
    setWithdrawAmountError(false);
    let error = false;
    let swapMin = "";
    if (!withdrawAsset || withdrawAsset === null) {
      setWithdrawAmountError("Asset is required");
      error = true;
    } else {
      if (BigNumber(withdrawAmount).gt(pair.balance)) {
        setWithdrawAmountError("Greater than your available balance");
        error = true;
      } else if (SLPCount === 2) {
        const calSLPResult = await calSLPswap(
          pair.balance,
          pair.token1,
          pair.token0
        );
        if (typeof calSLPResult === "string") {
          setWithdrawAmountError(calSLPResult);
          error = true;
        } else {
          swapMin = String(calSLPResult);
          //console.log("swapMin", swapMin);
        }
      } else if (SLPCount === 3) {
        const calSLPResult = await calSLPswap(
          pair.balance,
          pair.token0,
          pair.token1
        );
        if (typeof calSLPResult === "string") {
          setWithdrawAmountError(calSLPResult);
          error = true;
        } else {
          swapMin = String(calSLPResult);
          //console.log("swapMin", swapMin);
        }
      } else {
        const calResult = await calWithdrawAll(pair.token0, pair.token1);
        if (calResult) {
          setWithdrawAmountError(calResult);
          error = true;
        }
      }
    }

    if (!error) {
      setDepositLoading(true);
      if (SLPCount === 2) {
        stores.dispatcher.dispatch({
          type: ACTIONS.SLP_REMOVE_LIQUIDITY,
          content: {
            pair: pair,
            token: pair.token0,
            swapMin: swapMin,
          },
        });
      } else if (SLPCount === 3) {
        stores.dispatcher.dispatch({
          type: ACTIONS.SLP_REMOVE_LIQUIDITY,
          content: {
            pair: pair,
            token: pair.token1,
            swapMin: swapMin,
          },
        });
      } else if (SLPCount === 1) {
        stores.dispatcher.dispatch({
          type: ACTIONS.REMOVE_LIQUIDITY,
          content: {
            pair: pair,
            token0: pair.token0,
            token1: pair.token1,
            slippage: slippage && slippage != "" ? slippage : "2",
          },
        });
      }
    }
  };

  const onUnstakeAndWithdraw = async () => {
    setWithdrawAmountError(false);
    let error = false;
    let swapMin = "";
    if (!withdrawAmount || withdrawAmount === "" || isNaN(+withdrawAmount)) {
      setWithdrawAmountError("Amount is required");
      error = true;
    } else {
      if (
        withdrawAsset &&
        withdrawAsset.gauge &&
        (!withdrawAsset.gauge.balance ||
          isNaN(withdrawAsset.gauge.balance) ||
          BigNumber(withdrawAsset.gauge.balance).lte(0))
      ) {
        setWithdrawAmountError("Invalid balance");
        error = true;
      } else if (BigNumber(withdrawAmount).lte(0)) {
        setWithdrawAmountError("Invalid amount");
        error = true;
      } else if (
        withdrawAsset &&
        BigNumber(withdrawAmount).gt(withdrawAsset.gauge.balance)
      ) {
        setWithdrawAmountError(`Greater than your available balance`);
        error = true;
      } else if (SLPCount === 2) {
        const calSLPResult = await calSLPswap(
          pair.balance,
          pair.token1,
          pair.token0
        );
        if (typeof calSLPResult === "string") {
          setWithdrawAmountError(calSLPResult);
          error = true;
        } else {
          swapMin = String(calSLPResult);
        }
      } else if (SLPCount === 3) {
        const calSLPResult = await calSLPswap(
          pair.balance,
          pair.token0,
          pair.token1
        );
        if (typeof calSLPResult === "string") {
          setWithdrawAmountError(calSLPResult);
          error = true;
        } else {
          swapMin = String(calSLPResult);
        }
      } else {
        const calResult = await calWithdrawAll(pair.token0, pair.token1);
        if (calResult) {
          setWithdrawAmountError(calResult);
          error = true;
        }
      }
    }

    if (!withdrawAsset || withdrawAsset === null) {
      setWithdrawAmountError("From asset is required");
      error = true;
    }

    if (!error) {
      setDepositStakeLoading(true);
      if (SLPCount === 2) {
        stores.dispatcher.dispatch({
          type: ACTIONS.SLP_UNSTAKE_AND_REMOVE_LIQUIDITY,
          content: {
            pair: pair,
            amount: withdrawAmount,
            tokenToReceive: pair.token0,
            swapMin: swapMin,
          },
        });
      } else if (SLPCount === 3) {
        stores.dispatcher.dispatch({
          type: ACTIONS.SLP_UNSTAKE_AND_REMOVE_LIQUIDITY,
          content: {
            pair: pair,
            amount: withdrawAmount,
            tokenToReceive: pair.token1,
            swapMin: swapMin,
          },
        });
      } else {
        stores.dispatcher.dispatch({
          type: ACTIONS.UNSTAKE_AND_REMOVE_LIQUIDITY,
          content: {
            pair: pair,
            token0: pair.token0,
            token1: pair.token1,
            amount: withdrawAmount,
            amount0: withdrawAmount0,
            amount1: withdrawAmount1,
            slippage: slippage && slippage != "" ? slippage : "2",
          },
        });
      }
    }
  };

  const onUnstake = () => {
    setStakeLoading(true);
    stores.dispatcher.dispatch({
      type: ACTIONS.UNSTAKE_LIQUIDITY,
      content: {
        pair: pair,
        amount: withdrawAmount,
      },
    });
  };

  const onCreateGauge = () => {
    setCreateLoading(true);
    stores.dispatcher.dispatch({
      type: ACTIONS.CREATE_GAUGE,
      content: {
        pair: pair,
      },
    });
    ssUpdated();
  };

  const toggleDeposit = () => {
    if (depositLoading) return;
    setActiveTab("deposit");
  };

  const toggleWithdraw = () => {
    if (depositLoading) return;
    setActiveTab("withdraw");
  };

  const amount0Changed = (event) => {
    setAmount0Error(false);
    setAmount0(event.target.value);
    callQuoteAddLiquidity(
      event.target.value,
      amount1,
      priorityAsset,
      stable,
      pair,
      asset0,
      asset1
    );
  };

  const amount1Changed = (event) => {
    setAmount1Error(false);
    setAmount1(event.target.value);
    callQuoteAddLiquidity(
      amount0,
      event.target.value,
      priorityAsset,
      stable,
      pair,
      asset0,
      asset1
    );
  };

  const amount0Focused = (event) => {
    setPriorityAsset(0);
    callQuoteAddLiquidity(amount0, amount1, 0, stable, pair, asset0, asset1);
  };

  const amount1Focused = (event) => {
    setPriorityAsset(1);
    callQuoteAddLiquidity(amount0, amount1, 1, stable, pair, asset0, asset1);
  };

  const onAssetSelect = async (type, value) => {
    let fa = asset0;
    let ta = asset1;
    //바꿨을 때 수량을 바꿔야하는지 asset0,1만 바꿔야하는 물어보고 마저 수정
    if (type === "amount0") {
      if (
        (asset1.symbol === "ETH" && value.symbol === "WETH") ||
        (asset1.symbol === "WETH" && value.symbol === "ETH") ||
        asset1 === value
      ) {
        ta = asset0;
      }
      fa = value;
      setAsset0(fa);
      setAsset1(ta);
      if (fa.symbol === "ETH") {
        const chain = stores.accountStore.getStore("chainId");
        fa.address = W_NATIVE_ADDRESS_LIST[chain];
      }
      if (ta.symbol === "ETH") {
        const chain = stores.accountStore.getStore("chainId");
        ta.address = W_NATIVE_ADDRESS_LIST[chain];
      }
      //console.log("add", fa.address, ta.address);
      const p = await stores.stableSwapStore.getPair(
        fa?.address,
        ta?.address,
        stable,
        fa?.symbol,
        ta?.symbol
      );
      setPair(p);
      //console.log("000", p);
      callQuoteAddLiquidity(amount0, amount1, priorityAsset, stable, p, fa, ta);
    } else if (type === "amount1") {
      if (
        (asset0.symbol === "ETH" && value.symbol === "WETH") ||
        (asset0.symbol === "WETH" && value.symbol === "ETH") ||
        asset0 === value
      ) {
        fa = asset1;
      }
      ta = value;
      setAsset0(fa);
      setAsset1(ta);
      if (fa.symbol === "ETH") {
        const chain = stores.accountStore.getStore("chainId");
        fa.address = W_NATIVE_ADDRESS_LIST[chain];
      }
      if (ta.symbol === "ETH") {
        const chain = stores.accountStore.getStore("chainId");
        ta.address = W_NATIVE_ADDRESS_LIST[chain];
      }
      //console.log("add", fa.address, ta.address);
      const p = await stores.stableSwapStore.getPair(
        fa.address,
        ta.address,
        stable,
        fa.symbol,
        ta.symbol
      );
      setPair(p);
      callQuoteAddLiquidity(amount0, amount1, priorityAsset, stable, p, fa, ta);
    } else if (type === "withdraw") {
      setWithdrawAsset(value);
      const p = await stores.stableSwapStore.getPair(
        value.token0.address,
        value.token1.address,
        value.stable,
        value.token0.symbol,
        value.token1.symbol
      );
      setPair(p);
      calcRemove(p, withdrawAmount);
    }
  };

  const setStab = async (val) => {
    setStable(val);
    const p = await stores.stableSwapStore.getPair(
      asset0.address,
      asset1.address,
      val,
      asset0.symbol,
      asset1.symbol
    );
    setPair(p);
    callQuoteAddLiquidity(
      amount0,
      amount1,
      priorityAsset,
      val,
      p,
      asset0,
      asset1
    );
  };

  const withdrawAmountChanged = (event) => {
    setWithdrawAmountError(false);
    setWithdrawAmount(event.target.value);
    if (event.target.value === "") {
      setWithdrawAmount0("");
      setWithdrawAmount1("");
    } else if (event.target.value !== "" && !isNaN(event.target.value)) {
      calcRemove(pair, event.target.value);
    }
  };

  const isValidAmount = (value) => {
    return /^\d+(\.\d+)?$/.test(value);
  };

  const cleanInputValue = (value) => {
    const cleanedValue = value.replace(/^0+/, "");
    if (cleanedValue.startsWith(".")) {
      return `0${cleanedValue}`;
    }
    return cleanedValue;
  };

  const handleBlur0 = () => {
    const cleanedValue = amount0.trim();
    if (cleanedValue === "") {
      setAmount0Error("");
    } else {
      const modifiedValue = cleanInputValue(cleanedValue);
      if (!isValidAmount(modifiedValue)) {
        setAmount0("");
        setAmount0Error("Invalid input");
      } else {
        setAmount0(modifiedValue);
        setAmount0Error("");
      }
    }
  };

  const handleBlur1 = () => {
    const cleanedValue = amount1.trim();
    if (cleanedValue === "") {
      setAmount1Error("");
    } else {
      const modifiedValue = cleanInputValue(cleanedValue);
      if (!isValidAmount(modifiedValue)) {
        setAmount1("");
        setAmount1Error("Invalid input");
      } else {
        setAmount1(modifiedValue);
        setAmount1Error("");
      }
    }
  };

  const calcRemove = (pear, amount) => {
    if (!(amount && amount != "" && amount > 0)) {
      return;
    }

    callQuoteRemoveLiquidity(pear, amount);
  };

  const renderMediumInput = (type, value, logo, symbol, pair, token) => {
    return (
      <div className={classes.textField}>
        <div className={classes.mediumInputContainer}>
          <div className={classes.mediumInputAssetSelect}>
            <div className={classes.mediumdisplaySelectContainer}>
              <div className={classes.assetSelectMenuItem}>
                <div className={classes.mediumdisplayDualIconContainer}>
                  {logo && (
                    <img
                      className={classes.mediumdisplayAssetIcon}
                      alt=""
                      src={logo}
                      height="50px"
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src =
                          "/tokens/unknown-logo.png";
                      }}
                    />
                  )}
                  {!logo && (
                    <img
                      className={classes.mediumdisplayAssetIcon}
                      alt=""
                      src={"/tokens/unknown-logo.png"}
                      height="50px"
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src =
                          "/tokens/unknown-logo.png";
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={classes.mediumInputAmount}>
            <TextField
              placeholder="0.00"
              fullWidth
              variant="standard"
              value={SLPCount === 1 ? value : estimatedSLP}
              autoComplete="off"
              InputProps={{
                className: classes.mediumInput,
                style: { border: "none", color: "black" },
                readOnly: true,
                disableUnderline: true,
              }}
              sx={{
                input: {
                  color: "black",
                  fontWeight: "bold",
                  borderRadius: "0px",
                  textAlign: "right",
                },
              }}
            />

            <Typography color="black" className={classes.assetTypo}>
              {symbol}
            </Typography>
          </div>
        </div>
      </div>
    );
  };

  const renderMassiveInput = (
    type,
    amountValue,
    amountError,
    amountChanged,
    assetValue,
    assetError,
    assetOptions,
    onAssetSelect,
    onFocus,
    inputRef
  ) => {
    return (
      <div className={classes.textField}>
        <div
          className={classes.inputTitleContainer}
          onClick={() => {
            setAmountPercent(type, 100);
          }}
        >
          {type !== "withdraw" ? (
            <Typography className={classes.inputBalanceText} noWrap>
              Balance:
              {assetValue && assetValue.balance
                ? " " + formatCurrency(assetValue.balance)
                : ""}
            </Typography>
          ) : (
            <Typography className={classes.inputBalanceText} noWrap>
              Balance:
              {assetValue && assetValue.gauge
                ? assetValue.gauge.balance > 0
                  ? " " + formatCurrency(assetValue.gauge.balance)
                  : formatCurrency(assetValue.balance)
                : assetValue?.balance
                ? formatCurrency(assetValue.balance)
                : "0.00"}
              {/* assetValue && assetValue.balance
                  ? " " + formatCurrency(assetValue.balance)
                  :  */}
            </Typography>
          )}
        </div>
        <div
          className={`${classes.massiveInputContainer} ${
            (amountError || assetError) && classes.error
          }`}
        >
          <div className={classes.massiveInputAssetSelect}>
            <AssetSelect
              type={type}
              value={assetValue}
              assetOptions={assetOptions}
              onSelect={onAssetSelect}
              disabled={pairReadOnly}
            />
            {/* <Typography className={classes.smallerText}>
              {assetValue?.symbol}
            </Typography> */}
          </div>
          <div className={classes.massiveInputAmount}>
            <TextField
              onInput={(e: any) => {
                const target = e.target;
                target.value = e.target.value.replace(/[^0-9.]/g, "");
              }}
              inputRef={inputRef}
              placeholder="0.00"
              fullWidth
              error={typeof amountError === "boolean" ? amountError : false}
              helperText={typeof amountError === "string" ? amountError : ""}
              value={amountValue}
              variant="standard"
              onChange={amountChanged}
              disabled={createLoading}
              onBlur={handleBlur0}
              autoComplete="off"
              onFocus={onFocus ? onFocus : null}
              sx={{
                input: {
                  color: "rgb(0,0,0)",
                  fontSize: "30px",
                  fontWeight: "500",
                  borderRadius: "50px",
                  textAlign: "right",
                  marginTop: "2vw",
                  padding: "1vh 1.5vh",
                  boxShadow: "none",
                  "&:focus": {
                    outline: "none", // 포커스 시 외곽선 제거
                  },
                },
              }}
              InputProps={{
                disableUnderline: true,
                className: classes.largeInput,
                style: {
                  border: "none",
                  boxShadow: "none",
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderDepositInformation = () => {
    if (!pair) {
      return (
        <div className={classes.depositInfoContainer}>
          <Typography className={classes.depositInfoHeading}>
            Starting Liquidity Info
          </Typography>
          <div className={classes.createPriceInfos}>
            <div className={classes.priceInfo}>
              <Typography className={classes.title}>
                {BigNumber(amount1).gt(0)
                  ? formatCurrency(BigNumber(amount0).div(amount1))
                  : "0.00"}
              </Typography>
              <Typography
                className={classes.text}
              >{`${asset0?.symbol} per ${asset1?.symbol}`}</Typography>
            </div>
            <div className={classes.priceInfo}>
              <Typography className={classes.title}>
                {BigNumber(amount0).gt(0)
                  ? formatCurrency(BigNumber(amount1).div(amount0))
                  : "0.00"}
              </Typography>
              <Typography
                className={classes.text}
              >{`${asset1?.symbol} per ${asset0?.symbol}`}</Typography>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={classes.depositInfoContainer}>
          {/* <Typography className={classes.depositInfoHeading}>
              Reserve Info
            </Typography> */}
          <div className={classes.priceInfos}>
            {/* <div className={classes.priceInfo}>
                <Typography className={classes.title}>
                  {formatCurrency(pair?.reserve0)}
                </Typography>
                <Typography
                  className={classes.text}
                >{`${pair?.token0?.symbol}`}</Typography>
              </div>
              <div className={classes.priceInfo}>
                <Typography className={classes.title}>
                  {formatCurrency(pair?.reserve1)}
                </Typography>
                <Typography
                  className={classes.text}
                >{`${pair?.token1?.symbol}`}</Typography>
              </div> */}
            {/* <div className={classes.priceInfo}>
              {renderSmallInput(
                "slippage",
                slippage,
                slippageError,
                onSlippageChanged
              )}
            </div> */}
          </div>
          <Typography className={classes.depositInfoHeading}>
            Your Balances
          </Typography>
          <div className={classes.createPriceInfos}>
            <div className={classes.priceInfo}>
              <Typography className={classes.title}>
                {formatCurrency(pair?.balance)}
              </Typography>
              <Typography
                className={classes.text}
              >{`Pooled ${pair?.symbol}`}</Typography>
            </div>
            <div className={classes.priceInfo}>
              <Typography className={classes.title}>
                {formatCurrency(pair?.gauge?.balance)}
              </Typography>
              <Typography
                className={classes.text}
              >{`Staked ${pair?.symbol} `}</Typography>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderWithdrawInformation = () => {
    return (
      <div className={classes.withdrawInfoContainer}>
        {/* <Typography className={classes.depositInfoHeading}>
          Reserve Info
        </Typography> */}
        {/* <div className={classes.priceInfos}>
          <div className={classes.priceInfo}>
            <Typography className={classes.title}>
              {formatCurrency(pair?.reserve0)}
            </Typography>
            <Typography
              className={classes.text}
            >{`${pair?.token0?.symbol}`}</Typography>
          </div>
          <div className={classes.priceInfo}>
            <Typography className={classes.title}>
              {formatCurrency(pair?.reserve1)}
            </Typography>
            <Typography
              className={classes.text}
            >{`${pair?.token1?.symbol}`}</Typography>
          </div>
          <div className={classes.priceInfo}>
            {renderSmallInput(
              "slippage",
              slippage,
              slippageError,
              onSlippageChanged
            )}
          </div>
        </div> */}
        <Typography className={classes.depositInfoHeading}>
          Your Balances
        </Typography>
        <div className={classes.createPriceInfos}>
          <div className={classes.priceInfo}>
            <Typography className={classes.title}>
              {formatCurrency(pair?.balance)}
            </Typography>
            <Typography
              className={classes.text}
            >{`Pooled ${pair?.symbol}`}</Typography>
          </div>
          <div className={classes.priceInfo}>
            <Typography className={classes.title}>
              {formatCurrency(pair?.gauge?.balance)}
            </Typography>
            <Typography
              className={classes.text}
            >{`Staked ${pair?.symbol} `}</Typography>
          </div>
        </div>
      </div>
    );
  };

  const renderSmallInput = (
    type,
    amountValue,
    amountValue1,
    amountError,
    amountChanged,
    handleSlippageChanged,
    handleSLPSlippageChanged
  ) => {
    const [localSettings, setLocalSettings] = useState(amountValue);
    const [slp_localSettings, setSLPLocalSettings] = useState(amountValue1);
    const handleSlippageButtonClick = (slippageValue) => {
      setLocalSettings(slippageValue);
      handleSlippageChanged(slippageValue);
      stores.accountStore.setStore({ liquidity_slippage: slippageValue });
    };

    const handleSLPSlippageButtonClick = (slippageValue) => {
      setSLPLocalSettings(slippageValue);
      handleSLPSlippageChanged(slippageValue);
      stores.accountStore.setStore({ swap_slippage: slippageValue });
    };

    const handleChanged = (event) => {
      setLocalSettings(event.target.value);
    };

    const handleSLPChanged = (event) => {
      setSLPLocalSettings(event.target.value);
    };

    const handleTextFieldClick = (e) => {
      e.stopPropagation();

      e.target.value = "";
    };

    const handleBlur = () => {
      let newSlippage = parseFloat(localSettings); // 문자열을 숫자로 변환

      if (newSlippage < 0.1) {
        newSlippage = 0.1;
      } else if (newSlippage > 100) {
        newSlippage = 100;
      }
      newSlippage = parseFloat(newSlippage.toFixed(2));
      handleSlippageChanged(newSlippage); // 숫자 값을 전달
      setLocalSettings(newSlippage);
      stores.accountStore.setStore({ liquidity_slippage: newSlippage });
    };

    const handleSLPBlur = () => {
      let newSlippage = parseFloat(slp_localSettings); // 문자열을 숫자로 변환

      if (newSlippage < 0.1) {
        newSlippage = 0.1;
      } else if (newSlippage > 100) {
        newSlippage = 100;
      }
      newSlippage = parseFloat(newSlippage.toFixed(2));
      handleSLPSlippageChanged(newSlippage); // 숫자 값을 전달
      setSLPLocalSettings(newSlippage);
      stores.accountStore.setStore({ swap_slippage: newSlippage });
    };

    return (
      <div className={classes.textField} style={{ width: "100%" }}>
        <div className={classes.inputTitleContainerSlippage}>
          <div className={classes.inputBalanceSlippage}>
            <Typography className={classes.inputBalanceTextSlippage} noWrap>
              Liquidity Slippage tolerance: {localSettings}%
            </Typography>
          </div>
        </div>
        <div
          className={classes.smallInputContainer}
          style={{ padding: "1rem" }}
        >
          <div style={{ display: "flex" }}>
            <Button
              onClick={() => handleSlippageButtonClick(0.1)}
              style={{
                backgroundColor:
                  localSettings === 0.1 || localSettings === "0.1"
                    ? "rgba(255, 174, 128, 0.3)"
                    : "white",
                borderRadius: "8px 0 0 8px",
                border: "1px solid",
              }}
            >
              0.1%
            </Button>
            <Button
              onClick={() => handleSlippageButtonClick(0.3)}
              style={{
                backgroundColor:
                  localSettings === 0.3 || localSettings === "0.3"
                    ? "rgba(255, 174, 128, 0.3)"
                    : "white",
                borderRadius: "0px",
                border: "1px solid",
                borderLeft: "none",
              }}
            >
              0.3%
            </Button>
            <Button
              onClick={() => handleSlippageButtonClick(1)}
              style={{
                backgroundColor:
                  localSettings === 1 || localSettings === "1"
                    ? "rgba(255, 174, 128, 0.3)"
                    : "white",
                borderRadius: "0px",
                border: "1px solid",
                borderLeft: "none",
              }}
            >
              1%
            </Button>
            <Button
              onClick={() => handleSlippageButtonClick(3)}
              style={{
                backgroundColor:
                  localSettings === 3 || localSettings === "3"
                    ? "rgba(255, 174, 128, 0.3)"
                    : "white",
                borderRadius: "0 8px 8px 0",
                border: "1px solid",
                borderLeft: "none",
              }}
            >
              3%
            </Button>
          </div>
          <Typography style={{ padding: "1rem" }}>or</Typography>
          <TextField
            placeholder="0.00"
            fullWidth
            size="small"
            style={{ width: "70px" }}
            error={typeof amountError === "boolean" ? amountError : false}
            helperText={typeof amountError === "string" ? amountError : ""}
            value={localSettings}
            onChange={handleChanged}
            onBlur={handleBlur}
            autoComplete="off"
            onClick={handleTextFieldClick}
            inputProps={{
              style: {
                textAlign: "center",
                color: "black",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <span style={{ color: "black", fontSize: "15px" }}>%</span>
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className={classes.inputTitleContainerSlippage}>
          <div className={classes.inputBalanceSlippage}>
            <Typography className={classes.inputBalanceTextSlippage} noWrap>
              SLP Slippage tolerance for swap: {slp_localSettings}%
            </Typography>
          </div>
        </div>
        <div
          className={classes.smallInputContainer}
          style={{ padding: "1rem" }}
        >
          <div style={{ display: "flex" }}>
            <Button
              onClick={() => handleSLPSlippageButtonClick(0.1)}
              style={{
                backgroundColor:
                  slp_localSettings === 0.1 || slp_localSettings === "0.1"
                    ? "rgba(255, 174, 128, 0.3)"
                    : "white",
                borderRadius: "8px 0 0 8px",
                border: "1px solid",
              }}
            >
              0.1%
            </Button>
            <Button
              onClick={() => handleSLPSlippageButtonClick(0.3)}
              style={{
                backgroundColor:
                  slp_localSettings === 0.3 || slp_localSettings === "0.3"
                    ? "rgba(255, 174, 128, 0.3)"
                    : "white",
                borderRadius: "0px",
                border: "1px solid",
                borderLeft: "none",
              }}
            >
              0.3%
            </Button>
            <Button
              onClick={() => handleSLPSlippageButtonClick(1)}
              style={{
                backgroundColor:
                  slp_localSettings === 1 || slp_localSettings === "1"
                    ? "rgba(255, 174, 128, 0.3)"
                    : "white",
                borderRadius: "0px",
                border: "1px solid",
                borderLeft: "none",
              }}
            >
              1%
            </Button>
            <Button
              onClick={() => handleSLPSlippageButtonClick(3)}
              style={{
                backgroundColor:
                  slp_localSettings === 3 || slp_localSettings === "3"
                    ? "rgba(255, 174, 128, 0.3)"
                    : "white",
                borderRadius: "0 8px 8px 0",
                border: "1px solid",
                borderLeft: "none",
              }}
            >
              3%
            </Button>
          </div>
          <Typography style={{ padding: "1rem" }}>or</Typography>
          <TextField
            placeholder="0.00"
            fullWidth
            size="small"
            style={{ width: "70px" }}
            error={typeof amountError === "boolean" ? amountError : false}
            helperText={typeof amountError === "string" ? amountError : ""}
            value={slp_localSettings}
            onChange={handleSLPChanged}
            onBlur={handleSLPBlur}
            onClick={handleTextFieldClick}
            autoComplete="off"
            inputProps={{
              style: {
                textAlign: "center",
                color: "black",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <span style={{ color: "black", fontSize: "15px" }}>%</span>
                </InputAdornment>
              ),
            }}
          />
        </div>
      </div>
    );
  };

  const renderMediumInputToggle = (type, value) => {
    return (
      <div className={classes.textField}>
        <div
          className={classes.mediumInputContainer}
          style={{ backgroundColor: "#F9F9F9" }}
        >
          <div className={classes.toggles}>
            <div
              className={`${classes.toggleOption} ${stable && classes.active}`}
              onClick={() => {
                setSLP(1);
                setStab(true);
              }}
            >
              <Typography className={classes.toggleOptionText}>
                Stable
              </Typography>
            </div>
            <div
              className={`${classes.toggleOption} ${!stable && classes.active}`}
              onClick={() => {
                setStab(false);
              }}
            >
              <Typography className={classes.toggleOptionText}>
                Volatile
              </Typography>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const toggleAdvanced = () => {
    setAdvanced(!advanced);
  };

  return (
    <div className={classes.retain}>
      {isModalOpen && <SettingModal onClose={closeSettingModal} />}
      <div className={classes.toggleButtons}>
        <Paper className={classes.button} style={{ boxShadow: "none" }}>
          <div style={{ display: "flex", minHeight: "3rem" }}>
            <IconButton className={classes.backButton} onClick={onBack}>
              <ArrowBack className={classes.backIcon} />
              {shouldShowImage && (
                <Typography style={{ padding: "3px" }}>Pools</Typography>
              )}
            </IconButton>
          </div>
        </Paper>
        <Paper
          className={`${
            activeTab === "deposit" ? classes.buttonActive : classes.button
          } ${classes.topLeftButton}`}
          onClick={toggleDeposit}
          style={{ backgroundColor: "white" }}
        >
          <Typography variant="h5" className={classes.typeMenu}>
            Deposit
          </Typography>
          <div
            className={`${activeTab === "deposit" ? classes.activeIcon : ""}`}
          ></div>
        </Paper>
        <Paper
          className={`${
            activeTab === "withdraw" ? classes.buttonActive : classes.button
          }  ${classes.bottomLeftButton}`}
          onClick={toggleWithdraw}
        >
          <Typography variant="h5" className={classes.typeMenu}>
            Withdraw
          </Typography>
          <div
            className={`${activeTab === "withdraw" ? classes.activeIcon : ""}`}
          ></div>
        </Paper>
      </div>
      <Paper elevation={0} className={classes.container}>
        <div className={classes.reAddPadding}>
          <div className={classes.inputsContainer}>
            {activeTab === "deposit" && (
              <>
                {SLPCount === 2 ? (
                  <>
                    {renderMassiveInput(
                      "amount0",
                      amount0,
                      amount0Error,
                      amount0Changed,
                      asset0,
                      null,
                      assetOptions,
                      onAssetSelect,
                      amount0Focused,
                      amount0Ref
                    )}
                  </>
                ) : SLPCount === 3 ? (
                  <>
                    {renderMassiveInput(
                      "amount1",
                      amount1,
                      amount1Error,
                      amount1Changed,
                      asset1,
                      null,
                      assetOptions,
                      onAssetSelect,
                      amount1Focused,
                      amount1Ref
                    )}
                  </>
                ) : (
                  <>
                    {renderMassiveInput(
                      "amount0",
                      amount0,
                      amount0Error,
                      amount0Changed,
                      asset0,
                      null,
                      assetOptions,
                      onAssetSelect,
                      amount0Focused,
                      amount0Ref
                    )}
                    <div className={classes.swapIconContainer}>
                      <div
                        className={classes.swapIconSubContainer}
                        onClick={swapAssets}
                      >
                        <Add className={classes.swapIcon} />
                      </div>
                    </div>
                    {renderMassiveInput(
                      "amount1",
                      amount1,
                      amount1Error,
                      amount1Changed,
                      asset1,
                      null,
                      assetOptions,
                      onAssetSelect,
                      amount1Focused,
                      amount1Ref
                    )}
                  </>
                )}
                {pair && (
                  <div style={{ margin: "3rem 0" }}>
                    <Typography
                      style={{
                        display: "flex",
                        fontSize: "16px",
                        alignItems: "center",
                        fontWeight: "700",
                      }}
                    >
                      Single Liquidity Provider
                    </Typography>
                    <div className={classes.actionsContainerFlex}>
                      <div className={classes.slpbuttonContainer}>
                        <div
                          style={{ display: "flex", justifyContent: "start" }}
                        >
                          <Button
                            size="small"
                            color="secondary"
                            onClick={() => setSLP(1)}
                            className={`${classes.slpbuttonBalanced}`}
                          >
                            <img
                              src={asset0 ? `${asset0.logoURI}` : ""}
                              width={24}
                              style={{
                                marginRight: "4px",
                                borderRadius: "50px",
                              }}
                            ></img>
                            <img
                              src={asset1 ? `${asset1.logoURI}` : ""}
                              width={24}
                              style={{
                                marginRight: "4px",
                                borderRadius: "50px",
                                marginLeft: "-14px",
                              }}
                            ></img>
                            <Typography className={classes.actionButtonText}>
                              {asset0 && asset1
                                ? `${asset0.symbol} + ${asset1.symbol}`
                                : 0}
                            </Typography>
                          </Button>
                        </div>
                        {/* <div style={{ display: "flex", justifyContent: "start" }}> */}
                        {/* <div style={{ margin: "0 auto", display: "flex", alignItems: "center" }}> */}
                        <Button
                          size="small"
                          color="secondary"
                          onClick={() => setSLP(2)}
                          className={`${classes.slpbutton}`}
                        >
                          <Typography
                            className={classes.actionButtonText}
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <img
                              src={asset0 ? `${asset0.logoURI}` : ""}
                              width={24}
                              style={{
                                marginRight: "4px",
                                borderRadius: "50px",
                              }}
                            ></img>
                            {asset0 ? asset0.symbol : ""}
                          </Typography>
                        </Button>
                        <Button
                          size="small"
                          color="secondary"
                          onClick={() => setSLP(3)}
                          className={`${classes.slpbutton}`}
                        >
                          <Typography
                            className={classes.actionButtonText}
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <img
                              src={asset1 ? `${asset1.logoURI}` : ""}
                              width={24}
                              style={{
                                marginRight: "4px",
                                borderRadius: "50px",
                              }}
                            ></img>
                            {asset1 ? asset1.symbol : ""}
                          </Typography>
                        </Button>
                        {/* </div> */}
                        {/* </div> */}
                      </div>
                    </div>
                  </div>
                )}
                {renderMediumInputToggle("stable", stable)}

                {renderDepositInformation()}
              </>
            )}
            {activeTab === "withdraw" && (
              <>
                {renderMassiveInput(
                  "withdraw",
                  withdrawAmount,
                  withdrawAmountError,
                  withdrawAmountChanged,
                  withdrawAsset,
                  null,
                  withdrawAassetOptions,
                  onAssetSelect,
                  null,
                  null
                )}
                <div className={classes.swapIconContainer}>
                  <div className={classes.swapIconSubContainer}>
                    <ArrowDownward className={classes.swapIcon} />
                  </div>
                </div>
                {activeTab === "withdraw" && (
                  <>
                    {SLPCount === 2 ? (
                      <>
                        <div className={classes.receiveAssets}>
                          {renderMediumInput(
                            "withdrawAmount0",
                            withdrawAmount,
                            pair?.token0?.logoURI,
                            pair?.token0?.symbol,
                            pair,
                            pair?.token0
                          )}
                        </div>
                      </>
                    ) : SLPCount === 3 ? (
                      <>
                        <div className={classes.receiveAssets}>
                          {renderMediumInput(
                            "withdrawAmount1",
                            withdrawAmount,
                            pair?.token1?.logoURI,
                            pair?.token1?.symbol,
                            pair,
                            pair?.token1
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={classes.receiveAssets}>
                          {renderMediumInput(
                            "withdrawAmount0",
                            withdrawAmount0,
                            pair?.token0?.logoURI,
                            pair?.token0?.symbol,
                            null,
                            null
                          )}
                          {renderMediumInput(
                            "withdrawAmount1",
                            withdrawAmount1,
                            pair?.token1?.logoURI,
                            pair?.token1?.symbol,
                            null,
                            null
                          )}
                        </div>
                      </>
                    )}
                    {pair && (
                      <div style={{ margin: "3rem 0" }}>
                        <Typography
                          style={{
                            display: "flex",
                            fontSize: "16px",
                            alignItems: "center",
                            fontWeight: "700",
                          }}
                        >
                          Single Liquidity Provider
                        </Typography>
                        <div className={classes.actionsContainerFlex}>
                          <div className={classes.slpbuttonContainer}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "start",
                              }}
                            >
                              {/* <Typography style={{ display: "flex", fontSize: "16px", alignItems: "center" }}>
                              Balanced:
                            </Typography> */}
                              <Button
                                size="small"
                                color="secondary"
                                onClick={() => setSLP(1)}
                                className={`${classes.slpbuttonBalanced}`}
                              >
                                <img
                                  src={
                                    pair.token0 ? `${pair.token0.logoURI}` : ""
                                  }
                                  width={24}
                                  style={{
                                    marginRight: "4px",
                                    borderRadius: "50px",
                                  }}
                                ></img>
                                <img
                                  src={
                                    pair.token1 ? `${pair.token1.logoURI}` : ""
                                  }
                                  width={24}
                                  style={{
                                    marginRight: "4px",
                                    borderRadius: "50px",
                                    marginLeft: "-14px",
                                  }}
                                ></img>
                                <Typography
                                  className={classes.actionButtonText}
                                >
                                  {pair.token0 && pair.token1
                                    ? `${pair.token0.symbol} + ${pair.token1.symbol}`
                                    : ""}
                                </Typography>
                              </Button>
                            </div>
                            {/* <div style={{ display: "flex", justifyContent: "start" }}> */}
                            {/* <Typography style={{ display: "flex", fontSize: "16px", alignItems: "center" }}>
                              Single:
                            </Typography> */}
                            {/* <div style={{ margin: "0 auto", display: "flex", alignItems: "center" }}> */}
                            <Button
                              size="small"
                              color="secondary"
                              onClick={() => setSLP(2)}
                              style={{ borderColor: "gray" }}
                              className={`${classes.slpbutton}`}
                            >
                              <Typography
                                className={classes.actionButtonText}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <img
                                  src={
                                    pair.token0 ? `${pair.token0.logoURI}` : ""
                                  }
                                  width={24}
                                  style={{
                                    marginRight: "4px",
                                    borderRadius: "50px",
                                  }}
                                ></img>
                                {pair.token0 ? pair.token0.symbol : ""}
                              </Typography>
                            </Button>
                            {/* <Typography style={{ display: "flex", justifyContent: "center", margin: "0.5rem 1rem" }}>
                                or
                              </Typography> */}
                            <Button
                              size="small"
                              color="secondary"
                              onClick={() => setSLP(3)}
                              style={{ borderColor: "gray" }}
                              className={`${classes.slpbutton}`}
                            >
                              <Typography
                                className={classes.actionButtonText}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <img
                                  src={
                                    pair.token1 ? `${pair.token1.logoURI}` : ""
                                  }
                                  width={24}
                                  style={{
                                    marginRight: "4px",
                                    borderRadius: "50px",
                                  }}
                                ></img>
                                {pair.token1 ? pair.token1.symbol : ""}
                              </Typography>
                            </Button>
                            {/* </div> */}
                            {/* </div> */}
                          </div>
                        </div>
                      </div>
                    )}

                    {renderWithdrawInformation()}
                  </>
                )}
              </>
            )}
          </div>
          <div className={classes.advancedToggleContainer}>
            <div style={{ display: "flex" }}>
              <Button
                onClick={openSettingModal}
                style={{
                  width: "fit-content",
                  border: "none",
                  color: "gray",
                  backgroundColor: "transparent",
                }}
              >
                <Typography
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "gray",
                  }}
                >
                  Slippage
                </Typography>
                <EditOutlined style={{ width: "18px" }} />
              </Button>
              <Typography
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "14px",
                  color: "gray",
                  margin: "0 1rem",
                }}
              >
                {slippage}%
              </Typography>
            </div>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={advanced}
                  onChange={toggleAdvanced}
                  classes={{
                    thumb: advanced ? classes.thumb : classes.thumbOff,
                    track: advanced ? classes.track : classes.trackOff,
                  }}
                />
              }
              className={classes.some}
              label="Advanced"
              labelPlacement="start"
            />
          </div>
          {activeTab === "deposit" && (
            <div className={classes.actionsContainer}>
              {pair &&
                !pair.pair_iswhitelisted &&
                (SLPCount === 2 || SLPCount === 3) && (
                  <Button
                    variant="contained"
                    size="large"
                    className={
                      depositLoading
                        ? classes.multiApprovalButton
                        : classes.buttonOverride
                    }
                    color="primary"
                    disabled={depositLoading}
                    onClick={() =>
                      SLPCount === 2
                        ? onSLPDeposit(asset0.symbol)
                        : onSLPDeposit(asset1.symbol)
                    }
                    sx={{
                      backgroundColor: "white",
                      border: "2px solid #FF9A5F",
                      "&:hover": {
                        backgroundColor: "#FFDABF",
                      },
                    }}
                  >
                    <Typography className={classes.actionButtonText}>
                      {depositLoading
                        ? `Depositing`
                        : SLPCount === 2
                        ? `Deposit ${asset0.symbol}`
                        : `Deposit ${asset1.symbol}`}
                    </Typography>
                    {depositLoading && (
                      <CircularProgress
                        size={13}
                        className={classes.loadingCircle}
                      />
                    )}
                  </Button>
                )}
              {pair && !pair.pair_iswhitelisted && SLPCount === 1 && (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    className={
                      (amount0 === "" && amount1 === "") ||
                      depositLoading ||
                      stakeLoading ||
                      depositStakeLoading
                        ? classes.multiApprovalButton
                        : classes.buttonOverride
                    }
                    color="primary"
                    disabled={
                      (amount0 === "" && amount1 === "") ||
                      depositLoading ||
                      stakeLoading ||
                      depositStakeLoading
                    }
                    onClick={onDeposit}
                    sx={{
                      backgroundColor: "white",
                      border: "2px solid #FF9A5F",
                      "&:hover": {
                        backgroundColor: "#FFDABF",
                      },
                    }}
                  >
                    <Typography className={classes.actionButtonText}>
                      {depositLoading ? `Depositing` : `Deposit`}
                    </Typography>
                    {depositLoading && (
                      <CircularProgress
                        size={13}
                        className={classes.loadingCircle}
                      />
                    )}
                  </Button>
                </>
              )}
              {pair && pair.pair_iswhitelisted && !pair.gauge_address && (
                <Button
                  variant="contained"
                  size="large"
                  className={
                    createLoading ||
                    depositLoading ||
                    stakeLoading ||
                    depositStakeLoading
                      ? classes.multiApprovalButton
                      : classes.buttonOverride
                  }
                  color="primary"
                  disabled={
                    createLoading ||
                    depositLoading ||
                    stakeLoading ||
                    depositStakeLoading
                  }
                  onClick={onCreateGauge}
                  sx={{
                    backgroundColor: "white",
                    border: "2px solid #FF9A5F",
                    "&:hover": {
                      backgroundColor: "#FFDABF",
                    },
                  }}
                >
                  <Typography className={classes.actionButtonText}>
                    {createLoading ? `Creating` : `Create Gauge`}
                  </Typography>
                  {createLoading && (
                    <CircularProgress
                      size={13}
                      className={classes.loadingCircle}
                    />
                  )}
                </Button>
              )}
              {pair === null &&
                asset0 &&
                asset0.isWhitelisted === true &&
                asset1 &&
                asset1.isWhitelisted === true && (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      className={
                        createLoading || depositLoading
                          ? classes.multiApprovalButton
                          : classes.buttonOverride
                      }
                      color="primary"
                      disabled={
                        createLoading ||
                        depositLoading ||
                        (amount0 === "" && amount1 === "")
                      }
                      onClick={
                        isMainnet ? onCreateAndDeposit : onCreateAndStake
                      } //나중에 onCreateAndStake로 바꾸기 //나중에 Create Pair & Stake로  바꾸기
                      sx={{
                        backgroundColor: "white",
                        border: "2px solid #FF9A5F",
                        "&:hover": {
                          backgroundColor: "#FFDABF",
                        },
                      }}
                    >
                      {isMainnet ? (
                        <Typography className={classes.actionButtonText}>
                          {depositLoading
                            ? `Depositing`
                            : `Create Pair & Deposit`}
                        </Typography>
                      ) : (
                        <Typography className={classes.actionButtonText}>
                          {createLoading ? `Creating` : `Create Pair & Stake`}
                        </Typography>
                      )}

                      {createLoading && (
                        <CircularProgress
                          size={13}
                          className={classes.loadingCircle}
                        />
                      )}
                    </Button>
                    {advanced && !isMainnet && (
                      <>
                        <Button
                          variant="contained"
                          size="large"
                          className={
                            createLoading || depositLoading
                              ? classes.multiApprovalButton
                              : classes.buttonOverride
                          }
                          color="primary"
                          disabled={
                            createLoading ||
                            depositLoading ||
                            (amount0 === "" && amount1 === "")
                          }
                          onClick={onCreateAndDeposit}
                          sx={{
                            backgroundColor: "white",
                            border: "2px solid #FF9A5F",
                            "&:hover": {
                              backgroundColor: "#FFDABF",
                            },
                          }}
                        >
                          <Typography className={classes.actionButtonText}>
                            {depositLoading
                              ? `Depositing`
                              : `Create Pair & Deposit`}
                          </Typography>
                          {depositLoading && (
                            <CircularProgress
                              size={13}
                              className={classes.loadingCircle}
                            />
                          )}
                        </Button>
                      </>
                    )}
                  </>
                )}
              {pair === null &&
                !(
                  asset0 &&
                  asset0.isWhitelisted === true &&
                  asset1 &&
                  asset1.isWhitelisted === true
                ) && (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      className={
                        createLoading || depositLoading
                          ? classes.multiApprovalButton
                          : classes.buttonOverride
                      }
                      color="primary"
                      disabled={
                        createLoading ||
                        depositLoading ||
                        (amount0 === "" && amount1 === "")
                      }
                      onClick={onCreateAndDeposit}
                      sx={{
                        backgroundColor: "white",
                        border: "2px solid #FF9A5F",
                        "&:hover": {
                          backgroundColor: "#FFDABF",
                        },
                      }}
                    >
                      <Typography className={classes.actionButtonText}>
                        {depositLoading
                          ? `Depositing`
                          : `Create Pair & Deposit`}
                      </Typography>
                      {depositLoading && (
                        <CircularProgress
                          size={13}
                          className={classes.loadingCircle}
                        />
                      )}
                    </Button>
                  </>
                )}
              {
                // There is a Gauge on the pair. Can deposit and stake
                pair &&
                  pair &&
                  pair.gauge &&
                  pair.gauge.address &&
                  (SLPCount === 2 || SLPCount === 3) && (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        className={
                          (amount0 === "" && amount1 === "") ||
                          depositLoading ||
                          stakeLoading ||
                          depositStakeLoading
                            ? classes.multiApprovalButton
                            : classes.buttonOverride
                        }
                        color="primary"
                        disabled={
                          (amount0 === "" && amount1 === "") ||
                          depositLoading ||
                          stakeLoading ||
                          depositStakeLoading
                        }
                        onClick={() =>
                          SLPCount === 2
                            ? onSLPDepositAndStake(asset0)
                            : onSLPDepositAndStake(asset1)
                        }
                        sx={{
                          backgroundColor: "white",
                          border: "2px solid #FF9A5F",
                          "&:hover": {
                            backgroundColor: "#FFDABF",
                          },
                        }}
                      >
                        <Typography className={classes.actionButtonText}>
                          {depositStakeLoading
                            ? `Depositing`
                            : SLPCount === 2
                            ? `Deposit ${asset0.symbol} & Stake LP`
                            : `Deposit ${asset1.symbol} & Stake LP`}
                        </Typography>
                        {depositStakeLoading && (
                          <CircularProgress
                            size={13}
                            className={classes.loadingCircle}
                          />
                        )}
                      </Button>
                      {advanced && !isMainnet && (
                        <>
                          <Button
                            variant="contained"
                            size="large"
                            className={
                              (amount0 === "" && amount1 === "") ||
                              depositLoading ||
                              stakeLoading ||
                              depositStakeLoading
                                ? classes.multiApprovalButton
                                : classes.buttonOverride
                            }
                            color="primary"
                            disabled={
                              (amount0 === "" && amount1 === "") ||
                              depositLoading ||
                              stakeLoading ||
                              depositStakeLoading
                            }
                            onClick={() =>
                              SLPCount === 2
                                ? onSLPDeposit(asset0.symbol)
                                : onSLPDeposit(asset1.symbol)
                            }
                            sx={{
                              backgroundColor: "white",
                              border: "2px solid #FF9A5F",
                              "&:hover": {
                                backgroundColor: "#FFDABF",
                              },
                            }}
                          >
                            <Typography className={classes.actionButtonText}>
                              {depositLoading
                                ? `Depositing`
                                : SLPCount === 2
                                ? `Deposit ${asset0.symbol}`
                                : `Deposit ${asset1.symbol}`}
                            </Typography>
                            {depositLoading && (
                              <CircularProgress
                                size={13}
                                className={classes.loadingCircle}
                              />
                            )}
                          </Button>
                          <Button
                            variant="contained"
                            size="large"
                            className={
                              BigNumber(pair.balance).eq(0) ||
                              depositLoading ||
                              stakeLoading ||
                              depositStakeLoading
                                ? classes.multiApprovalButton
                                : classes.buttonOverride
                            }
                            color="primary"
                            disabled={
                              BigNumber(pair.balance).eq(0) ||
                              depositLoading ||
                              stakeLoading ||
                              depositStakeLoading
                            }
                            onClick={onStake}
                            sx={{
                              backgroundColor: "white",
                              border: "2px solid #FF9A5F",
                              "&:hover": {
                                backgroundColor: "#FFDABF",
                              },
                            }}
                          >
                            <Typography className={classes.actionButtonText}>
                              {BigNumber(pair.balance).gt(0)
                                ? stakeLoading
                                  ? `Staking`
                                  : `Stake ${formatCurrency(pair.balance)} LP`
                                : `Nothing to staked`}
                            </Typography>
                            {stakeLoading && (
                              <CircularProgress
                                size={13}
                                className={classes.loadingCircle}
                              />
                            )}
                          </Button>
                        </>
                      )}
                    </>
                  )
              }
              {
                // There is a Gauge on the pair. Can deposit and stake
                pair &&
                  pair &&
                  pair.gauge &&
                  pair.gauge.address &&
                  SLPCount === 1 && (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        className={
                          (amount0 === "" && amount1 === "") ||
                          depositLoading ||
                          stakeLoading ||
                          depositStakeLoading
                            ? classes.multiApprovalButton
                            : classes.buttonOverride
                        }
                        color="primary"
                        disabled={
                          (amount0 === "" && amount1 === "") ||
                          depositLoading ||
                          stakeLoading ||
                          depositStakeLoading
                        }
                        onClick={isMainnet ? onDeposit : onDepositAndStake} //나중에 onDepositAndStake로 돌리기
                        sx={{
                          backgroundColor: "white",
                          border: "2px solid #FF9A5F",
                          "&:hover": {
                            backgroundColor: "#FFDABF",
                          },
                        }}
                      >
                        {isMainnet ? (
                          <Typography className={classes.actionButtonText}>
                            {depositLoading ? `Depositing` : `Deposit LP`}
                          </Typography>
                        ) : (
                          <Typography className={classes.actionButtonText}>
                            {depositStakeLoading
                              ? `Depositing`
                              : `Deposit & Stake LP`}
                          </Typography>
                        )}
                        {depositStakeLoading && (
                          <CircularProgress
                            size={13}
                            className={classes.loadingCircle}
                          />
                        )}
                      </Button>
                      {advanced && !isMainnet && (
                        <>
                          <Button
                            variant="contained"
                            size="large"
                            className={
                              (amount0 === "" && amount1 === "") ||
                              depositLoading ||
                              stakeLoading ||
                              depositStakeLoading
                                ? classes.multiApprovalButton
                                : classes.buttonOverride
                            }
                            color="primary"
                            disabled={
                              (amount0 === "" && amount1 === "") ||
                              depositLoading ||
                              stakeLoading ||
                              depositStakeLoading
                            }
                            onClick={onDeposit}
                            sx={{
                              backgroundColor: "white",
                              border: "2px solid #FF9A5F",
                              "&:hover": {
                                backgroundColor: "#FFDABF",
                              },
                            }}
                          >
                            <Typography className={classes.actionButtonText}>
                              {depositLoading ? `Depositing` : `Deposit LP`}
                            </Typography>
                            {depositLoading && (
                              <CircularProgress
                                size={13}
                                className={classes.loadingCircle}
                              />
                            )}
                          </Button>
                          <Button
                            variant="contained"
                            size="large"
                            className={
                              BigNumber(pair.balance).eq(0) ||
                              depositLoading ||
                              stakeLoading ||
                              depositStakeLoading
                                ? classes.multiApprovalButton
                                : classes.buttonOverride
                            }
                            color="primary"
                            disabled={
                              BigNumber(pair.balance).eq(0) ||
                              depositLoading ||
                              stakeLoading ||
                              depositStakeLoading
                            }
                            onClick={onStake}
                            sx={{
                              backgroundColor: "white",
                              border: "2px solid #FF9A5F",
                              "&:hover": {
                                backgroundColor: "#FFDABF",
                              },
                            }}
                          >
                            <Typography className={classes.actionButtonText}>
                              {BigNumber(pair.balance).gt(0)
                                ? stakeLoading
                                  ? `Staking`
                                  : `Stake ${formatCurrency(pair.balance)} LP`
                                : `Nothing to staked`}
                            </Typography>
                            {stakeLoading && (
                              <CircularProgress
                                size={13}
                                className={classes.loadingCircle}
                              />
                            )}
                          </Button>
                        </>
                      )}
                    </>
                  )
              }
            </div>
          )}
          {activeTab === "withdraw" && (
            <div className={classes.actionsContainer}>
              {!(pair && pair.gauge && pair.gauge.address) && (
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  className={
                    depositLoading || withdrawAmount === ""
                      ? classes.multiApprovalButton
                      : classes.buttonOverride
                  }
                  disabled={depositLoading || withdrawAmount === ""}
                  onClick={onNoneGaugeWithdraw}
                  sx={{
                    backgroundColor: "white",
                    border: "2px solid #FF9A5F",
                    "&:hover": {
                      backgroundColor: "#FFDABF",
                    },
                  }}
                >
                  <Typography className={classes.actionButtonText}>
                    {depositLoading
                      ? `Withdrawing`
                      : SLPCount === 1
                      ? `Withdraw`
                      : SLPCount === 2
                      ? `Withdraw ${pair.token0.symbol}`
                      : `Withdraw ${pair.token1.symbol}`}
                  </Typography>
                  {depositLoading && (
                    <CircularProgress
                      size={13}
                      className={classes.loadingCircle}
                    />
                  )}
                </Button>
              )}
              {pair?.gauge?.balance <= 0 && pair?.balance > 0 && (
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  className={
                    depositLoading || withdrawAmount === ""
                      ? classes.multiApprovalButton
                      : classes.buttonOverride
                  }
                  disabled={depositLoading || withdrawAmount === ""}
                  onClick={onNoneGaugeWithdraw}
                  sx={{
                    backgroundColor: "white",
                    border: "2px solid #FF9A5F",
                    "&:hover": {
                      backgroundColor: "#FFDABF",
                    },
                  }}
                >
                  <Typography className={classes.actionButtonText}>
                    {depositLoading
                      ? `Withdrawing`
                      : SLPCount === 1
                      ? `Withdraw`
                      : SLPCount === 2
                      ? `Withdraw ${pair.token0.symbol}`
                      : `Withdraw ${pair.token1.symbol}`}
                  </Typography>
                  {depositLoading && (
                    <CircularProgress
                      size={13}
                      className={classes.loadingCircle}
                    />
                  )}
                </Button>
              )}
              {pair &&
                pair.gauge &&
                pair.gauge.address &&
                pair.gauge.balance > 0 && (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      color="primary"
                      className={
                        depositLoading ||
                        stakeLoading ||
                        depositStakeLoading ||
                        withdrawAmount === ""
                          ? classes.multiApprovalButton
                          : classes.buttonOverride
                      }
                      disabled={
                        depositLoading ||
                        stakeLoading ||
                        depositStakeLoading ||
                        withdrawAmount === ""
                      }
                      onClick={isMainnet ? onWithdraw : onUnstakeAndWithdraw} //나중에 onUnstakeAndWithdraw로 바꾸기
                      sx={{
                        backgroundColor: "white",
                        border: "2px solid #FF9A5F",
                        "&:hover": {
                          backgroundColor: "#FFDABF",
                        },
                      }}
                    >
                      {isMainnet ? (
                        <Typography className={classes.actionButtonText}>
                          {BigNumber(pair.balance).gt(0)
                            ? depositLoading
                              ? `Withdrawing`
                              : `Withdraw ${formatCurrency(pair.balance)} LP`
                            : `Nothing to Withdraw`}
                        </Typography>
                      ) : (
                        <Typography className={classes.actionButtonText}>
                          {depositStakeLoading
                            ? `Withdrawing`
                            : `Unstake and Withdraw`}
                        </Typography>
                      )}
                      {depositStakeLoading && (
                        <CircularProgress
                          size={13}
                          className={classes.loadingCircle}
                        />
                      )}
                    </Button>
                    {advanced && !isMainnet && (
                      <>
                        <Button
                          variant="contained"
                          size="large"
                          className={
                            withdrawAmount === "" ||
                            depositLoading ||
                            stakeLoading ||
                            depositStakeLoading
                              ? classes.multiApprovalButton
                              : classes.buttonOverride
                          }
                          color="primary"
                          disabled={
                            withdrawAmount === "" ||
                            depositLoading ||
                            stakeLoading ||
                            depositStakeLoading
                          }
                          onClick={onUnstake}
                          sx={{
                            backgroundColor: "white",
                            border: "2px solid #FF9A5F",
                            "&:hover": {
                              backgroundColor: "#FFDABF",
                            },
                          }}
                        >
                          <Typography className={classes.actionButtonText}>
                            {stakeLoading ? `Unstaking` : `Unstake LP`}
                          </Typography>
                          {stakeLoading && (
                            <CircularProgress
                              size={13}
                              className={classes.loadingCircle}
                            />
                          )}
                        </Button>
                        <Button
                          variant="contained"
                          size="large"
                          className={
                            BigNumber(pair.balance).eq(0) ||
                            depositLoading ||
                            stakeLoading ||
                            depositStakeLoading
                              ? classes.multiApprovalButton
                              : classes.buttonOverride
                          }
                          color="primary"
                          disabled={
                            BigNumber(pair.balance).eq(0) ||
                            depositLoading ||
                            stakeLoading ||
                            depositStakeLoading
                          }
                          onClick={onWithdraw}
                          sx={{
                            backgroundColor: "white",
                            border: "2px solid #FF9A5F",
                            "&:hover": {
                              backgroundColor: "#FFDABF",
                            },
                          }}
                        >
                          <Typography className={classes.actionButtonText}>
                            {BigNumber(pair.balance).gt(0)
                              ? depositLoading
                                ? `Withdrawing`
                                : SLPCount === 2
                                ? `Withdraw ${formatCurrency(
                                    pair.balance
                                  )} LP to ${pair.token0.symbol}`
                                : SLPCount === 3
                                ? `Withdraw ${formatCurrency(
                                    pair.balance
                                  )} LP to ${pair.token1.symbol}`
                                : `Withdraw ${formatCurrency(pair.balance)} LP`
                              : `Nothing to Withdraw`}
                          </Typography>
                          {depositLoading && (
                            <CircularProgress
                              size={13}
                              className={classes.loadingCircle}
                            />
                          )}
                        </Button>
                      </>
                    )}
                  </>
                )}
            </div>
          )}
        </div>
      </Paper>
    </div>
  );
}

function AssetSelect({ type, value, assetOptions, onSelect, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredAssetOptions, setFilteredAssetOptions] = useState([]);
  const [manageLocal, setManageLocal] = useState(false);

  const openSearch = () => {
    if (disabled) {
      return false;
    }
    setSearch("");
    setOpen(true);
  };

  const getTokenInfo = async (address) => {
    const web3 = await stores.accountStore.getWeb3Provider();

    const tokenContract = new web3.eth.Contract(
      CONTRACTS.ERC20_ABI as AbiItem[],
      address
    );

    const owner = stores.accountStore.getStore("account");
    if (owner && owner.address) {
      const [symbol, balanceOf, name, decimals] = await Promise.all([
        tokenContract.methods.symbol().call(),
        tokenContract.methods.balanceOf(owner.address).call(),
        tokenContract.methods.name().call(),
        tokenContract.methods.decimals().call(),
      ]);
      const balance = BigNumber(balanceOf)
        .div(10 ** decimals)
        .toFixed(parseInt(decimals));

      const newBaseAsset: BaseAsset = {
        address: address,
        symbol: symbol,
        name: name,
        decimals: parseInt(decimals),
        logoURI: null,
        local: true,
        balance: balance,
        isWhitelisted: false,
      };
      return newBaseAsset;
    }
  };

  // TODO this useEffect needs to be refactored.
  useEffect(() => {
    async function sync() {
      let ao = assetOptions.filter((asset) => {
        if (search && search !== "") {
          return (
            asset.address?.toLowerCase().includes(search.toLowerCase()) ||
            asset.symbol?.toLowerCase().includes(search.toLowerCase()) ||
            asset.name?.toLowerCase().includes(search.toLowerCase())
          );
        } else {
          return true;
        }
      });
      //no options in our default list and its an address we search for the address
      if (ao.length === 0 && search && search.length === 42) {
        const result = await getTokenInfo(search);
        ao.push(result);
      }

      setFilteredAssetOptions(ao);
    }
    sync();
    return () => {};
  }, [assetOptions, search]);

  const onSearchChanged = async (event) => {
    setSearch(event.target.value);
  };

  const onLocalSelect = (type, asset) => {
    setSearch("");
    setManageLocal(false);
    setOpen(false);
    onSelect(type, asset);
  };

  const onClose = () => {
    setManageLocal(false);
    setSearch("");
    setOpen(false);
  };

  const renderAssetOption = (type, asset, idx) => {
    return (
      <MenuItem
        key={asset.address + "_" + idx}
        className={classes.assetSelectMenu}
        onClick={() => {
          onLocalSelect(type, asset);
        }}
        style={{ margin: "12px 0" }}
      >
        {type !== "withdraw" ? (
          <div className={classes.assetSelectMenuItem}>
            <div className={classes.displayDualIconContainerSmall}>
              <img
                className={classes.displayAssetIconSmall}
                alt=""
                src={asset ? `${asset.logoURI}` : ""}
                height="60px"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src =
                    "/tokens/unknown-logo.png";
                }}
              />
            </div>
          </div>
        ) : (
          <div className={classes.assetSelectMenuItem}>
            <div className={classes.displayDualIconContainerSmall}>
              <div
                style={{
                  display: "flex",
                  position: "relative",
                  width: "25%",
                  height: "35px",
                  minWidth: "75px",
                }}
              >
                <img
                  className={classes.img1Logo}
                  src={asset?.token0?.logoURI || ""}
                  width="30"
                  height="30"
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src =
                      "/tokens/unknown-logo.png";
                  }}
                />
                <img
                  className={classes.img2Logo}
                  src={asset?.token1?.logoURI || ""}
                  width="30"
                  height="30"
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src =
                      "/tokens/unknown-logo.png";
                  }}
                />
              </div>
            </div>
          </div>
        )}
        <div className={classes.assetSelectIconName}>
          <Typography
            variant="h5"
            style={{
              color: "#000000",
              fontWeight: "500",
              fontSize: "16px",
              padding: "1px",
            }}
          >
            {asset ? asset.symbol : ""}
          </Typography>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            style={{ fontSize: "12px", padding: "1px" }}
          >
            {asset ? asset.name : ""}
          </Typography>
        </div>
        <div className={classes.assetSelectBalance}>
          <Typography variant="h5">
            {type === "withdraw"
              ? asset && asset.gauge
                ? asset.gauge.balance > 0
                  ? " " + formatCurrency(asset.gauge.balance)
                  : formatCurrency(asset.balance)
                : asset.balance
                ? formatCurrency(asset.balance)
                : "0.00"
              : asset && asset.balance
              ? formatCurrency(asset.balance)
              : "0.00"}
            {/* asset && asset.balance
            ? " " + formatCurrency(asset.balance)
            :  */}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {asset && asset.gauge && asset.gauge.balance > 0
              ? "Staked Balance"
              : asset.balance
              ? "Pool Balance"
              : "0.00"}
          </Typography>
        </div>
      </MenuItem>
    );
  };

  const renderOptions = () => {
    return (
      <>
        <div className={classes.searchContainer}>
          <div className={classes.searchInline}>
            <TextField
              autoFocus
              variant="outlined"
              fullWidth
              placeholder="EASY, USDC, 0x..."
              value={search}
              onChange={onSearchChanged}
              sx={{ input: { color: "#000" } }}
              autoComplete="off"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div className={classes.assetSearchResults}>
            {filteredAssetOptions && filteredAssetOptions.length > 0 ? (
              filteredAssetOptions
                .sort((a, b) => {
                  if (BigNumber(a.balance).lt(b.balance)) return 1;
                  if (BigNumber(a.balance).gt(b.balance)) return -1;
                  if (a.symbol.toLowerCase() < b.symbol.toLowerCase())
                    return -1;
                  if (a.symbol.toLowerCase() > b.symbol.toLowerCase()) return 1;
                  return 0;
                })
                .map((asset, idx) => {
                  return renderAssetOption(type, asset, idx);
                })
            ) : (
              <div>
                <Typography>No results</Typography>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div
        className={classes.displaySelectContainer}
        onClick={() => {
          openSearch();
        }}
      >
        <div className={classes.assetSelectMenuItem}>
          {type !== "withdraw" ? (
            <div className={classes.displayDualIconContainer}>
              <div
                style={{
                  display: "flex",
                  position: "relative",
                  alignItems: "center",
                }}
              >
                <img
                  className={classes.displayAssetIcon}
                  alt=""
                  src={value ? `${value.logoURI}` : ""}
                  height="100px"
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src =
                      "/tokens/unknown-logo.png";
                  }}
                />
                <Typography className={classes.assetTypo}>
                  {value?.symbol}
                  <svg
                    width="12"
                    height="7"
                    viewBox="0 0 12 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.97168 1L6.20532 6L11.439 1"
                      stroke="#AEAEAE"
                    ></path>
                  </svg>
                </Typography>
              </div>
            </div>
          ) : (
            <div className={classes.displayDualIconContainer}>
              <div
                style={{
                  display: "flex",
                  position: "relative",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    position: "relative",
                    width: "23px",
                    height: "23px",
                  }}
                >
                  <img
                    alt=""
                    src={value?.token0?.logoURI || ""}
                    style={{
                      position: "absolute",
                      borderRadius: "50px",
                      background: "rgb(25, 33, 56)",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src =
                        "/tokens/unknown-logo.png";
                    }}
                  />
                  <img
                    alt=""
                    src={value?.token1?.logoURI || ""}
                    style={{
                      position: "absolute",
                      borderRadius: "50px",
                      background: "rgb(25, 33, 56)",
                      left: "20px",
                      zIndex: "1",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src =
                        "/tokens/unknown-logo.png";
                    }}
                  />
                </div>
                <Typography
                  className={classes.assetTypo}
                  style={{ paddingLeft: "20px" }}
                >
                  {value?.symbol}
                  <svg
                    width="12"
                    height="7"
                    viewBox="0 0 12 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.97168 1L6.20532 6L11.439 1"
                      stroke="#AEAEAE"
                    ></path>
                  </svg>
                </Typography>
              </div>
            </div>
          )}
        </div>
      </div>
      <Dialog
        onClose={onClose}
        aria-labelledby="simple-dialog-title"
        open={open}
      >
        {!manageLocal && renderOptions()}
      </Dialog>
    </>
  );
}
