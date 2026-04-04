export const dynamic = "force-dynamic";

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { suppliers } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
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
    case "active":
      return "default" as const;
    case "inactive":
      return "secondary" as const;
    case "pending":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

export default async function SuppliersPage() {
  const allSuppliers = await db
    .select()
    .from(suppliers)
    .orderBy(desc(suppliers.createdAt));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your approved suppliers.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {allSuppliers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No suppliers configured yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Per-Txn Limit</TableHead>
                  <TableHead>Monthly Limit</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allSuppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {s.walletAddress.slice(0, 6)}...
                      {s.walletAddress.slice(-4)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor(s.status)}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.verified ? (
                        <Badge variant="default">Verified</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCents(s.perTransactionLimit)}
                    </TableCell>
                    <TableCell>{formatCents(s.monthlyLimit)}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {s.notes ?? "—"}
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
