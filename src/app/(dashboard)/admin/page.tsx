import { Banknote, ClipboardList, Droplets, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ChartCard } from "@/components/charts/chart-card";
import { CompositionChart } from "@/components/charts/composition-chart";
import { PipelineChart } from "@/components/charts/pipeline-chart";
import { StatTile } from "@/components/dashboard/stat-tile";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ChartSkeleton, StatGridSkeleton } from "@/components/ui/skeletons";
import { serverFetch } from "@/lib/api/server";
import { requireRole } from "@/lib/auth/guard";
import { formatMoney, formatNumber, pluralise } from "@/lib/format";
import type { DashboardStats } from "@/types/api";

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "Platform analytics, the review queue and the audit trail.",
};

/**
 * The figures are a snapshot, not a time series, so nothing here is a line
 * chart: there is no "over time" in the data to draw. Headline numbers go in
 * tiles, and the two breakdowns that do have parts to compare get bars.
 */
async function Analytics() {
  const stats = await serverFetch<DashboardStats>("/admin/dashboard-stats");

  const pipeline = [
    { label: "Awaiting review", value: stats.requests.pending, color: "var(--warning)" },
    { label: "Verified", value: stats.requests.verified, color: "var(--info)" },
    { label: "Matching", value: stats.requests.matching, color: "var(--chart-4)" },
    { label: "Fulfilled", value: stats.requests.fulfilled, color: "var(--success)" },
    { label: "Rejected", value: stats.requests.rejected, color: "var(--urgency-critical)" },
  ];

  const composition = [
    { label: "Donors", value: stats.users.donors, color: "var(--chart-1)" },
    { label: "Requesters", value: stats.users.requesters, color: "var(--chart-2)" },
    {
      label: "Admins",
      value: Math.max(0, stats.users.total - stats.users.donors - stats.users.requesters),
      color: "var(--chart-3)",
    },
  ];

  const awaiting = stats.requests.pending;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Accounts"
          value={formatNumber(stats.users.total)}
          hint={`${formatNumber(stats.users.active)} active`}
          icon={Users}
        />
        <StatTile
          label="Requests"
          value={formatNumber(stats.requests.total)}
          hint={awaiting > 0 ? `${pluralise(awaiting, "waiting for review")}` : "Queue is clear"}
          icon={ClipboardList}
          tone={awaiting > 0 ? "warning" : "success"}
        />
        <StatTile
          label="Units collected"
          value={formatNumber(stats.donations.unitsCollected)}
          hint={`across ${pluralise(stats.donations.total, "donation")}`}
          icon={Droplets}
          tone="primary"
        />
        <StatTile
          label="Funds raised"
          value={formatMoney(stats.payments.paidAmount)}
          hint={`${pluralise(stats.payments.paidCount, "paid contribution")}`}
          icon={Banknote}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Where requests currently sit"
          description="A request cannot skip review, and the terminal states cannot be reopened."
          legend={pipeline.map((item) => ({
            label: item.label,
            value: formatNumber(item.value),
            color: item.color,
          }))}
          footnote="Colours here carry state, not brand — the same five appear on every status badge."
        >
          <PipelineChart data={pipeline} />
        </ChartCard>

        <ChartCard
          title="Who is on the platform"
          description="Admin accounts exist only through the seed; the public can register as the other two."
          legend={composition.map((item) => ({
            label: item.label,
            value: formatNumber(item.value),
            color: item.color,
          }))}
        >
          <CompositionChart data={composition} />
        </ChartCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Match invitations"
          value={formatNumber(stats.matches.total)}
          hint={`${formatNumber(stats.matches.accepted)} accepted`}
        />
        <StatTile
          label="Completed donations"
          value={formatNumber(stats.matches.completed)}
          hint="Confirmed by the requester"
        />
        <StatTile
          label="Payments pending"
          value={formatNumber(stats.payments.pending)}
          hint="Checkout started, webhook not yet received"
        />
      </div>
    </div>
  );
}

export default async function AdminHomePage() {
  const user = await requireRole("ADMIN");
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Nothing reaches a donor until it passes through here. Requests wait for review, and every action is written to the audit trail."
        action={
          <Button asChild className="tap-target">
            <Link href="/admin/requests">Review pending requests</Link>
          </Button>
        }
      />

      <Suspense
        fallback={
          <div className="grid gap-6">
            <StatGridSkeleton />
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </div>
        }
      >
        <Analytics />
      </Suspense>
    </div>
  );
}
