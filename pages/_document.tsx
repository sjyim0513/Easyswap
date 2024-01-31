import React from "react";
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from "next/document";
import { ServerStyleSheets } from "@mui/styles";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* <link rel="stylesheet" href="/fonts/Inter/Inter.css" />
          <link rel="stylesheet" href="/fonts/MonumentExt/Monument.css" />
          <link rel="stylesheet" href="/fonts/Druk/Druk.css" />
          <link rel="stylesheet" href="/fonts/Sans/DMSans.css" /> */}
          {/* <link href="https://fonts.googleapis.com/css2?family=Kanit&display=swap" rel="stylesheet" /> */}
        </Head>
        <body style={{ backgroundColor: "#fff8f3" }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with server-side generation (SSG).
MyDocument.getInitialProps = async (
  ctx: DocumentContext
): Promise<DocumentInitialProps> => {
  // Render app and page and get the context of the page with collected side effects.
  const sheets = new ServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
    });

  const initialProps = await Document.getInitialProps(ctx);
  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      ...React.Children.toArray(initialProps.styles),
      sheets.getStyleElement(),
    ],
  };
};
