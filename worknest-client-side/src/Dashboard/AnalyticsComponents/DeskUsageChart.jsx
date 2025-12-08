import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const DeskUsageChart = ({ data }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-foreground">
          Desk Usage by Day (Booked vs Free)
        </h2>
        <span className="text-xs text-muted-foreground">
          Source: desk bookings
        </span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} stackOffset="none">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="booked" stackId="a" fill="#4f46e5" />
            <Bar dataKey="free" stackId="a" fill="#a5b4fc" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DeskUsageChart;
