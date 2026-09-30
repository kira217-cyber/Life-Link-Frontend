"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatNumber } from "@/lib/format";

/**
 * Where the requests currently sit.
 *
 * Horizontal bars because the categories are named states with long labels —
 * a vertical axis would either truncate them or turn them on their side, and
 * the eye compares bar lengths against a shared baseline either way.
 *
 * These are status colours, not a categorical series: each state has a fixed
 * meaning that must not move if the brand accent ever does. Every bar is
 * directly labelled, so identity never rests on colour alone.
 */
export interface PipelineDatum {
  label: string;
  value: number;
  /** A CSS colour — passed as a var() so it re-themes without a re-render. */
  color: string;
}

export function PipelineChart({ data }: { data: PipelineDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="grid h-64 place-items-center text-sm text-muted-foreground">
        No requests recorded yet.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 40, bottom: 4, left: 4 }}
          barCategoryGap={10}
        >
          <CartesianGrid
            horizontal={false}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            allowDecimals={false}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={120}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
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
            formatter={(value) => [formatNumber(Number(value ?? 0)), "Requests"]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 12, fill: "var(--foreground)" }}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
