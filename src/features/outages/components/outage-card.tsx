import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";
import type { Outage } from "../types";
import { cn } from "@/lib/utils";
import { useOffices } from "@/features/offices/hooks/useOffices";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface OutageCardProps {
  outage: Outage;
  onUpdate?: (id: string, data: { status?: "Active" | "Resolved" }) => void;
  onDelete?: (id: string) => void;
}

export function OutageCard({ outage, onUpdate, onDelete }: OutageCardProps) {
  const { user } = useAuth();
  const { data: offices = [] } = useOffices();

  // Handle both populated object and string ID
  const officeId =
    typeof outage.officeId === "object" && outage.officeId !== null
      ? outage.officeId._id
      : outage.officeId;
  const office =
    offices.find((o) => o._id === officeId) ||
    (typeof outage.officeId === "object" && outage.officeId !== null
      ? outage.officeId
      : null);

  const isActive = outage.status === "Active";

  // Role-based permissions
  const canUpdate =
    (user?.role === "supervisor" || user?.role === "manager") && onUpdate;
  const canDelete = user?.role === "manager" && onDelete;

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
                {office?.branchName ||
                  (typeof outage.officeId === "object" &&
                  outage.officeId !== null
                    ? outage.officeId.branchName
                    : null) ||
                  "Unknown office"}
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
        {(canUpdate || canDelete) && (
          <div className="flex gap-2 pt-2 border-t border-border">
            {canUpdate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onUpdate?.(outage._id, {
                    status: isActive ? "Resolved" : "Active",
                  })
                }
                className="flex-1"
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                {isActive ? "Mark Resolved" : "Mark Active"}
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete?.(outage._id)}
                className="flex-1"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
