"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { GroupsList } from "./GroupsList";
import { GroupDialog } from "./GroupDialog";
import type { Group, OptionItem } from "./types";

// Types moved to ./types

export default function FestConfigView() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const { user } = useAuth();

  const [showGroups, setShowGroups] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    leader: "", // stores leader id as string
    members: [] as string[], // stores member ids as strings
  });

  const [availableMembers, setAvailableMembers] = useState<OptionItem[]>([]);

  useEffect(() => {
    const fetchSalesPersons = async () => {
      try {
        const response = await api.get("/api/account/salespersons/");
        // Attempt to normalize various possible shapes
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const options = list
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((sp: any) => {
            const first = sp.first_name || sp.firstName || sp.fname || "";
            const last = sp.last_name || sp.lastName || sp.lname || "";
            const fullName =
              [first, last].filter(Boolean).join(" ") ||
              sp.full_name ||
              sp.name ||
              sp.username ||
              "Unknown";
            const value = String(
              sp.id ?? sp.phone_number ?? sp.phone ?? fullName
            );
            return { label: fullName, value };
          })
          // Deduplicate by value
          .filter(
            (
              opt: { label: string; value: string },
              index: number,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              self: any[]
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) => index === self.findIndex((o: any) => o.value === opt.value)
          );
        setAvailableMembers(options);
      } catch (error) {
        console.error("Failed to load sales persons:", error);
        setAvailableMembers([]);
      }
    };
    fetchSalesPersons();
  }, []);

  // Load initial has_sales_fest to reflect switch state
  useEffect(() => {
    const fetchFestConfig = async () => {
      if (!user?.franchise_id) return;
      try {
        const res = await api.get(`/api/fest-config/${user.franchise_id}/`);
        const data = res.data?.data ?? res.data;
        if (data && typeof data.has_sales_fest === "boolean") {
          setShowGroups(data.has_sales_fest);
        }
      } catch (error) {
        console.error("Failed to fetch fest config:", error);
      }
    };
    fetchFestConfig();
  }, [user?.franchise_id]);

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoadingGroups(true);
      try {
        const response = await api.get("/api/sales-groups/");
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        // Build a quick id->label map from available members if only IDs are returned
        const idToLabel = new Map(
          availableMembers.map((o) => [String(o.value), o.label])
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalized: Group[] = list.map((item: any) => {
          const groupId = String(
            item.id ?? item.uuid ?? crypto.randomUUID?.() ?? Date.now()
          );
          const groupName = item.group_name ?? item.name ?? "Unnamed Group";

          // Resolve leader
          let leaderName = "";
          if (item.leader && typeof item.leader === "object") {
            const f =
              item.leader.first_name ||
              item.leader.firstName ||
              item.leader.fname ||
              "";
            const l =
              item.leader.last_name ||
              item.leader.lastName ||
              item.leader.lname ||
              "";
            leaderName =
              [f, l].filter(Boolean).join(" ") ||
              item.leader.full_name ||
              item.leader.name ||
              item.leader.username ||
              String(item.leader.id ?? "");
          } else if (item.leader) {
            leaderName =
              idToLabel.get(String(item.leader)) || String(item.leader);
          }

          // Resolve members
          let memberNames: string[] = [];
          if (Array.isArray(item.members)) {
            if (
              item.members.length > 0 &&
              typeof item.members[0] === "object"
            ) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              memberNames = item.members.map((m: any) => {
                const f = m.first_name || m.firstName || m.fname || "";
                const l = m.last_name || m.lastName || m.lname || "";
                return (
                  [f, l].filter(Boolean).join(" ") ||
                  m.full_name ||
                  m.name ||
                  m.username ||
                  String(m.id ?? "")
                );
              });
            } else {
              memberNames = item.members.map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (id: any) => idToLabel.get(String(id)) || String(id)
              );
            }
          }

          const created =
            item.created_at ||
            item.createdAt ||
            item.created ||
            new Date().toISOString();

          return {
            id: groupId,
            name: groupName,
            leader: leaderName,
            members: memberNames,
            createdAt: new Date(created),
          } as Group;
        });

        setGroups(normalized);
      } catch (error) {
        console.error("Failed to load groups:", error);
        setGroups([]);
      } finally {
        setIsLoadingGroups(false);
      }
    };
    fetchGroups();
    // We intentionally don't depend on availableMembers here to avoid refetch loops.
    // Names will update on next open if needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateGroup = () => {
    if (!formData.name || formData.members.length === 0) return;

    const payload: {
      group_name: string;
      members: number[];
      leader?: number | null;
    } = {
      group_name: formData.name,
      members: formData.members.map((m) => Number(m)),
    };
    if (formData.leader) {
      payload.leader = Number(formData.leader);
    }

    api
      .post("/api/sales-groups/", payload)
      .then((res) => {
        // Map ids back to labels for local optimistic UI
        const idToLabel = new Map(
          availableMembers.map((o) => [o.value, o.label])
        );
        const newGroup: Group = {
          id: String(res.data?.id ?? Date.now()),
          name: formData.name,
          leader: formData.leader
            ? idToLabel.get(formData.leader) || formData.leader
            : "",
          members: formData.members.map((id) => idToLabel.get(id) || id),
          createdAt: new Date(),
        };
        setGroups([...groups, newGroup]);
        setFormData({ name: "", leader: "", members: [] });
        setIsCreateDialogOpen(false);
      })
      .catch((error) => {
        console.error("Failed to create group:", error);
      });
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    // Map displayed names back to IDs using availableMembers
    const labelToId = new Map(availableMembers.map((o) => [o.label, o.value]));
    const leaderId = labelToId.get(group.leader) || group.leader;
    const memberIds = group.members.map((m) => labelToId.get(m) || m);
    setFormData({
      name: group.name,
      leader: String(leaderId),
      members: memberIds.map((m) => String(m)),
    });
  };

  const handleUpdateGroup = () => {
    if (!editingGroup || !formData.name || formData.members.length === 0)
      return;

    const payload: {
      group_name: string;
      members: number[];
      leader?: number | null;
    } = {
      group_name: formData.name,
      members: formData.members.map((m) => Number(m)),
    };
    if (formData.leader) {
      payload.leader = Number(formData.leader);
    }

    api
      .patch(`/api/sales-groups/${editingGroup.id}/`, payload)
      .then(() => {
        const idToLabel = new Map(
          availableMembers.map((o) => [o.value, o.label])
        );
        const updatedGroups = groups.map((group) =>
          group.id === editingGroup.id
            ? {
                ...group,
                name: formData.name,
                leader: formData.leader
                  ? idToLabel.get(formData.leader) || formData.leader
                  : "",
                members: formData.members.map((id) => idToLabel.get(id) || id),
              }
            : group
        );
        setGroups(updatedGroups);
        setEditingGroup(null);
        setFormData({ name: "", leader: "", members: [] });
      })
      .catch((error) => {
        console.error("Failed to update group:", error);
      });
  };

  const handleDeleteGroup = (id: string) => {
    api
      .delete(`/api/sales-groups/${id}/`)
      .then(() => {
        setGroups(groups.filter((group) => group.id !== id));
      })
      .catch((error) => {
        console.error("Failed to delete group:", error);
      });
  };

  const resetForm = () => {
    setFormData({ name: "", leader: "", members: [] });
    setEditingGroup(null);
  };

  const handleShowGroupsToggle = async (checked: boolean) => {
    setShowGroups(checked);
    // Broadcast immediately so other UI (e.g., navbar) can react without reload
    try {
      // Cache latest state for fast reads
      if (typeof window !== "undefined") {
        window.localStorage.setItem("has_sales_fest", JSON.stringify(checked));
        window.dispatchEvent(
          new CustomEvent("salesfest:updated", {
            detail: { has_sales_fest: checked },
          })
        );
      }
    } catch (error) {
      console.error("Failed to update sales fest:", error);
      // ignore storage errors
    }
    try {
      await api.patch(`/api/fest-config/${user?.franchise_id}/`, {
        has_sales_fest: checked,
      });
    } catch (error) {
      console.error("Error updating sales config:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Group Manager
            </h1>
            <p className="text-muted-foreground">
              Create and manage your teams and groups
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="show-groups" className="text-sm font-medium">
                Show Groups
              </Label>
              <Switch
                id="show-groups"
                checked={showGroups}
                onCheckedChange={handleShowGroupsToggle}
              />
            </div>

            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>

        {/* Groups List */}
        <div className="space-y-4">
          <GroupsList
            groups={groups}
            isLoading={isLoadingGroups}
            onEdit={handleEditGroup}
            onDelete={handleDeleteGroup}
            onCreateClick={() => setIsCreateDialogOpen(true)}
          />
        </div>

        {/* Edit Dialog */}
        <GroupDialog
          open={!!editingGroup}
          title="Edit Group"
          formData={formData}
          setFormData={(d) => setFormData(d)}
          availableMembers={availableMembers}
          onSubmit={handleUpdateGroup}
          onCancel={resetForm}
          submitLabel="Update Group"
        />

        {/* Create Dialog */}
        <GroupDialog
          open={isCreateDialogOpen}
          title="Create New Group"
          formData={formData}
          setFormData={(d) => setFormData(d)}
          availableMembers={availableMembers}
          onSubmit={handleCreateGroup}
          onCancel={() => {
            setIsCreateDialogOpen(false);
            resetForm();
          }}
          submitLabel="Create Group"
        />
      </div>
    </div>
  );
}
