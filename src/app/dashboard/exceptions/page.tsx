export const dynamic = "force-dynamic";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { exceptions, transactions, suppliers } from "@/lib/db/schema";
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
import { ExceptionActions } from "./exception-actions";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default async function ExceptionsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const allExceptions = await db
    .select({
      id: exceptions.id,
      transactionId: exceptions.transactionId,
      type: exceptions.type,
      detectedAt: exceptions.detectedAt,
      resolvedAt: exceptions.resolvedAt,
      resolution: exceptions.resolution,
      resolvedBy: exceptions.resolvedBy,
      transactionAmount: transactions.amount,
      transactionNotes: transactions.notes,
      supplierName: suppliers.name,
    })
    .from(exceptions)
    .leftJoin(transactions, eq(exceptions.transactionId, transactions.id))
    .leftJoin(suppliers, eq(transactions.supplierId, suppliers.id))
    .orderBy(desc(exceptions.detectedAt))
    .limit(50);

  const pending = allExceptions.filter((e) => !e.resolvedAt);
  const resolved = allExceptions.filter((e) => e.resolvedAt);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Exceptions</h1>
        <p className="text-muted-foreground">
          Review and resolve payment exceptions flagged by your agent.
        </p>
      </div>

      {/* Pending exceptions */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approval</CardTitle>
          <CardDescription>
            {pending.length === 0
              ? "No exceptions waiting for your decision."
              : `${pending.length} exception${pending.length > 1 ? "s" : ""} waiting for your decision.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pending.length > 0 && (
            <div className="space-y-4">
              {pending.map((exc) => (
                <div
                  key={exc.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {exc.supplierName ?? "Unknown Supplier"}
                      </span>
                      <Badge variant="outline">{exc.type.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Amount: {exc.transactionAmount ? formatCents(exc.transactionAmount) : "—"}
                    </p>
                    {exc.transactionNotes && (
                      <p className="text-sm text-muted-foreground">
                        {exc.transactionNotes}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Detected{" "}
                      {exc.detectedAt
                        ? new Date(exc.detectedAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <ExceptionActions
                    exceptionId={exc.id}
                    operatorId={session.operatorId}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolved exceptions */}
      <Card>
        <CardHeader>
          <CardTitle>Resolved</CardTitle>
          <CardDescription>
            Previously resolved exceptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resolved.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No resolved exceptions yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Resolution</TableHead>
                  <TableHead>Resolved By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolved.map((exc) => (
                  <TableRow key={exc.id}>
                    <TableCell className="font-medium">
                      {exc.supplierName ?? "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {exc.type.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {exc.transactionAmount
                        ? formatCents(exc.transactionAmount)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          exc.resolution === "approved"
                            ? "default"
                            : exc.resolution === "auto_resolved"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {exc.resolution}
                      </Badge>
                    </TableCell>
                    <TableCell>{exc.resolvedBy ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {exc.resolvedAt
                        ? new Date(exc.resolvedAt).toLocaleString()
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
