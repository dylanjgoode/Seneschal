import { parseUnits, formatUnits, type Address } from "viem";
import { publicClient, getWalletClient, getAccount } from "./client";
import { erc20Abi } from "./abi";

const USDC_ADDRESS = process.env.TEMPO_USDC_ADDRESS as Address;
const USDC_DECIMALS = 6;

export interface TransferResult {
  success: boolean;
  txHash: string | null;
  settlementTimeMs: number | null;
  error: string | null;
}

/**
 * Send USDC on Tempo chain to a supplier wallet.
 * Amount is in cents (integer). Converts to USDC decimals internally.
 */
export async function sendUsdcTransfer(
  toAddress: Address,
  amountCents: number
): Promise<TransferResult> {
  const startTime = Date.now();

  try {
    const walletClient = getWalletClient();
    const account = getAccount();

    // Convert cents to USDC (e.g., 500_00 cents = 5000.00 USDC)
    const amountUsdc = (amountCents / 100).toFixed(2);
    const amount = parseUnits(amountUsdc, USDC_DECIMALS);

    // Send transfer
    const txHash = await walletClient.writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "transfer",
      args: [toAddress, amount],
    });

    // Wait for receipt
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    const settlementTimeMs = Date.now() - startTime;

    if (receipt.status === "success") {
      return {
        success: true,
        txHash,
        settlementTimeMs,
        error: null,
      };
    }

    return {
      success: false,
      txHash,
      settlementTimeMs,
      error: "Transaction reverted",
    };
  } catch (err) {
    return {
      success: false,
      txHash: null,
      settlementTimeMs: Date.now() - startTime,
      error: err instanceof Error ? err.message : "Unknown transfer error",
    };
  }
}

/**
 * Check USDC balance for an address on Tempo.
 * Returns balance in cents.
 */
export async function getUsdcBalance(address: Address): Promise<number> {
  const balance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  });

  const usdc = formatUnits(balance, USDC_DECIMALS);
  return Math.round(Number(usdc) * 100);
}
