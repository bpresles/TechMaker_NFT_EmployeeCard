import useEmployeeCardBalance from "../hooks/useEmployeeCardBalance";

type TokenBalanceProps = {
  account: string;
};

const TokenBalance = ({ account }: TokenBalanceProps) => {
  const { data } = useEmployeeCardBalance(account);

  return (
    <p>
      The entered wallet address has already {parseInt(data ?? 0)} employee card
    </p>
  );
};

export default TokenBalance;
