import React, { useState, useEffect } from "react";
import type { AppProps } from "next/app";
//import { Analytics } from '@vercel/analytics/react';
import Head from "next/head";
import Layout from "../components/layout/layout";
import Loading from "../components/loading";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useRouter } from "next/router";
import lightTheme from "../theme/light";
import darkTheme from "../theme/dark";

import Configure from "./configure";

import stores from "../stores/index";

import { ACTIONS } from "../stores/constants/constants";
import "../styles/global.css";

//////console.log('<<<<<<<<<<<<< flow >>>>>>>>>>>>>')

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [themeConfig, setThemeConfig] = useState(darkTheme);
  const [stalbeSwapConfigured, setStableSwapConfigured] = useState(false);
  const [accountConfigured, setAccountConfigured] = useState(false);
  const [isDone, setisDone] = useState(false);
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  const changeTheme = (dark) => {
    // setThemeConfig(dark ? darkTheme : lightTheme);
    // localStorage.setItem('yearn.finance-dark-mode', dark ? 'dark' : 'light');
  };
  const ConfigureDone = () => {
    setisDone(true);
    //////console.log("isDone in _app", isDone)
  };

  const accountConfigureReturned = () => {
    setAccountConfigured(true);
  };

  const stableSwapConfigureReturned = () => {
    setStableSwapConfigured(true);
  };

  useEffect(function () {
    const localStorageDarkMode = window.localStorage.getItem(
      "yearn.finance-dark-mode"
    );
    changeTheme(localStorageDarkMode ? localStorageDarkMode === "dark" : false);
  }, []);

  useEffect(function () {
    stores.emitter.on(ACTIONS.CONFIGURE_DONE, ConfigureDone);
    stores.emitter.on(ACTIONS.CONFIGURED_SS, stableSwapConfigureReturned);
    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, accountConfigureReturned);
    //////console.log("start")
    stores.dispatcher.dispatch({ type: ACTIONS.CONFIGURE });

    return () => {
      stores.emitter.removeListener(ACTIONS.CONFIGURE_DONE, ConfigureDone);
      stores.emitter.removeListener(
        ACTIONS.CONFIGURED_SS,
        stableSwapConfigureReturned
      );
      stores.emitter.removeListener(
        ACTIONS.ACCOUNT_CONFIGURED,
        accountConfigureReturned
      );
    };
  }, []);

  const validateConfigured = () => {
    switch (router.pathname) {
      case "/":
        return accountConfigured;
      default:
        return accountConfigured;
    }
  };
  if (router.pathname == "/home") {
    return (
      <React.Fragment>
        <Head>
          <title>EasySwap | New generation toolDEX</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>
        <ThemeProvider theme={themeConfig}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {validateConfigured() && (
            <Layout>
              <Component {...pageProps} changeTheme={changeTheme} />
            </Layout>
          )}
          {!validateConfigured() && <Configure {...pageProps} />}
        </ThemeProvider>
        {/* <Analytics /> */}
      </React.Fragment>
    );
  }
  if (router.pathname !== "/home" && isDone) {
    return (
      <React.Fragment>
        <Head>
          <title>EasySwap | New generation toolDEX</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>
        <ThemeProvider theme={themeConfig}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {validateConfigured() && (
            <Layout>
              <Component {...pageProps} changeTheme={changeTheme} />
            </Layout>
          )}
          {!validateConfigured() && <Configure {...pageProps} />}
        </ThemeProvider>
        {/* <Analytics /> */}
      </React.Fragment>
    );
  } else if (router.pathname !== "/home" && !isDone) {
    return (
      <React.Fragment>
        <Head>
          <title>EasySwap | New generation toolDEX</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>
        <ThemeProvider theme={themeConfig}>
          {validateConfigured() && !isDone && <Loading />}
        </ThemeProvider>
      </React.Fragment>
    );
  }
}
