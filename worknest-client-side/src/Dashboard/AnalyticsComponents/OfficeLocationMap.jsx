// src/components/Dashboard/AnalyticsComponents/OfficeLocationMap.jsx
import React from "react";

const OfficeLocationMap = ({ officeLocation }) => {
  if (!officeLocation || !officeLocation.mapsIframeUrl) return null;

  return (
    <div className="bg-white shadow rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Office Location</h2>
        {officeLocation.address && (
          <span className="text-sm text-gray-500">
            {officeLocation.address}
          </span>
        )}
      </div>

      <div className="mt-2 w-full h-64 overflow-hidden rounded-md">
        <iframe
          src={officeLocation.mapsIframeUrl}
          title="Office Location Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};

export default OfficeLocationMap;
