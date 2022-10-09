import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import useEmployeeCardBalance from "../hooks/useEmployeeCardBalance";
import { parseBalance } from "../util";

const TokenBalance = () => {
  const { account } = useWeb3React<Web3Provider>();
  const { data } = useEmployeeCardBalance(account);

  return (
    <p>
      You have for now {parseInt(data ?? 0)} employee card
    </p>
  );
};

export default TokenBalance;
