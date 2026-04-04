import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const tempo = defineChain({
  id: Number(process.env.TEMPO_CHAIN_ID ?? 42431),
  name: "Tempo",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: {
      http: [process.env.TEMPO_RPC_URL ?? "https://rpc.moderato.tempo.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Tempo Explorer",
      url: "https://explore.tempo.xyz",
    },
  },
});

export const publicClient = createPublicClient({
  chain: tempo,
  transport: http(),
});

export function getWalletClient() {
  const account = privateKeyToAccount(
    process.env.TEMPO_PRIVATE_KEY as `0x${string}`
  );
  return createWalletClient({
    account,
    chain: tempo,
    transport: http(),
  });
}

export function getAccount() {
  return privateKeyToAccount(
    process.env.TEMPO_PRIVATE_KEY as `0x${string}`
  );
}
