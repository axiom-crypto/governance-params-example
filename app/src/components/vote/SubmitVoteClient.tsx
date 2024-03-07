"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useSimulateContract,
  useWatchContractEvent,
} from "wagmi";
import Button from "../ui/Button";
import { formatEther, formatUnits } from "viem";
import Link from "next/link";
import { useAxiomCircuit } from '@axiom-crypto/react';
import Decimals from "../ui/Decimals";
import { useRouter } from "next/navigation";
import { Constants } from "@/shared/constants";
import GovernanceToken from '@/lib/abi/GovernanceToken.json'

export default function SubmitVoteClient() {
  const { address } = useAccount();
  const router = useRouter();
  const { builtQuery } = useAxiomCircuit();
  const [showExplorerLink, setShowExplorerLink] = useState(false);

  // Prepare hook for the sendQuery transaction
  const { data } = useSimulateContract({
    address: builtQuery!.address as `0x${string}`,
    abi: builtQuery!.abi,
    functionName: builtQuery!.functionName,
    value: builtQuery!.value,
    args: builtQuery!.args,
  });
  const { isPending, isSuccess, writeContract } = useWriteContract();

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        setShowExplorerLink(true);
      }, 30000);
    }
  }, [isSuccess, setShowExplorerLink]);

  // Monitor contract for `ClaimAirdrop`
  useWatchContractEvent({
    address: Constants.GOVERNANCE_ADDR as `0x${string}`,
    abi: GovernanceToken.abi,
    eventName: 'ParametersUpdated',
    onLogs(logs: any) {
      console.log(logs);
      let topics = logs[0].topics;
      console.log(topics);
      if (topics[3] && builtQuery?.queryId && BigInt(topics[3]) === BigInt(builtQuery?.queryId)) {
        let txHash = logs[0].transactionHash;
        router.push(`success/?txHash=${txHash}&queryId=${builtQuery?.queryId}`);
      }
    },
  });

  const renderButtonText = () => {
    if (isSuccess) {
      return "Waiting for callback...";
    }
    if (isPending) {
      return "Confrm transaction in wallet...";
    }
    return "Submit Vote";
  }

  const renderVoteProofCostText = () => {
    return (
      <div className="flex flex-col items-center text-sm mt-2">
        <div>
          {"Generating the proof for the claim costs up to "}
          <Decimals>
            {formatEther(BigInt(builtQuery?.value ?? 0)).toString()}
          </Decimals>
          {"ETH"}
        </div>
        <div>
          {"(Based on a current maxFeePerGas of "}
          <Decimals>
            {formatUnits(builtQuery?.args?.[4]?.maxFeePerGas ?? "0", 9).toString()}
          </Decimals>
          {" gwei)"}
        </div>
      </div>
    )
  }

  const renderExplorerLink = () => {
    if (!showExplorerLink) {
      return null;
    }
    return (
      <Link href={`https://explorer.axiom.xyz/v2/goerli/mock`} target="_blank">
        View status on Axiom Explorer
      </Link>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        disabled={!Boolean(data?.request) || isPending || isSuccess}
        onClick={() => writeContract(data!.request)}
      >
        {renderButtonText()}
      </Button>
      <div className="flex flex-col items-center text-sm gap-2">
        <div>
          {isSuccess ? "Proof generation may take up to 3 minutes" : renderVoteProofCostText()}
        </div>
        {renderExplorerLink()}
      </div>
    </div>
  )
}
