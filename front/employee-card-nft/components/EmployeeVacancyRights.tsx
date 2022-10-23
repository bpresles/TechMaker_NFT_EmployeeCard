import useEmployeeCardContract from "../hooks/useEmployeeCardContract";
import useMetaMaskOnboarding from "../hooks/useMetaMaskOnboarding";
import TokenBalance from "./TokenBalance";
import useEmployeeCardBalance from "../hooks/useEmployeeCardBalance";
import { useWeb3React } from "@web3-react/core";
import { useState } from "react";
import { BigNumber } from "ethers";
import { parseBalanceToken } from "../util";

const EmployeeVacancyRights = () => {
    const [employeeRights, setEmployeeRights] = useState('');

    const { account } = useWeb3React();

    const {
        isMetaMaskInstalled,
        isWeb3Available,
    } = useMetaMaskOnboarding();

    const { contract, getEmployeeVacationRights } = useEmployeeCardContract();
    getEmployeeVacationRights(account).then((response: BigNumber) => {
        const nbHolidays = parseBalanceToken(response);
        setEmployeeRights(nbHolidays);
    });

    return (
        <div>
            {isWeb3Available ? (
                <div>
                    <p>Contract address: {contract.address}</p>
                    <TokenBalance account={account} />
                    <br/>
                    <div>
                        You&apos;ve {employeeRights} days of holidays.
                    </div>
                </div>
            ) : (
                <p>{isMetaMaskInstalled ? "Connect to MetaMask first" : "Connect to your Wallet first"}</p>
            )}
        </div>
    );
};

export default EmployeeVacancyRights;