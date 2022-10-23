import { BigNumberish, ContractTransaction } from "ethers";
import EmployeeCardContract from "../contracts/EmployeeCard.json";
import type { EmployeeCard } from "../contracts/types";
import useContract from "./useContract";

export default function useEmployeeCardContract() {
    const contract: EmployeeCard = useContract<EmployeeCard>(EmployeeCardContract.networks[5].address, EmployeeCardContract.abi);

    async function mintEmployeeCard(account: string, tokenURI: string, startDate: BigNumberish): Promise<ContractTransaction> {
        return contract.mint(account, tokenURI, startDate);
    }

    return {
        contract,
        mintEmployeeCard
    }
}
