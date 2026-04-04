export const dynamic = "force-dynamic";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  transactions,
  exceptions,
  operators,
  suppliers,
} from "@/lib/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

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

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch stats in parallel
  const [txStats, pendingExceptions, recentTxns, operatorRow] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)`,
        settled: sql<number>`count(*) filter (where ${transactions.status} = 'settled')`,
        volume: sql<number>`coalesce(sum(${transactions.amount}) filter (where ${transactions.status} = 'settled'), 0)`,
        avgSettlement: sql<number>`avg(${transactions.settlementTimeMs}) filter (where ${transactions.status} = 'settled')`,
      })
      .from(transactions),
    db
      .select({ count: sql<number>`count(*)` })
      .from(exceptions)
      .where(sql`${exceptions.resolvedAt} is null`),
    db
      .select({
        id: transactions.id,
        supplierName: suppliers.name,
        amount: transactions.amount,
        currency: transactions.currency,
        status: transactions.status,
        initiatedAt: transactions.initiatedAt,
        settlementTimeMs: transactions.settlementTimeMs,
        txHash: transactions.txHash,
      })
      .from(transactions)
      .leftJoin(suppliers, eq(transactions.supplierId, suppliers.id))
      .orderBy(desc(transactions.initiatedAt))
      .limit(10),
    db
      .select({ walletBalance: operators.walletBalance })
      .from(operators)
      .where(eq(operators.id, session.operatorId))
      .limit(1),
  ]);

  const stats = txStats[0];
  const pendingCount = Number(pendingExceptions[0]?.count ?? 0);
  const walletBalance = operatorRow[0]?.walletBalance ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground">
          Your purchasing agent at a glance.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Wallet Balance</CardDescription>
            <CardTitle className="text-3xl">
              {formatCents(walletBalance)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle className="text-3xl">
              {Number(stats?.total ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Settled Volume</CardDescription>
            <CardTitle className="text-3xl">
              {formatCents(Number(stats?.volume ?? 0))}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Settlement</CardDescription>
            <CardTitle className="text-3xl">
              {stats?.avgSettlement
                ? `${(Number(stats.avgSettlement) / 1000).toFixed(1)}s`
                : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Approvals</CardDescription>
            <CardTitle className="text-3xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Last 10 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTxns.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No transactions yet. Send a restock signal to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Settlement</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTxns.map((tx) => (
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
