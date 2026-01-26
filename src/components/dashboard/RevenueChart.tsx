import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", revenue: 4000, organic: 2400 },
  { name: "Feb", revenue: 3000, organic: 1398 },
  { name: "Mar", revenue: 5000, organic: 3800 },
  { name: "Apr", revenue: 4780, organic: 3908 },
  { name: "May", revenue: 5890, organic: 4800 },
  { name: "Jun", revenue: 6390, organic: 5300 },
  { name: "Jul", revenue: 7490, organic: 6100 },
];

export const RevenueChart = () => {
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
            <span className="text-muted-foreground">Organic</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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
      </div>
    </div>
  );
};
