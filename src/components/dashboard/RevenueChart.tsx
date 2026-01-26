import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAggregatedRevenue } from "@/hooks/useRevenueMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export const RevenueChart = () => {
  const { data: revenueData, isLoading } = useAggregatedRevenue();

  const chartData = revenueData?.map(r => ({
    name: format(new Date(r.date), "MMM d"),
    revenue: r.revenue,
    organic: r.organic,
  })) || [];

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">Revenue Intelligence</h3>
          <p className="text-sm text-muted-foreground">Unified revenue across all stores</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Total Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-muted-foreground">Organic Traffic</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(180, 70%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(180, 70%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                stroke="hsl(215, 20%, 35%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(215, 20%, 35%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 47%, 10%)",
                  border: "1px solid hsl(222, 30%, 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(210, 40%, 96%)" }}
                formatter={(value: number, name: string) => [
                  name === "revenue" ? `$${value.toLocaleString()}` : value.toLocaleString(),
                  name === "revenue" ? "Revenue" : "Organic Traffic"
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="organic"
                stroke="hsl(180, 70%, 45%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOrganic)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No revenue data yet. Seed demo data to see charts.
          </div>
        )}
      </div>
    </div>
  );
};
