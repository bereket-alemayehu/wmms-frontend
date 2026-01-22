import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, MapPin } from "lucide-react";
import type { Outage } from "../types";
import { cn } from "@/lib/utils";
import { useOffices } from "@/features/offices/hooks/useOffices";

interface OutageCardProps {
  outage: Outage;
}

export function OutageCard({ outage }: OutageCardProps) {
  const { data: offices = [] } = useOffices();
  const office = offices.find((o) => o._id === outage.officeId);
  const isActive = outage.status === "Active";

  const estimatedDate = outage.estimatedResolution
    ? new Date(outage.estimatedResolution)
    : null;
  const formattedEstimate = estimatedDate
    ? estimatedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Card
      className={cn(
        "border-border",
        isActive ? "bg-destructive/5 border-destructive/30" : "bg-card",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                isActive ? "bg-destructive/20" : "bg-success/20",
              )}
            >
              {isActive ? (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              ) : (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">
                {outage.title}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {office?.branchName || "Unknown office"}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              isActive
                ? "bg-destructive/20 text-destructive border-destructive/30"
                : "bg-success/20 text-success border-success/30",
            )}
          >
            {outage.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-card-foreground">{outage.message}</p>
        <div className="flex flex-wrap gap-2">
          {outage.affectedAreas.map((area) => (
            <Badge
              key={area}
              variant="secondary"
              className="bg-secondary text-secondary-foreground"
            >
              {area}
            </Badge>
          ))}
        </div>
        {isActive && formattedEstimate && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Est. resolution: {formattedEstimate}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
