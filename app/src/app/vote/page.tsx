import { UserInput } from "@axiom-crypto/client";
import BuildQuery from "@/components/vote/BuildQuery";
import Title from "@/components/ui/Title";
import jsonInputs from "../../../axiom/data/inputs.json";
import { publicClient } from "@/lib/viemClient";
import { Constants } from "@/shared/constants";

interface PageProps {
  params: Params;
  searchParams: SearchParams;
}

interface Params {
  slug: string;
}

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export default async function Vote({ searchParams }: PageProps) {
  // destructures the searchParams to get the txHash, blockNumber, and tokenId
  const txHash = searchParams?.txHash as string ?? "";
  const blockNumber = searchParams?.blockNumber as string ?? "";
  const tokenId = searchParams?.tokenId as string ?? "";

  // Gets transaction details based on txHash and calucaltes the transaction index
  const tx = await publicClient.getTransaction({
    hash: txHash as `0x${string}`,
  });
  const txIdx = tx.transactionIndex.toString();

  // Build circuit inputs
  const inputs: UserInput<typeof jsonInputs> = {
    nftContract: String(Constants.NFT_ADDR),
    mintBlock: Number(blockNumber),
    mintTxNo: Number(txIdx),
    vote: 0,  // Update this value later inside `BuildQuery` component
  }

  // // Listen for `ParametersUpdated` event
  // publicClient.watchContractEvent({
  //   address: Constants.ERC20_ADDR as `0x${string}`,
  //   abi: UselessGovernanceToken.abi,
  //   eventName: 'ParametersUpdated',
  //   onLogs: logs => {
  //     console.log(logs);
  //     console.log("Voted successfully!")
  //     redirect(`success/?connected=${connected}`);
  //   }
  // })

  // The BuildQuery component is passed the inputs, callbackAddress, and tokenId
  // This component allows the user to vote either yes or no and submits the vote using BuildQuery
  return (
    <>
      <Title>
        Vote
      </Title>
      <div className="flex flex-col items-center text-center gap-0">
        <p>
          Vote <b>YES</b> to <b>increase</b> tax and staking rates by <span className="font-mono">0.1%</span>.
        </p>
        <p>
          Vote <b>NO</b> to <b>decrease</b> tax and staking rates by <span className="font-mono">0.1%</span>.
        </p>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <BuildQuery
          inputs={inputs}
          callbackAddress={Constants.GOVERNANCE_ADDR}
          tokenId={tokenId}
        />
      </div>
    </>
  )
}
