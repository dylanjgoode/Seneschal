import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { z } from "zod";

const supplierPolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  wallet: z.string(),
  max_per_transaction: z.number(),
  max_per_month: z.number(),
  approved: z.boolean(),
});

const spendPolicySchema = z.object({
  operator: z.string(),
  wallet: z.string(),
  suppliers: z.array(supplierPolicySchema),
  global: z.object({
    require_approval_above: z.number(),
    alert_email: z.string().email(),
  }),
});

export type SpendPolicy = z.infer<typeof spendPolicySchema>;
export type SupplierPolicy = z.infer<typeof supplierPolicySchema>;

let cachedPolicy: SpendPolicy | null = null;

export function loadSpendPolicy(): SpendPolicy {
  if (cachedPolicy) return cachedPolicy;

  const configPath = path.join(
    process.cwd(),
    "src/config/spend-policy.yaml"
  );
  const raw = fs.readFileSync(configPath, "utf-8");
  const parsed = yaml.load(raw);
  cachedPolicy = spendPolicySchema.parse(parsed);
  return cachedPolicy;
}

export function reloadSpendPolicy(): SpendPolicy {
  cachedPolicy = null;
  return loadSpendPolicy();
}
