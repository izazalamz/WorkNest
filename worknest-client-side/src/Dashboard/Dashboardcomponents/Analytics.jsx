import React, { useEffect, useState, useMemo } from "react";
import AnalyticsHeader from "../AnalyticsComponents/AnalyticsHeader";
import SummaryCards from "../AnalyticsComponents/SummaryCards";
import DeskUsageChart from "../AnalyticsComponents/DeskUsageChart";
import SpaceTypePieChart from "../AnalyticsComponents/SpaceTypePieChart";
import MeetingFrequencyChart from "../AnalyticsComponents/MeetingFrequencyChart";
import AttendanceTrendChart from "../AnalyticsComponents/AttendanceTrendChart";
import OfficeLocationMap from "../AnalyticsComponents/OfficeLocationMap"; // if you need it

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

        const res = await fetch("http://localhost:3000/api/dashboard/analytics/latest");
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch analytics.");
        }

        setAnalytics(data.analytics);
        setSummary(data.summary);
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError(err.message || "Something went wrong while fetching analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Fallback to empty arrays if analytics is not loaded
  const deskUsageData = analytics?.deskUsageByDay || [];
  const meetingFrequencyData = analytics?.meetingFrequencyByDay || [];
  const attendanceData = analytics?.attendanceByDay || [];
  const spaceTypeData = analytics?.spaceTypeDistribution || [];
  const officeLocation = analytics?.officeLocation;

  const { avgDeskOccupancy, totalMeetings, avgInOffice, busiestDay } =
    useMemo(() => {
      if (summary) return summary;

      return {
        avgDeskOccupancy: 0,
        totalMeetings: 0,
        avgInOffice: 0,
        busiestDay: "-",
      };
    }, [summary]);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <AnalyticsHeader />
      <SummaryCards />
      <DeskUsageChart data={deskUsageData} />
      <MeetingFrequencyChart data={meetingFrequencyData} />
      <AttendanceTrendChart data={attendanceData} />
      <SpaceTypePieChart data={spaceTypeData} />
      {officeLocation && <OfficeLocationMap location={officeLocation} />}
    </div>
  );
};

export default Analytics;
