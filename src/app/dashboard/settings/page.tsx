import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loadSpendPolicy } from "@/lib/config";

export default function SettingsPage() {
  const policy = loadSpendPolicy();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Agent configuration and spend policy.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Operator</CardTitle>
            <CardDescription>Current operator configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Operator ID</span>
              <span className="font-mono">{policy.operator}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Wallet</span>
              <span className="font-mono">{policy.wallet}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Alert Email</span>
              <span>{policy.global.alert_email}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Global Policy</CardTitle>
            <CardDescription>Spend limits and thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Require approval above
              </span>
              <span className="font-mono">
                ${policy.global.require_approval_above.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Configured suppliers
              </span>
              <span>{policy.suppliers.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Supplier Policies</CardTitle>
            <CardDescription>
              Per-supplier limits from spend-policy.yaml
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {policy.suppliers.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {s.id}
                    </p>
                  </div>
                  <div className="text-right text-sm space-y-1">
                    <p>
                      Max/txn:{" "}
                      <span className="font-mono">
                        ${s.max_per_transaction.toLocaleString()}
                      </span>
                    </p>
                    <p>
                      Max/month:{" "}
                      <span className="font-mono">
                        ${s.max_per_month.toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
