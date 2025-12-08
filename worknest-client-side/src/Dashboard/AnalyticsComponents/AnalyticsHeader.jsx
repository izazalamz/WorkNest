import React from "react";

const AnalyticsHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Workspace Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of desk utilization, meeting activity, and attendance
          patterns.
        </p>
      </div>

      {/* Simple filters (UI only for now) */}
      <div className="flex gap-3">
        <select className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
          <option>This week</option>
          <option>Last week</option>
          <option>This month</option>
        </select>
        <select className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
          <option>All teams</option>
          <option>Engineering</option>
          <option>Marketing</option>
          <option>Sales</option>
        </select>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
