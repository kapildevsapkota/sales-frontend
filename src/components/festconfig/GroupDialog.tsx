"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeaderSelect } from "./LeaderSelect";
import { MembersMultiSelect } from "./MembersMultiSelect";
import type { OptionItem } from "./types";

interface GroupFormData {
  name: string;
  leader: string;
  members: string[];
}

interface GroupDialogProps {
  open: boolean;
  title: string;
  formData: GroupFormData;
  setFormData: (data: GroupFormData) => void;
  availableMembers: OptionItem[];
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function GroupDialog({
  open,
  title,
  formData,
  setFormData,
  availableMembers,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: GroupDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter group name"
            />
          </div>
          <div>
            <Label htmlFor="leader">Leader</Label>
            <LeaderSelect
              id="leader"
              options={availableMembers}
              value={formData.leader}
              onChange={(v) => setFormData({ ...formData, leader: v })}
            />
          </div>
          <div>
            <Label htmlFor="members">Members</Label>
            <MembersMultiSelect
              options={availableMembers}
              selected={formData.members}
              onChange={(members) => setFormData({ ...formData, members })}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={onSubmit} className="flex-1">
              {submitLabel}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
