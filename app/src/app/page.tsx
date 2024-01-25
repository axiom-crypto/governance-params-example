"use client";

import Title from '@/components/ui/Title'
import { forwardSearchParams } from '@/lib/utils'
import AdvanceStepButton from '@/components/ui/AdvanceStepButton';
import CodeBox from '@/components/ui/CodeBox';
import { useAccount } from 'wagmi';
import Parameters from '@/components/tokenContract/Parameters';
import MintNft from '@/components/nftContract/MintNft';

export default async function Home() {
  const { address } = useAccount();

  let compiledCircuit;
  try {
    compiledCircuit = require("../../axiom/data/compiled.json");
  } catch (e) {
    console.log(e);
  }
  if (compiledCircuit === undefined) {
    return (
      <>
        <div>
          Compile circuit first by running in the root directory of this project:
        </div>
        <CodeBox>
          {"npx axiom compile circuit app/axiom/governance.circuit.ts"}
        </CodeBox>
      </>
    )
  }

  return (
    <>
      <Title>
        Governance Parameters Example
      </Title>
      <div className="flex flex-col text-center items-center gap-4">
        <p>
          This autonomous governance example app gives users who have <b>minted</b> a project&apos;s NFT&nbsp;
          <b>and</b> are still holding it the ability to vote on a proposal and instantaneously contribute to the outcome.
        </p>
        <p>
          Users who qualify have the ability to increase the transfer tax rate and staking rate on an example ERC-20
          token called UselessToken (which does not actually implement tax or staking functionality). 
        </p>
        <p>
          The minting qualifications are low in this example so that anyone can run it, but you can imagine that if you were to&nbsp;
          have this run 1 year after an NFT&apos;s mint, it would be a very exclusive group of users who would be&nbsp;
          able to participate.
        </p>
        <p>
          Eligible users who vote YES (1) on the proposal will increase the tax and staking rates by&nbsp;
          <span className="font-mono">0.1%</span>, while users who vote NO (2) will decrease the tax and staking rates&nbsp;
          by <span className="font-mono">0.1%</span>.
        </p>
        <Parameters />
        <div className="flex flex-col gap-4 w-fit">
          <div className="flex flex-col gap-2">
            <p className="text-lg text-highlight">
              <b>Step 1</b>
            </p>
            <MintNft />
            <p className="text-sm">
              You may need to wait a minute or two for the indexer to pick up the Mint event
            </p>
          </div>
          <div className="flex flex-col gap-2 ">
            <p className="text-lg text-highlight">
              <b>Step 2</b>
            </p>
            <AdvanceStepButton
              label="Check Eligibility"
              href={"/check?" + forwardSearchParams({ connected: address })}
            />
          </div>
        </div>
      </div>
    </>
  )
}