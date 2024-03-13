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

// BuildQuery takes in inputs, callbackAddress, and tokenId as props
export default function BuildQuery({
  inputs,
  callbackTarget,
  tokenId,
}: {
  inputs: UserInput<typeof jsonInputs>,
  callbackTarget: string;
  tokenId: string,
}) {
  const { address } = useAccount();
  const [voteValue, setVoteValue] = useState<number | null>(null);

  // Initializes vairables by destructuring the return values of the useAxiomCircuit hook
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
    setParams(inputsWithVote, callbackTarget, "", address);
  }, [voteValue, setParams, inputs, callbackTarget, address]);

  // Defines buildQuery function which checks that voteValue is not null
  // and that areParamsSet is true. If both are true, it calls the buildQuery function
  // When coteValue, build, or areParamsSet change, the buildQuery function is called to ensure 
  // the query is built if any of these change
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
