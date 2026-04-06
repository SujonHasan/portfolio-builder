"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { IExperience } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ExperiencePage() {
  const { data: experiences, isLoading, mutate } = useApi<IExperience[]>("/api/experience");
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/experience/${deleteId}`, "DELETE");
      toast({ title: "Deleted", description: "Experience deleted" });
      mutate();
    } catch {} finally { setDeleting(false); setDeleteId(null); }
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Experience</h1>
          <p className="text-muted-foreground">Manage your work experience</p>
        </div>
        <Link href="/admin/experience/new"><Button><Plus className="mr-2 h-4 w-4" /> Add Experience</Button></Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiences?.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No experience added yet.</TableCell></TableRow>
            )}
            {experiences?.map((exp) => (
              <TableRow key={exp._id}>
                <TableCell className="font-medium">{exp.position}</TableCell>
                <TableCell>{exp.company}</TableCell>
                <TableCell>{formatDate(exp.startDate)} - {exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : "N/A"}</TableCell>
                <TableCell><Badge variant={exp.current ? "default" : "secondary"}>{exp.current ? "Current" : "Past"}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/experience/${exp._id}`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(exp._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
