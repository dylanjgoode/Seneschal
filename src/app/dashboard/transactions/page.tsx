export const dynamic = "force-dynamic";

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { transactions, suppliers } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function statusColor(status: string) {
  switch (status) {
    case "settled":
      return "default" as const;
    case "pending":
      return "secondary" as const;
    case "held":
      return "outline" as const;
    case "failed":
    case "rejected":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export default async function TransactionsPage() {
  const allTxns = await db
    .select({
      id: transactions.id,
      supplierName: suppliers.name,
      amount: transactions.amount,
      currency: transactions.currency,
      status: transactions.status,
      initiatedAt: transactions.initiatedAt,
      settledAt: transactions.settledAt,
      settlementTimeMs: transactions.settlementTimeMs,
      txHash: transactions.txHash,
      exceptionType: transactions.exceptionType,
      notes: transactions.notes,
    })
    .from(transactions)
    .leftJoin(suppliers, eq(transactions.supplierId, suppliers.id))
    .orderBy(desc(transactions.initiatedAt))
    .limit(50);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">
          All transactions processed by your purchasing agent.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {allTxns.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No transactions yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Settlement</TableHead>
                  <TableHead>Tx Hash</TableHead>
                  <TableHead>Exception</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTxns.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">
                      {tx.supplierName ?? "Unknown"}
                    </TableCell>
                    <TableCell>{formatCents(tx.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor(tx.status)}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tx.settlementTimeMs
                        ? `${(tx.settlementTimeMs / 1000).toFixed(1)}s`
                        : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tx.txHash
                        ? `${tx.txHash.slice(0, 6)}...${tx.txHash.slice(-4)}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {tx.exceptionType ? (
                        <Badge variant="outline">{tx.exceptionType}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tx.initiatedAt
                        ? new Date(tx.initiatedAt).toLocaleString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
