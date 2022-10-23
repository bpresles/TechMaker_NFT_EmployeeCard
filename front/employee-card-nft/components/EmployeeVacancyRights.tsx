import useEmployeeCardContract from "../hooks/useEmployeeCardContract";
import useMetaMaskOnboarding from "../hooks/useMetaMaskOnboarding";
import TokenBalance from "./TokenBalance";
import useEmployeeCardBalance from "../hooks/useEmployeeCardBalance";
import { useWeb3React } from "@web3-react/core";
import { useState } from "react";
import { BigNumber } from "ethers";

const EmployeeVacancyRights = () => {
    const [employeeRights, setEmployeeRights] = useState(0);

    const { account } = useWeb3React();

    const {
        isMetaMaskInstalled,
        isWeb3Available,
    } = useMetaMaskOnboarding();

    const { contract, getEmployeeVacationRights } = useEmployeeCardContract();
    getEmployeeVacationRights(account).then((response: BigNumber) => {
        console.log(response);
        setEmployeeRights(parseInt(response ?? 0));
    });

    return (
        <div>
            {isWeb3Available ? (
                <div>
                    <p>Contract address: {contract.address}</p>
                    <TokenBalance account={account} />
                    <br/>
                    <div>
                        You've {employeeRights} days of holidays.
                    </div>
                </div>
            ) : (
                <p>{isMetaMaskInstalled ? "Connect to MetaMask first" : "Connect to your Wallet first"}</p>
            )}
            <style jsx>{``}</style>
        </div>
    );
};

export default EmployeeVacancyRights;