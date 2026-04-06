"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { ISkill } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function SkillsPage() {
  const { data: skills, isLoading, mutate } = useApi<ISkill[]>("/api/skills");
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/skills/${deleteId}`, "DELETE");
      toast({ title: "Deleted", description: "Skill deleted successfully" });
      mutate();
    } catch {} finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Skills</h1>
          <p className="text-muted-foreground">Manage your technical skills</p>
        </div>
        <Link href="/admin/skills/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Skill</Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Proficiency</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills?.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No skills found.</TableCell></TableRow>
            )}
            {skills?.map((skill) => (
              <TableRow key={skill._id}>
                <TableCell className="font-medium">{skill.name}</TableCell>
                <TableCell><Badge variant="secondary">{skill.category}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${skill.proficiency}%` }} />
                    </div>
                    <span className="text-sm">{skill.proficiency}%</span>
                  </div>
                </TableCell>
                <TableCell>{skill.order}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/skills/${skill._id}`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(skill._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={handleDelete} isLoading={deleting} />
    </div>
  );
}
