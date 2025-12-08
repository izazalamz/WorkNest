import React from "react";

const SummaryCards = ({
  avgDeskOccupancy,
  totalMeetings,
  avgInOffice,
  busiestDay,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Avg. Desk Occupancy
        </p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {avgDeskOccupancy}%
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Target: 70–85% utilization
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Meetings This Week
        </p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {totalMeetings}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Includes all rooms and teams
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Avg. In-Office Attendance
        </p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {avgInOffice} people/day
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Compared to hybrid policy baseline
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Busiest Day
        </p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {busiestDay}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Highest desk utilization this week
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;
