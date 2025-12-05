import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Receipt } from "lucide-react";

const stats = [
  {
    title: "Total Revenue",
    value: "$124,563",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Total Expenses",
    value: "$82,345",
    change: "-3.2%",
    trend: "down" as const,
    icon: Receipt,
  },
  {
    title: "Net Profit",
    value: "$42,218",
    change: "+8.7%",
    trend: "up" as const,
    icon: TrendingUp,
  },
  {
    title: "Pending Docs",
    value: "12",
    change: "3 new",
    trend: "neutral" as const,
    icon: Receipt,
  },
];

export default function Page() {
  return (
    <div className="flex flex-col gap-4 w-full pb-4">
      {/* Welcome Section */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Welcome back!</h2>
        <p className="text-sm text-muted-foreground">
          Here's your financial overview for this month
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const trendColor =
            stat.trend === "up"
              ? "text-green-600"
              : stat.trend === "down"
              ? "text-red-600"
              : "text-muted-foreground";

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{stat.value}</div>
                <p className={`text-xs ${trendColor} flex items-center gap-1 mt-1`}>
                  {stat.trend === "up" && <TrendingUp className="h-3 w-3" />}
                  {stat.trend === "down" && <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 mt-2">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Quick Actions
        </h3>
        <div className="grid gap-2">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="p-4">
              <p className="text-sm font-medium">Generate Monthly Report</p>
              <p className="text-xs text-muted-foreground mt-1">
                Get your P&L and expense summary
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="p-4">
              <p className="text-sm font-medium">Upload Receipt</p>
              <p className="text-xs text-muted-foreground mt-1">
                Quick capture with AI extraction
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="p-4">
              <p className="text-sm font-medium">Ask AI Assistant</p>
              <p className="text-xs text-muted-foreground mt-1">
                Get instant answers to financial questions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
