import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AlertTable = ({ alerts, onReview, onFlag }) => {
  // Helper to format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Render status badge
  const renderStatus = (status) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            New
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            Resolved
          </Badge>
        );
      case "flagged":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            Flagged
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  // If no alerts provided, show empty state
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">No alerts found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(alert.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {alert.student?.name || "Unknown Student"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {alert.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStatus(alert.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button 
                    variant="link" 
                    className="text-primary hover:text-indigo-900 mr-3"
                    onClick={() => onReview(alert.id)}
                  >
                    Review
                  </Button>
                  <Button 
                    variant="link" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onFlag(alert.id)}
                  >
                    Flag
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertTable;
