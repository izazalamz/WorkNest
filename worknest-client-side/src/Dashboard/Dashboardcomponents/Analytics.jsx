import React from "react";
import AnalyticsHeader from "../AnalyticsComponents/AnalyticsHeader";
import SummaryCards from "../AnalyticsComponents/SummaryCards";
import DeskUsageChart from "../AnalyticsComponents/DeskUsageChart";
import SpaceTypePieChart from "../AnalyticsComponents/SpaceTypePieChart";
import MeetingFrequencyChart from "../AnalyticsComponents/MeetingFrequencyChart";
import AttendanceTrendChart from "../AnalyticsComponents/AttendanceTrendChart";

// --- Mock data (replace with real API data later) ---

// Desk usage per weekday
const deskUsageData = [
  { day: "Mon", booked: 32, free: 18, total: 50 },
  { day: "Tue", booked: 40, free: 10, total: 50 },
  { day: "Wed", booked: 45, free: 5, total: 50 },
  { day: "Thu", booked: 30, free: 20, total: 50 },
  { day: "Fri", booked: 25, free: 25, total: 50 },
];

// Meeting frequency per weekday
const meetingFrequencyData = [
  { day: "Mon", meetings: 5 },
  { day: "Tue", meetings: 7 },
  { day: "Wed", meetings: 9 },
  { day: "Thu", meetings: 4 },
  { day: "Fri", meetings: 3 },
];

// Attendance (office vs remote) per weekday
const attendanceData = [
  { day: "Mon", office: 30, remote: 10 },
  { day: "Tue", office: 34, remote: 12 },
  { day: "Wed", office: 38, remote: 8 },
  { day: "Thu", office: 28, remote: 14 },
  { day: "Fri", office: 22, remote: 18 },
];

// For the space type pie chart
const spaceTypeData = [
  { name: "Desks", value: 60 },
  { name: "Meeting Rooms", value: 30 },
  { name: "Collab Areas", value: 10 },
];

const Analytics = () => {
  // Summary calculations based on mock data
  const avgDeskOccupancy =
    Math.round(
      (deskUsageData.reduce((sum, d) => sum + d.booked, 0) /
        deskUsageData.reduce((sum, d) => sum + d.total, 0)) *
        100
    ) || 0;

  const totalMeetings = meetingFrequencyData.reduce(
    (sum, d) => sum + d.meetings,
    0
  );

  const avgInOffice =
    Math.round(
      attendanceData.reduce((sum, d) => sum + d.office, 0) /
        attendanceData.length
    ) || 0;

  const busiestDay =
    deskUsageData.slice().sort((a, b) => b.booked - a.booked)[0]?.day ?? "-";

  return (
    <div className="p-6 space-y-6">
      {/* Top header & filters */}
      <AnalyticsHeader />

      {/* Summary cards */}
      <SummaryCards
        avgDeskOccupancy={avgDeskOccupancy}
        totalMeetings={totalMeetings}
        avgInOffice={avgInOffice}
        busiestDay={busiestDay}
      />

      {/* First row: desk usage + pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DeskUsageChart data={deskUsageData} />
        <SpaceTypePieChart data={spaceTypeData} />
      </div>

      {/* Second row: meeting frequency + attendance trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MeetingFrequencyChart data={meetingFrequencyData} />
        <AttendanceTrendChart data={attendanceData} />
      </div>
    </div>
  );
};

export default Analytics;
