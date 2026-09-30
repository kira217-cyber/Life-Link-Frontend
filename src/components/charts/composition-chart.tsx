"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatNumber } from "@/lib/format";

/**
 * Who is on the platform, split by role.
 *
 * Bars rather than a pie: three slices are exactly the case where a pie asks
 * the eye to compare angles when it could be comparing lengths, and the
 * numbers here matter more than the proportions.
 *
 * Colours come from the validated categorical order, assigned by entity — a
 * role keeps its colour whether or not the others are present.
 */
export interface CompositionDatum {
  label: string;
  value: number;
  color: string;
}

export function CompositionChart({ data }: { data: CompositionDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="grid h-56 place-items-center text-sm text-muted-foreground">
        No accounts yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, bottom: 4, left: 4 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.45 }}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              color: "var(--popover-foreground)",
              fontSize: "0.8125rem",
            }}
            formatter={(value) => [formatNumber(Number(value ?? 0)), "Accounts"]}
          />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            maxBarSize={72}
            label={{ position: "top", fontSize: 12, fill: "var(--foreground)" }}
          >
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
