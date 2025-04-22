import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const getAlertIcon = (type) => {
  switch (type.toLowerCase()) {
    case "face_not_visible":
      return <Eye className="h-4 w-4 mr-2" />;
    case "multiple_faces":
      return <Eye className="h-4 w-4 mr-2" />;
    case "suspicious_object":
      return <AlertTriangle className="h-4 w-4 mr-2" />;
    default:
      return <AlertTriangle className="h-4 w-4 mr-2" />;
  }
};

const getAlertBadge = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
    case "reviewed":
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Reviewed</Badge>;
    case "dismissed":
      return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Dismissed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const AlertList = ({ alerts = [], onViewAlert }) => {
  const [, setLocation] = useLocation();
  const [displayCount, setDisplayCount] = useState(5);
  
  const handleViewAll = () => {
    setLocation("/monitoring");
  };
  
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 5);
  };
  
  if (!alerts.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <AlertTriangle className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No alerts to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Alerts</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleViewAll}>View All</Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {alerts.slice(0, displayCount).map((alert) => (
            <li key={alert.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <div className="bg-red-50 text-red-600 p-2 rounded-lg">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <p className="font-medium">{alert.type.replace(/_/g, ' ')}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getAlertBadge(alert.status)}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onViewAlert(alert.id)}
                    className="text-xs"
                  >
                    Details
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {alerts.length > displayCount && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" onClick={handleLoadMore}>
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertList;
