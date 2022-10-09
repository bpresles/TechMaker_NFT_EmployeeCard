import { BigNumberish } from "ethers";
import EmployeeCardContract from "../contracts/EmployeeCardFactory.json";
import type { EmployeeCardFactory } from "../contracts/types";
import useContract from "./useContract";

export default function useEmployeeCardContract() {
    const contract: EmployeeCardFactory = useContract<EmployeeCardFactory>(EmployeeCardContract.address, EmployeeCardContract.abi);

    async function mintEmployeeCard(account: string, tokenURI: string, startDate: BigNumberish) {
        return contract.mint(account, tokenURI, startDate);
    }

    return {
        contract,
        mintEmployeeCard
    }
}
