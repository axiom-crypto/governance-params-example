"use client";

import { useAxiomCircuit } from "@axiom-crypto/react";
import jsonInputs from "../../../axiom/data/inputs.json";
import { useEffect, useState } from "react";
import LoadingAnimation from "../ui/LoadingAnimation";
import SubmitVoteClient from "./SubmitVoteClient";
import { useAccount, useReadContract } from "wagmi";
import { Constants } from "@/shared/constants";
import { pad } from "viem";
import GovernanceToken from "@/lib/abi/GovernanceToken.json";
import AdvanceStepButton from "../ui/AdvanceStepButton";
import { UserInput } from "@axiom-crypto/client";

export default function BuildQuery({
  inputs,
  callbackAddress,
  tokenId,
}: {
  inputs: UserInput<typeof jsonInputs>,
  callbackAddress: string;
  tokenId: string,
}) {
  const { address } = useAccount();
  const [voteValue, setVoteValue] = useState<number | null>(null);
  const {
    build,
    builtQuery,
    setParams,
    areParamsSet
  } = useAxiomCircuit();

  useEffect(() => {
    if (voteValue === null) {
      return;
    }
    if (address === undefined) {
      return;
    }
    const inputsWithVote = {
      ...inputs,
      vote: voteValue,
    };
    const callbackExtraData = pad(address);
    console.log("callbackExtraData", callbackExtraData);
    setParams(inputsWithVote, callbackAddress, callbackExtraData, address);
  }, [voteValue, setParams, inputs, callbackAddress, address]);

  useEffect(() => {
    const buildQuery = async () => {
      if (voteValue === null) {
        return;
      }
      if (!areParamsSet) {
        return;
      }
      await build();
    };
    buildQuery();
  }, [voteValue, build, areParamsSet]);

  // Check that the user has not voted with this tokenId yet
  const { data: didUserVote, isLoading: didUserVoteLoading } = useReadContract({
    address: Constants.GOVERNANCE_ADDR as `0x${string}`,
    abi: GovernanceToken.abi,
    functionName: 'didUserVote',
    args: [address, tokenId],
  });
  console.log("didUserVote?", didUserVote);

  if (!!didUserVote) {
    return (
      <div className="flex flex-col items-center text-center gap-2">
        <p>
          User has already voted with tokenId {BigInt(tokenId).toString()}.
        </p>
        <AdvanceStepButton
          label="Go back"
          href="/"
        />
      </div>
    )
  }

  if (voteValue === null) {
    return (
      <div className="flex flex-col items-center text-center gap-2">
        <p>
          Voting with tokenId {BigInt(tokenId).toString()}.
        </p>
        <div className="grid grid-cols-2 gap-4 w-fit">
          <div className="flex flex-row font-mono gap-2">
            <input type="radio" name="vote" value={1} onChange={() => setVoteValue(1)} />
            YES
          </div>
          <div className="flex flex-row font-mono gap-2">
            <input type="radio" name="vote" value={2} onChange={() => setVoteValue(2)} />
            NO
          </div>
        </div>
      </div>
    )
  }

  if (!builtQuery) {
    return (
      <div className="flex flex-row items-center font-mono gap-2">
        {"Building Query"} <LoadingAnimation />
      </div>
    );
  }

  return <SubmitVoteClient />;
}
