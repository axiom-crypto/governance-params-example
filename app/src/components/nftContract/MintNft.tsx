"use client";

import { 
  useAccount,
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import GovernanceNFT from "@/lib/abi/GovernanceNFT.json";
import { Constants } from "@/shared/constants";
import Button from "@/components/ui/Button";
import ConnectWallet from "../ui/ConnectWallet";

export default function MintNft() {
  const { address } = useAccount();

  const { data, error } = useSimulateContract({
    address: Constants.NFT_ADDR as `0x${string}`,
    abi: GovernanceNFT.abi,
    functionName: 'mint',
    args: [],
    account: address,
  });
  const { data: hash, isError, writeContract } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  if (address === undefined) {
    return <ConnectWallet />;
  }
  
  const renderButtonText = () => {
    if (isLoading) {
      return "Loading...";
    } else if (isSuccess) {
      return "Minted!";
    } else if (isError) {
      return "Error";
    } else {
      return "Mint NFT";
    }
  }

  return (
    <Button 
      disabled={!Boolean(data?.request) || isLoading || isSuccess} 
      onClick={() => writeContract(data!.request)}
    >
      { renderButtonText() }
    </Button>
  )
};