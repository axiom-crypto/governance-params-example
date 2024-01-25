import { Constants } from "@/shared/constants";
import GovernanceToken from '@/lib/abi/GovernanceToken.json';
import { publicClient } from "@/lib/viemClient";

export const revalidate = 0;

export default async function Parameters() {
  const taxRate = await publicClient.readContract({
    address: Constants.GOVERNANCE_ADDR as `0x${string}`,
    abi: GovernanceToken.abi,
    functionName: 'taxRate',
  }) as BigInt;

  const rewardRate = await publicClient.readContract({
    address: Constants.GOVERNANCE_ADDR as `0x${string}`,
    abi: GovernanceToken.abi,
    functionName: 'rewardRate',
  }) as BigInt;

  const totalVotes = await publicClient.readContract({
    address: Constants.GOVERNANCE_ADDR as `0x${string}`,
    abi: GovernanceToken.abi,
    functionName: 'totalVotes',
  }) as BigInt;

  return (
    <div className="flex flex-col text-left w-fit m-4">
      <div className="flex flex-row">
        <div className="w-24">
          Tax Rate
        </div>
        <div className="font-mono">
          <b>{ (parseFloat(taxRate.toString()) / 10).toFixed(1) }%</b>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="w-24">
          Reward Rate
        </div>
        <div className="font-mono">
          <b>{ (parseFloat(rewardRate.toString()) / 10).toFixed(1) }%</b>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="w-24">
          Total Votes
        </div>
        <div className="font-mono">
          <b>{ totalVotes.toString() }</b>
        </div>
      </div>
    </div>
  )
}