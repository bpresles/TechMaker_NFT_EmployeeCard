import { BigNumber, BigNumberish, ContractTransaction } from "ethers";
import EmployeeCardContract from "../contracts/EmployeeCard.json";
import type { EmployeeCard } from "../contracts/types";
import useContract from "./useContract";

export default function useEmployeeCardContract() {
    const contract: EmployeeCard = useContract<EmployeeCard>(EmployeeCardContract.networks[5777].address, EmployeeCardContract.abi);

    async function mintEmployeeCard(account: string, tokenURI: string, startDate: BigNumberish): Promise<ContractTransaction> {
        return contract.mint(account, tokenURI, startDate);
    }

    async function getEmployeeVacationRights(account: string): Promise<BigNumber> {
        const result = contract.getEmployeeVacationRights(account);

        result.then((result) => {
            console.log(result);
        })
        .catch((err) => console.log(err));

        return result;
    }

    return {
        contract,
        getEmployeeVacationRights,
        mintEmployeeCard
    }
}
