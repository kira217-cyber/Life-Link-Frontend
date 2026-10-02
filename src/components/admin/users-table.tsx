"use client";

import { ShieldCheck, ShieldOff, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { BloodGroupBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { ClearFilters, FilterBar, SearchFilter, SelectFilter } from "@/components/shared/filter-bar";
import { Pager } from "@/components/shared/pager";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InlineLoader } from "@/components/ui/loader";
import { TableSkeleton } from "@/components/ui/skeletons";
import { Textarea } from "@/components/ui/textarea";
import { useAdminUsers, useSetUserStatus } from "@/hooks/queries/use-admin";
import { useQueryParams } from "@/hooks/use-query-params";
import { ROLE_LABEL } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/api";
import { UserAvatar } from "@/components/shared/user-avatar";

const ROLE_OPTIONS = (["DONOR", "REQUESTER", "ADMIN"] as const).map((role) => ({
  value: role,
  label: ROLE_LABEL[role],
}));

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Deactivated" },
];

/**
 * Every account on the platform.
 *
 * The status switch is the only action here, deliberately: an admin can stop
 * someone using LifeLink, but cannot change their role, read their password or
 * edit their profile. The API refuses all three, so a button for any of them
 * would only ever produce a 403.
 *
 * It also refuses to deactivate an admin, including oneself, which is what
 * stops a deployment locking itself out. Those rows say so rather than
 * offering a button that cannot work.
 */
export function UsersTable() {
  const { get, getNumber } = useQueryParams();
  const filters = {
    page: getNumber("page", 1),
    search: get("search") || undefined,
    role: get("role") || undefined,
    isActive: get("isActive") || undefined,
  };

  const { data, isPending, isError, error, refetch } = useAdminUsers(filters);
  const setStatus = useSetUserStatus();
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState("");

  const filterRow = (
    <FilterBar>
      <SearchFilter placeholder="Search name or email" />
      <SelectFilter paramKey="role" label="Role" options={ROLE_OPTIONS} allLabel="Any role" />
      <SelectFilter
        paramKey="isActive"
        label="Status"
        options={STATUS_OPTIONS}
        allLabel="Any status"
      />
      <ClearFilters />
    </FilterBar>
  );

  if (isPending) {
    return (
      <div className="grid gap-5">
        {filterRow}
        <TableSkeleton rows={8} columns={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid gap-5">
        {filterRow}
        <EmptyState
          title="Could not load the directory"
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
  const deactivating = target !== null && target.isActive;

  return (
    <>
      <div className="grid gap-5">
        {filterRow}

        {rows.length === 0 ? (
          <EmptyState
            title="No accounts match those filters"
            description="Try a wider search, or clear the filters to see everyone registered."
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border bg-card">
              <div className="scroll-x">
                <table className="w-full min-w-[54rem] text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th scope="col" className="px-4 py-3 font-medium">
                        Person
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Role
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Activity
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">
                        Access
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((person) => {
                      const busy = setStatus.isPending && setStatus.variables?.userId === person.id;
                      const isAdminRow = person.role === "ADMIN";

                      return (
                        <tr key={person.id} className="border-b align-middle last:border-0">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <UserAvatar name={person.name} size={36} />
                              <div className="min-w-0">
                                <p className="truncate font-medium">{person.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {person.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <p>{ROLE_LABEL[person.role]}</p>
                            {person.donorProfile ? (
                              <div className="mt-1.5 flex items-center gap-2">
                                <BloodGroupBadge value={person.donorProfile.bloodGroup} size="sm" />
                                <span className="text-xs text-muted-foreground">
                                  {person.donorProfile.city}
                                </span>
                              </div>
                            ) : null}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                            <p>{person._count.bloodRequests} requests</p>
                            <p>{person._count.donations} donations</p>
                            <p className="mt-1">Joined {formatDate(person.createdAt)}</p>
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                                person.isActive
                                  ? "bg-success-soft text-success"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <span className="size-1.5 rounded-full bg-current" />
                              {person.isActive ? "Active" : "Deactivated"}
                            </span>
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              {person.provider === "GOOGLE" ? "Google sign-in" : "Password"}
                            </p>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            {isAdminRow ? (
                              <p className="text-xs text-muted-foreground">
                                Admins cannot be locked out
                              </p>
                            ) : (
                              <Button
                                size="sm"
                                variant={person.isActive ? "outline" : "default"}
                                className={cn("gap-1.5", person.isActive && "bg-card")}
                                disabled={setStatus.isPending}
                                onClick={() => {
                                  setReason("");
                                  setTarget(person);
                                }}
                              >
                                {busy ? (
                                  <InlineLoader label="Saving" />
                                ) : person.isActive ? (
                                  <ShieldOff className="size-3.5" />
                                ) : (
                                  <ShieldCheck className="size-3.5" />
                                )}
                                {person.isActive ? "Deactivate" : "Reactivate"}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <Pager meta={data?.meta ?? null} />
          </>
        )}
      </div>

      <Dialog open={target !== null} onOpenChange={(next) => !next && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deactivating ? "Deactivate this account?" : "Reactivate this account?"}
            </DialogTitle>
            <DialogDescription>
              {deactivating
                ? `${target?.name ?? "This person"} is signed out of every device immediately, and a donor profile drops out of matching until the account comes back. They are told it happened, along with whatever reason you give.`
                : `${target?.name ?? "This person"} will be able to sign in again. A donor still has to switch their own availability back on before they reappear in matching.`}
            </DialogDescription>
          </DialogHeader>

          {deactivating ? (
            <div className="grid gap-2">
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                placeholder="For example: repeated requests the hospital could not confirm"
              />
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" />
                Optional, but they see exactly this text — a silent lock-out turns into a support
                message within the hour.
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>
              Leave it alone
            </Button>
            <Button
              variant={deactivating ? "destructive" : "default"}
              disabled={setStatus.isPending}
              onClick={() => {
                if (!target) return;
                setStatus.mutate(
                  {
                    userId: target.id,
                    isActive: !target.isActive,
                    ...(reason.trim() ? { reason: reason.trim() } : {}),
                  },
                  { onSettled: () => setTarget(null) },
                );
              }}
            >
              {setStatus.isPending ? (
                <>
                  <InlineLoader label="Saving" />
                  Saving…
                </>
              ) : deactivating ? (
                "Deactivate account"
              ) : (
                "Reactivate account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
