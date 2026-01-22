import { useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOffices } from "@/features/offices/hooks/useOffices";
import { officesApi } from "@/features/offices/api/offices";
import type { Office } from "@/features/offices/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OfficeFormState = {
  cityName: string;
  branchName: string;
  location: string;
  activeTechniciansCount: string;
};

const emptyForm: OfficeFormState = {
  cityName: "",
  branchName: "",
  location: "",
  activeTechniciansCount: "",
};

export function OfficesPage() {
  const { user } = useAuth();
  const { offices, isLoading, error, refresh } = useOffices();

  const canCreateOrEdit =
    user?.role === "supervisor" || user?.role === "manager";
  const canDelete = user?.role === "manager";

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OfficeFormState>(emptyForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editingOffice: Office | undefined = useMemo(() => {
    if (!editingId) return undefined;
    return offices.find((o) => o._id === editingId);
  }, [editingId, offices]);

  const startEdit = (office: Office) => {
    setSubmitError(null);
    setEditingId(office._id);
    setForm({
      cityName: office.cityName || "",
      branchName: office.branchName || "",
      location: office.location || "",
      activeTechniciansCount:
        typeof office.activeTechniciansCount === "number"
          ? String(office.activeTechniciansCount)
          : "",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSubmitError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateOrEdit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const activeTechniciansCount = form.activeTechniciansCount.trim();
      const payload = {
        cityName: form.cityName.trim(),
        branchName: form.branchName.trim(),
        location: form.location.trim(),
        ...(activeTechniciansCount
          ? { activeTechniciansCount: Number(activeTechniciansCount) }
          : {}),
      };

      if (!payload.cityName || !payload.branchName || !payload.location) {
        setSubmitError("City, branch name, and location are required.");
        return;
      }

      if (editingId) {
        await officesApi.update(editingId, payload);
      } else {
        await officesApi.create(payload);
      }

      resetForm();
      await refresh();
    } catch (e: any) {
      setSubmitError(
        e?.response?.data?.message || e?.message || "Failed to save office",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async (office: Office) => {
    if (!canDelete) return;
    const ok = window.confirm(
      `Delete office "${office.branchName}" in "${office.cityName}"?`,
    );
    if (!ok) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await officesApi.remove(office._id);
      if (editingId === office._id) resetForm();
      await refresh();
    } catch (e: any) {
      setSubmitError(
        e?.response?.data?.message || e?.message || "Failed to delete office",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Offices</h1>
          <p className="text-muted-foreground">Manage branch offices</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="text-foreground font-medium">{offices.length}</span>
        </div>
      </div>

      {!canCreateOrEdit && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Office Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You are logged in as{" "}
              <span className="font-medium text-foreground">{user?.role}</span>.
              Only
              <span className="font-medium text-foreground">
                {" "}
                supervisor
              </span>{" "}
              or
              <span className="font-medium text-foreground"> manager</span> can
              create/edit offices, and only a
              <span className="font-medium text-foreground"> manager</span> can
              delete offices.
            </p>
          </CardContent>
        </Card>
      )}

      {canCreateOrEdit && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              {editingOffice ? "Edit Office" : "Create Office"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cityName">City</Label>
                  <Input
                    id="cityName"
                    value={form.cityName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, cityName: e.target.value }))
                    }
                    placeholder="Addis Ababa"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchName">Branch Name</Label>
                  <Input
                    id="branchName"
                    value={form.branchName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        branchName: e.target.value,
                      }))
                    }
                    placeholder="Bole Branch"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="Near XYZ"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activeTechniciansCount">
                    Active Technicians
                  </Label>
                  <Input
                    id="activeTechniciansCount"
                    inputMode="numeric"
                    value={form.activeTechniciansCount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        activeTechniciansCount: e.target.value,
                      }))
                    }
                    placeholder="5"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {editingOffice ? "Save Changes" : "Create Office"}
                </Button>
                {editingOffice && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Office List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">
              Loading offices...
            </p>
          ) : error ? (
            <p className="text-destructive text-center py-8">{error}</p>
          ) : offices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No offices</p>
          ) : (
            <div className="space-y-3">
              {offices.map((office) => (
                <div
                  key={office._id}
                  className="p-4 bg-secondary rounded-lg border border-border"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-secondary-foreground">
                        {office.branchName} • {office.cityName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {office.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Active technicians: {office.activeTechniciansCount}
                      </p>
                    </div>

                    {(canCreateOrEdit || canDelete) && (
                      <div className="flex items-center gap-2">
                        {canCreateOrEdit && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(office)}
                            disabled={isSubmitting}
                          >
                            Edit
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(office)}
                            disabled={isSubmitting}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
