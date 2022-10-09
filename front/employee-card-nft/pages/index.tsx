import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import Account from "../components/Account";
import ETHBalance from "../components/ETHBalance";
import TokenBalance from "../components/TokenBalance";
import useEagerConnect from "../hooks/useEagerConnect";
import EmployeeCardFactory from "../contracts/EmployeeCardFactory.json"
import MintEmployeeCard from "../components/MintEmployeeCard";

function Home() {
  const { account, library } = useWeb3React();

  const triedToEagerConnect = useEagerConnect();
  const isConnected = typeof account === "string" && !!library;

  const startDate = Date.now();

  return (
    <div>
      <Head>
        <title>next-web3-boilerplate</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <nav>
          <Link href="https://www.younup.fr">
            <a>Younup</a>
          </Link>

          <Account triedToEagerConnect={triedToEagerConnect} />
        </nav>
      </header>

      <main>
        <h1>
          Welcome to{" "}
          <a href="https://github.com/mirshko/next-web3-boilerplate">
            Younup NFT Employee card generator
          </a>
        </h1>

        {isConnected && (
          <section>
            <ETHBalance />

            <TokenBalance />
            <MintEmployeeCard tokenURI="ipfs://QmQFc7MmRgnFSqfQngnzbnByZYBNxuqjrVPL62ZAnc4nV1" startDate={startDate} />
          </section>
        )}
      </main>

      <style jsx>{`
        nav {
          display: flex;
          justify-content: space-between;
        }

        main {
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default Home;
