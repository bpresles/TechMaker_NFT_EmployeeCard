import useSWR from "swr";
import type { EmployeeCard } from "../contracts/types";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";
import useEmployeeCardContract from "./useEmployeeCardContract";

function getEmployeeCardBalance(contract: EmployeeCard) {
  return async (_: string, address: string) => {
    const balance = await contract.balanceOf(address);

    return balance;
  };
}

export default function useEmployeeCardBalance(
  address: string,
  suspense = false
) {
  const { contract } = useEmployeeCardContract();

  const shouldFetch =
    typeof address === "string" &&
    !!contract;

  const result = useSWR(
    shouldFetch ? ["EmployeeCardBalance", address] : null,
    getEmployeeCardBalance(contract),
    {
      suspense,
    }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);

  return result;
}
