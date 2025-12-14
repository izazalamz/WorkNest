import React, { useEffect, useState, useMemo } from "react";
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

      {/* Third row: office location map */}
      <div className="grid grid-cols-1">
        <OfficeLocationMap officeLocation={officeLocation} />
      </div>
    </div>
  );
};

export default Analytics;
