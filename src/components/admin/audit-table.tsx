"use client";

import { ScrollText } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ClearFilters, FilterBar, SelectFilter } from "@/components/shared/filter-bar";
import { Pager } from "@/components/shared/pager";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/skeletons";
import { useAuditLogs } from "@/hooks/queries/use-admin";
import { useQueryParams } from "@/hooks/use-query-params";
import { AUDIT_ACTION_LABEL, AUDIT_ACTION_TONE, AUDIT_ACTIONS, ROLE_LABEL } from "@/lib/domain";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

const ACTION_OPTIONS = AUDIT_ACTIONS.map((action) => ({
  value: action,
  label: AUDIT_ACTION_LABEL[action] ?? action,
}));

const ENTITY_OPTIONS = [
  { value: "User", label: "Accounts" },
  { value: "BloodRequest", label: "Blood requests" },
  { value: "DonorProfile", label: "Donor profiles" },
  { value: "DonorMatch", label: "Invitations" },
  { value: "Donation", label: "Donations" },
  { value: "Payment", label: "Payments" },
];

/**
 * The audit trail.
 *
 * Append-only, which is the point: there is no edit and no delete here
 * because an audit log you can tidy up is not an audit log. An action the
 * backend adds later still renders — the label falls back to the raw enum
 * name rather than the row disappearing.
 */
export function AuditTable() {
  const { get, getNumber } = useQueryParams();
  const filters = {
    page: getNumber("page", 1),
    action: get("action") || undefined,
    entityType: get("entityType") || undefined,
  };

  const { data, isPending, isError, error, refetch } = useAuditLogs(filters);

  const filterRow = (
    <FilterBar>
      <SelectFilter
        paramKey="action"
        label="Action"
        options={ACTION_OPTIONS}
        allLabel="Any action"
        className="w-full sm:w-56"
      />
      <SelectFilter
        paramKey="entityType"
        label="What it touched"
        options={ENTITY_OPTIONS}
        allLabel="Anything"
      />
      <ClearFilters />
    </FilterBar>
  );

  if (isPending) {
    return (
      <div className="grid gap-5">
        {filterRow}
        <TableSkeleton rows={10} columns={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid gap-5">
        {filterRow}
        <EmptyState
          title="Could not load the trail"
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

  const rows = data?.items ?? [];

  return (
    <div className="grid gap-5">
      {filterRow}

      {rows.length === 0 ? (
        <EmptyState
          art={ScrollText}
          title="Nothing recorded for those filters"
          description="The trail only holds what actually happened. Widen the filters, or clear them to see everything from the beginning."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="scroll-x">
              <table className="w-full min-w-[48rem] text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th scope="col" className="px-4 py-3 font-medium">
                      Action
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Who
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      What it touched
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      When
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((entry) => (
                    <tr key={entry.id} className="border-b align-top last:border-0">
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
                            AUDIT_ACTION_TONE[entry.action] ?? "bg-secondary text-secondary-foreground",
                          )}
                        >
                          {AUDIT_ACTION_LABEL[entry.action] ?? entry.action}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {entry.actor ? (
                          <>
                            <p className="font-medium">{entry.actor.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ROLE_LABEL[entry.actor.role]} · {entry.actor.email}
                            </p>
                          </>
                        ) : (
                          <p className="text-muted-foreground">System</p>
                        )}
                        {entry.ipAddress ? (
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            {entry.ipAddress}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-4 py-3.5">
                        <p>{entry.entityType}</p>
                        {entry.entityId ? (
                          <p className="mt-0.5 max-w-[14rem] truncate font-mono text-xs text-muted-foreground">
                            {entry.entityId}
                          </p>
                        ) : null}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                        <p>{formatRelative(entry.createdAt)}</p>
                        <p className="mt-0.5">{formatDateTime(entry.createdAt)}</p>
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
