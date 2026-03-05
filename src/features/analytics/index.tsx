"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { AnalyticsChart } from "@/features/dashboard/components/analytics-chart";

export function AnalyticsFeature() {
  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold">Analytics</h1>
        </div>
      </Header>

      <Main>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsChart />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  );
}
