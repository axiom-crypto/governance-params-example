import AdvanceStepButton from "@/components/ui/AdvanceStepButton";
import Title from "@/components/ui/Title";
import { findMostRecentMintTx } from "@/lib/parseRecentTx";

//Interface to specify the expected props for the Check component
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
// passes the searchParams here-- now this component has access to info about the user's wallet
export default async function Check({ searchParams }: PageProps) {
  const connected = searchParams?.connected as string ?? "";

  // Find the user's most recent Mint transaction
  const mintTx = await findMostRecentMintTx(connected);
  console.log(mintTx);

  const renderNotEligible = () => {
    return (
      <>
        <div className="text-center">
          {"Sorry, we couldn't find a Transfer (mint) event for Useless NFT."}
        </div>
        <AdvanceStepButton
          label="Go back"
          href="/"
        />
      </>
    )
  }

  const renderEligible = () => {
    const log = mintTx?.log;
    const txHash = log?.transactionHash;
    const blockNumber = log?.blockNumber;
    const tokenId = log?.topics[3].toString();
    console.log(txHash, blockNumber, tokenId)

    if (txHash === undefined || !blockNumber === undefined) {
      return renderNotEligible();
    }

    //if the user is eligible, they can click the button to go vote
    // the button forwards the user to the vote page with the necessary search parameters
    return (
      <>
        <div className="text-center">
          {"Congratulations! You are eligible to vote on governance parameters. Your vote will directly impact contract parameters."}
        </div>
        <AdvanceStepButton
          label="Build Axiom proof params"
          href={"/vote?" + new URLSearchParams({
            connected,
            txHash,
            blockNumber: blockNumber.toString(),
            tokenId,
          })}
        />
      </>
    )
  }
  // if mintTx is not null, renderEligible is called, otherwise renderNotEligible is called
  return (
    <>
      <Title>
        Check eligibility
      </Title>
      {mintTx !== null ? renderEligible() : renderNotEligible()}
    </>
  )
}
