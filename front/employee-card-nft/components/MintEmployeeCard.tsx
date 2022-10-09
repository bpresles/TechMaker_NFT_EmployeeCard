import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { UserRejectedRequestError } from "@web3-react/injected-connector";
import { useState } from "react";
import EmployeeCardFactory from "../contracts/EmployeeCardFactory.json"
import useEmployeeCardBalance from "../hooks/useEmployeeCardBalance";
import useEmployeeCardContract from "../hooks/useEmployeeCardContract";
import useMetaMaskOnboarding from "../hooks/useMetaMaskOnboarding";
import { parseBalance } from "../util";

type MintEmployeeCardProps = {
    tokenURI: string;
    startDate: number;
  };

const MintEmployeeCard = ({tokenURI, startDate}: MintEmployeeCardProps) => {
    const { active, error, activate, chainId, account, setError } =
        useWeb3React();
    const { contract, mintEmployeeCard } = useEmployeeCardContract();

    const {
        isMetaMaskInstalled,
        isWeb3Available,
    } = useMetaMaskOnboarding();

    const {data} = useEmployeeCardBalance(account);
    const balance = parseInt(data ?? 0);

    // manage minting state
    const [minting, setMinting] = useState(false);
    const [minted, setMinted] = useState((balance > 0));

    return (
        <div>
            {isWeb3Available ? (
                <button
                disabled={minting || minted || (balance > 0)}
                onClick={() => {
                    setMinting(true);
                    setMinted(false);

                    mintEmployeeCard(account, tokenURI, startDate).then(() => {
                        setMinting(false);
                        setMinted(true);
                    })
                    .catch((error) => {
                        // ignore the error if it's a user rejected request
                        if (error instanceof UserRejectedRequestError) {
                            setMinting(false);
                            setMinted(false);
                        } else {
                            setError(error);
                            setMinted(false);
                        }
                    });
                }}
                >
                    Mint your employee card
                </button>
            ) : (
                <p>{isMetaMaskInstalled ? "Connect to MetaMask first" : "Connect to your Wallet first"}</p>
            )}
        </div>
    );
};

export default MintEmployeeCard;