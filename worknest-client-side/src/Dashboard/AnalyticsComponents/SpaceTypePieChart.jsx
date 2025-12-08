import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const PIE_COLORS = ["#4f46e5", "#06b6d4", "#f97316"];

const SpaceTypePieChart = ({ data }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <h2 className="font-semibold text-foreground mb-3">
        Space Type Utilization
      </h2>
      <div className="h-72 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpaceTypePieChart;
