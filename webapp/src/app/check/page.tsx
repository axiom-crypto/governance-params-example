import LinkButton from "@/components/ui/LinkButton";
import Title from "@/components/ui/Title";
import { findMostRecentMintTx } from "@/lib/parseRecentTx";

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

export default async function Check({ searchParams }: PageProps) {
  const connected = searchParams?.connected as string ?? "";

  // Find the user's uniswap transaction with the `Swap` event
  const mintTx = await findMostRecentMintTx(connected);
  console.log(mintTx);

  const renderNotEligible = () => {
    return (
      <>
        <div className="text-center">
          {"Sorry, we couldn't find a Transfer (mint) event for Useless NFT."}
        </div>
        <LinkButton
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

    return (
      <>
        <div className="text-center">
          {"Congratulations! You are eligible to vote on governance parameters. Your vote will directly impact contract parameters!"}
        </div>
        <LinkButton
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

  return (
    <>
      <Title>
        Check eligibility
      </Title>
      {mintTx !== null ? renderEligible() : renderNotEligible()}
    </>
  )
}
