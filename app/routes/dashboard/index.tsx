import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Receipt, Clock } from "lucide-react";

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

const reminders = [
  {
    title: "GST Filing Deadline",
    dueDate: "Jan 31, 2025",
    daysLeft: 25,
    priority: "high" as const,
  },
  {
    title: "Corporate Tax Filing",
    dueDate: "Feb 28, 2025",
    daysLeft: 53,
    priority: "medium" as const,
  },
  {
    title: "CPF Contribution Payment",
    dueDate: "Jan 14, 2025",
    daysLeft: 8,
    priority: "high" as const,
  },
];

export default function Page() {
  return (
    <div className="flex flex-col gap-2 w-full pb-4">
      {/* Welcome Section */}
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold">Welcome back!</h2>
        <p className="text-xs text-muted-foreground">
          Here's your financial overview for this month
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const trendColor =
            stat.trend === "up"
              ? "text-[#00d4a1]"
              : stat.trend === "down"
              ? "text-[#ff6b6b]"
              : "text-muted-foreground";

          return (
            <Card key={stat.title} className="py-1.5 gap-0 neo-card-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 p-1.5">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <Icon className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-1.5 pt-0">
                <div className="text-base font-extrabold tracking-tight">{stat.value}</div>
                <p className={`text-xs font-bold ${trendColor} flex items-center gap-0.5`}>
                  {stat.trend === "up" && <TrendingUp className="h-3 w-3" />}
                  {stat.trend === "down" && <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reminders Section */}
      <div className="space-y-1.5 mt-0.5">
        <h3 className="text-xs font-bold text-muted-foreground">
          ⚠️ Upcoming Deadlines
        </h3>
        <div className="grid gap-1.5">
          {reminders.map((reminder, idx) => {
            const bgColor = reminder.priority === "high" ? "bg-[#ffe5e5]" : "bg-[#fff9e5]";
            return (
              <Card key={idx} className={`py-1.5 gap-0 neo-card-sm ${bgColor}`}>
                <CardContent className="p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <Clock className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${
                        reminder.priority === "high" ? "text-[#ff6b6b]" : "text-[#ffd93d]"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold">{reminder.title}</p>
                        <p className="text-xs font-semibold text-[#666]">Due: {reminder.dueDate}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-extrabold whitespace-nowrap ${
                      reminder.daysLeft <= 10 ? "text-[#ff6b6b]" : "text-[#666]"
                    }`}>
                      {reminder.daysLeft}d
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-1.5 mt-0.5">
        <h3 className="text-xs font-bold text-muted-foreground">
          ⚡ Quick Actions
        </h3>
        <div className="grid gap-1.5">
          <Card className="cursor-pointer hover:bg-[#fffef5] transition-colors py-2 gap-0 neo-card-sm">
            <CardContent className="p-2">
              <p className="text-sm font-bold">📊 Generate Monthly Report</p>
              <p className="text-xs font-semibold text-[#666] mt-0.5">
                Get your P&L and expense summary
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-[#fffef5] transition-colors py-2 gap-0 neo-card-sm">
            <CardContent className="p-2">
              <p className="text-sm font-bold">📤 Upload Receipt</p>
              <p className="text-xs font-semibold text-[#666] mt-0.5">
                Quick capture with AI extraction
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-[#fffef5] transition-colors py-2 gap-0 neo-card-sm">
            <CardContent className="p-2">
              <p className="text-sm font-bold">💬 Ask AI Assistant</p>
              <p className="text-xs font-semibold text-[#666] mt-0.5">
                Get instant answers to financial questions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
