import React, { useEffect, useState, useMemo } from "react";
import React from "react";
import AnalyticsHeader from "../AnalyticsComponents/AnalyticsHeader";
import SummaryCards from "../AnalyticsComponents/SummaryCards";
import DeskUsageChart from "../AnalyticsComponents/DeskUsageChart";
import SpaceTypePieChart from "../AnalyticsComponents/SpaceTypePieChart";
import MeetingFrequencyChart from "../AnalyticsComponents/MeetingFrequencyChart";
import AttendanceTrendChart from "../AnalyticsComponents/AttendanceTrendChart";
import OfficeLocationMap from "../AnalyticsComponents/OfficeLocationMap"; // 👈 NEW

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:3000/dashboard/analytics/latest");
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch analytics.");
        }

        setAnalytics(data.analytics);
        setSummary(data.summary);
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError(
          err.message || "Something went wrong while fetching analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const deskUsageData = analytics?.deskUsageByDay || [];
  const meetingFrequencyData = analytics?.meetingFrequencyByDay || [];
  const attendanceData = analytics?.attendanceByDay || [];
  const spaceTypeData = analytics?.spaceTypeDistribution || [];
  const officeLocation = analytics?.officeLocation; // 👈 NEW

  const { avgDeskOccupancy, totalMeetings, avgInOffice, busiestDay } =
    useMemo(() => {
      if (summary) return summary;

      if (!deskUsageData.length) {
        return {
          avgDeskOccupancy: 0,
          totalMeetings: 0,
          avgInOffice: 0,
          busiestDay: "-",
        };
      }

      const avgDeskOccupancyCalc =
        Math.round(
          (deskUsageData.reduce((sum, d) => sum + (d.booked || 0), 0) /
            deskUsageData.reduce((sum, d) => sum + (d.total || 0), 0)) *
            100
        ) || 0;

      const totalMeetingsCalc =
        meetingFrequencyData.reduce((sum, d) => sum + (d.meetings || 0), 0) ||
        0;

      const avgInOfficeCalc =
        Math.round(
          attendanceData.reduce((sum, d) => sum + (d.office || 0), 0) /
            (attendanceData.length || 1)
        ) || 0;

      const busiestDayCalc =
        deskUsageData
          .slice()
          .sort((a, b) => (b.booked || 0) - (a.booked || 0))[0]?.day ?? "-";

      return {
        avgDeskOccupancy: avgDeskOccupancyCalc,
        totalMeetings: totalMeetingsCalc,
        avgInOffice: avgInOfficeCalc,
        busiestDay: busiestDayCalc,
      };
    }, [summary, deskUsageData, meetingFrequencyData, attendanceData]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }
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
