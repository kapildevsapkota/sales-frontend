"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Crown, Edit, Trash2 } from "lucide-react";
import type { Group } from "./types";

interface GroupsListProps {
  groups: Group[];
  isLoading: boolean;
  onEdit: (group: Group) => void;
  onDelete: (id: string) => void;
  onCreateClick: () => void;
}

export function GroupsList({ groups, isLoading, onEdit, onDelete, onCreateClick }: GroupsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Loading groups...</h3>
          <p className="text-muted-foreground">Please wait</p>
        </CardContent>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-4">No groups yet</h3>
          <Button onClick={onCreateClick}>Create Group</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {groups.map((group) => (
        <Card key={group.id} className="hover:bg-accent/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                  <Badge variant="secondary" className="text-xs">{group.members.length + 1} members</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Leader:</span>
                    <span className="text-sm text-muted-foreground">{group.leader}</span>
                  </div>
                  {group.members.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Members:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {group.members.map((member, index) => (
                            <Badge key={index} variant="outline" className="text-xs">{member}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Created {group.createdAt.toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(group)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(group.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


