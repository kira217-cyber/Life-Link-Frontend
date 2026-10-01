"use client";

import { CircleDollarSign, Clock, Receipt } from "lucide-react";

import { PaymentStatusBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { ClearFilters, FilterBar, SelectFilter } from "@/components/shared/filter-bar";
import { Pager } from "@/components/shared/pager";
import { Button } from "@/components/ui/button";
import { StatGridSkeleton, TableSkeleton } from "@/components/ui/skeletons";
import { useAdminPayments } from "@/hooks/queries/use-admin";
import { useQueryParams } from "@/hooks/use-query-params";
import {
  PAYMENT_PURPOSE_LABEL,
  PAYMENT_PURPOSES,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUSES,
} from "@/lib/domain";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";

const STATUS_OPTIONS = PAYMENT_STATUSES.map((status) => ({
  value: status,
  label: PAYMENT_STATUS_LABEL[status],
}));

const PURPOSE_OPTIONS = PAYMENT_PURPOSES.map((purpose) => ({
  value: purpose,
  label: PAYMENT_PURPOSE_LABEL[purpose],
}));

/**
 * The payment ledger.
 *
 * Read-only on purpose. A payment moves to PAID only when Stripe says so
 * through a signed webhook, so there is nothing an admin could usefully click
 * here — a button that marked a row paid would be inventing money.
 *
 * The totals come from the endpoint rather than being summed from the visible
 * page: a sum of ten rows out of three hundred is a wrong number stated
 * confidently.
 */
export function PaymentsTable() {
  const { get, getNumber } = useQueryParams();
  const filters = {
    page: getNumber("page", 1),
    status: get("status") || undefined,
    purpose: get("purpose") || undefined,
  };

  const { data, isPending, isError, error, refetch } = useAdminPayments(filters);

  const filterRow = (
    <FilterBar>
      <SelectFilter
        paramKey="status"
        label="Status"
        options={STATUS_OPTIONS}
        allLabel="Any status"
      />
      <SelectFilter
        paramKey="purpose"
        label="Purpose"
        options={PURPOSE_OPTIONS}
        allLabel="Any purpose"
      />
      <ClearFilters />
    </FilterBar>
  );

  if (isPending) {
    return (
      <div className="grid gap-5">
        <StatGridSkeleton count={2} />
        {filterRow}
        <TableSkeleton rows={6} columns={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid gap-5">
        {filterRow}
        <EmptyState
          title="Could not load the ledger"
          description={error instanceof Error ? error.message : "Please try again."}
          action={
            <Button onClick={() => refetch()} className="tap-target">
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const rows = data?.data.payments ?? [];
  const totals = data?.data.totals;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CircleDollarSign className="size-4 text-success" />
            Confirmed by Stripe
          </p>
          <p className="mt-2 font-heading text-3xl font-semibold tabular-nums">
            {formatMoney(totals?.paidAmount ?? 0)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Across {formatNumber(totals?.paidCount ?? 0)} completed{" "}
            {totals?.paidCount === 1 ? "payment" : "payments"}, matching the current filter.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4 text-warning" />
            How a row becomes paid
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            A checkout session opens as <span className="font-medium">Pending</span>. Only a signed
            Stripe webhook moves it to <span className="font-medium">Paid</span> — not the browser
            coming back to the success page.
          </p>
        </div>
      </div>

      {filterRow}

      {rows.length === 0 ? (
        <EmptyState
          art={Receipt}
          title="No payments to show"
          description="Nothing matches those filters yet. Donations appear here the moment a checkout session is created, pending or not."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="scroll-x">
              <table className="w-full min-w-[50rem] text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th scope="col" className="px-4 py-3 font-medium">
                      Donor
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Purpose
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      Amount
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      When
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((payment) => (
                    <tr key={payment.id} className="border-b align-middle last:border-0">
                      <td className="px-4 py-3.5">
                        <p className="font-medium">{payment.user?.name ?? "Deleted account"}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {payment.user?.email ?? payment.userId}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        {PAYMENT_PURPOSE_LABEL[payment.purpose] ?? payment.purpose}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium tabular-nums">
                        {formatMoney(payment.amount, payment.currency)}
                      </td>

                      <td className="px-4 py-3.5">
                        <PaymentStatusBadge value={payment.status} />
                        {payment.failureReason ? (
                          <p className="mt-1 max-w-[14rem] truncate text-xs text-muted-foreground">
                            {payment.failureReason}
                          </p>
                        ) : null}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                        <p>{formatDateTime(payment.paidAt ?? payment.createdAt)}</p>
                        <p className="mt-0.5">{payment.paidAt ? "Confirmed" : "Started"}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pager meta={data?.meta ?? null} />
        </>
      )}
    </div>
  );
}
