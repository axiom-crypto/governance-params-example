import { Constants } from "@/shared/constants";
import { zeroAddress, pad } from "viem";

export const revalidate = 0;

// iterates over recent transactions to find the most recent mint associated with the user's address
export async function findMostRecentMintTx(address: string): Promise<any | null> {
  let pageKey = "";
  while (pageKey !== undefined) {
    // Retrieves recent transactions using getRecentTxs, then checks each transaction's receipt to find a 
    // specific transfer event from the user to the NFT contract
    const res = await getRecentTxs(address, pageKey);
    const recentTx = res?.transfers;
    for (const tx of recentTx) {
      // These are only the transactions that are from the user to the NFT contract, since we 
      // constrained the query by `fromAddress` (user) and `toAddress` (NFT contract)
      const receipt = await getRecentReceipt(tx?.hash);
      // check if the receipt contains any logs
      if (receipt.logs.length > 0) {
        // iterate over the logs to find the transfer event
        for (const [idx, log] of receipt.logs.entries()) {
          // check if the log matches the criteria for a transfer event
          if (
            log.topics[0] === Constants.TRANSFER_EVENT_SCHEMA &&
            log.topics[1] === pad(zeroAddress) &&
            log.topics[2].toLowerCase() === pad(address.toLowerCase() as `0x${string}`)
          ) {
            // if the criteria are met, return an object with the index of the log and the log itself
            return {
              logIdx: idx,
              log
            }
          }
        }
      }
    }
    pageKey = res?.pageKey;
  }
  // if no transfer event is found, log a message and return null
  console.log("Could not find any Transfer transaction");
  return null;
}

async function getRecentTxs(address: string, pageKey?: string) {
  let params: {[key: string]: any} = {
    "fromBlock": "0x0",
    "toBlock": "latest",
    "fromAddress": address.toLowerCase(),
    "toAddress": Constants.NFT_ADDR,
    "withMetadata": false,
    "excludeZeroValue": false,
    "maxCount": "0x3e8",
    "order": "desc",
    "category": [
      "external"
    ],
  }
  if (typeof pageKey !== "undefined" && pageKey !== "") {
    params[pageKey] = pageKey;
  }
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_ALCHEMY_URI_SEPOLIA as string, {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "id": 1,
        "jsonrpc": "2.0",
        "method": "alchemy_getAssetTransfers",
        "params": [
          params
        ]
      }),
    })
    const json = await res.json();
    return json?.result;
  } catch (e) {
    return null;
  }
}

async function getRecentReceipt(hash: string) {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_ALCHEMY_URI_SEPOLIA as string, {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "id": 1,
        "jsonrpc": "2.0",
        "method": "eth_getTransactionReceipt",
        "params": [hash]
      }),
    })
    const json = await res.json();
    return json?.result;
  } catch (e) {
    return null;
  }
}
