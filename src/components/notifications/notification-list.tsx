"use client";

import { BellRing, CheckCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Pager } from "@/components/shared/pager";
import { Button } from "@/components/ui/button";
import { InlineLoader } from "@/components/ui/loader";
import { CardListSkeleton } from "@/components/ui/skeletons";
import { useMarkAllRead, useMarkRead, useNotifications } from "@/hooks/queries/use-notifications";
import { useQueryParams } from "@/hooks/use-query-params";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The notification feed.
 *
 * Unread entries carry a dot as well as a weight change — a bolder line alone
 * is easy to miss, and this is the list that tells a donor someone is waiting
 * on them.
 */
export function NotificationList() {
  const { get, getNumber, setParams } = useQueryParams();
  const unreadOnly = get("filter") === "unread";
  const page = getNumber("page", 1);

  const { data, isPending, isError, error, refetch } = useNotifications({ page, unreadOnly });
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant={unreadOnly ? "outline" : "default"}
          className={unreadOnly ? "bg-card" : undefined}
          onClick={() => setParams({ filter: null })}
        >
          All
        </Button>
        <Button
          size="sm"
          variant={unreadOnly ? "default" : "outline"}
          className={unreadOnly ? undefined : "bg-card"}
          onClick={() => setParams({ filter: "unread" })}
        >
          Unread
        </Button>
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="gap-1.5"
        disabled={markAll.isPending}
        onClick={() => markAll.mutate()}
      >
        {markAll.isPending ? (
          <InlineLoader label="Marking all read" />
        ) : (
          <CheckCheck className="size-4" />
        )}
        Mark all read
      </Button>
    </div>
  );

  if (isPending) {
    return (
      <div className="grid gap-5">
        {toolbar}
        <CardListSkeleton count={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid gap-5">
        {toolbar}
        <EmptyState
          title="Could not load your notifications"
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

  const items = data?.items ?? [];

  return (
    <div className="grid gap-5">
      {toolbar}

      {items.length === 0 ? (
        <EmptyState
          title={unreadOnly ? "Nothing unread" : "No notifications yet"}
          description={
            unreadOnly
              ? "You are up to date. Switch to All to see the ones you have already read."
              : "You will hear from us when a request is verified, a donor answers, or a payment completes."
          }
        />
      ) : (
        <>
          <ul className="grid gap-2.5">
            {items.map((notification) => {
              const unread = notification.readAt === null;
              return (
                <li key={notification.id}>
                  <article
                    className={cn(
                      "flex items-start gap-3.5 rounded-2xl border p-4 transition-colors",
                      unread ? "border-primary/30 bg-accent/40" : "bg-card",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl",
                        unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <BellRing className="size-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className={cn("text-sm", unread ? "font-semibold" : "font-medium")}>
                          {notification.title}
                        </h3>
                        {unread ? (
                          <span
                            aria-label="Unread"
                            className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                          />
                        ) : null}
                      </div>

                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {notification.message}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-3">
                        <time className="text-xs text-muted-foreground">
                          {formatRelative(notification.createdAt)}
                        </time>
                        {unread ? (
                          <button
                            type="button"
                            onClick={() => markRead.mutate(notification.id)}
                            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Mark as read
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          <Pager meta={data?.meta ?? null} />
        </>
      )}
    </div>
  );
}
