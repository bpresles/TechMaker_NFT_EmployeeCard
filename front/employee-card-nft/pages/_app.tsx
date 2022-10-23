import { Web3ReactProvider } from "@web3-react/core";
import type { AppProps } from "next/app";
import Script from "next/script";
import getLibrary from "../getLibrary";
import "../styles/globals.css";

function NextWeb3App({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Script src="/js/html2pdf.bundle.min.js" strategy="beforeInteractive"></Script>
      <Component {...pageProps} />
    </Web3ReactProvider>
  );
}

export default NextWeb3App;
