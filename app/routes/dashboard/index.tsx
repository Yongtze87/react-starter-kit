"use client";
import { ChartAreaInteractive } from "~/components/dashboard/chart-area-interactive";
import { SectionCards } from "~/components/dashboard/section-cards";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your financial overview at a glance
        </p>
      </div>
      <SectionCards />
      <ChartAreaInteractive />
    </div>
  );
}
