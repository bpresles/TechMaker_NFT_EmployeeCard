import useEmployeeCardBalance from "../hooks/useEmployeeCardBalance";
import { parseBalance, parseBalanceToken } from "../util";

type TokenBalanceProps = {
  account: string;
};

const TokenBalance = ({ account }: TokenBalanceProps) => {
  const { data } = useEmployeeCardBalance(account);

  return (
    <p>
      The entered wallet address has already {parseBalanceToken(data ?? 0)} employee card
    </p>
  );
};

export default TokenBalance;
