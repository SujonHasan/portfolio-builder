"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { IEducation } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function EducationPage() {
  const { data: educations, isLoading, mutate } = useApi<IEducation[]>("/api/education");
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/education/${deleteId}`, "DELETE");
      toast({ title: "Deleted", description: "Education deleted" });
      mutate();
    } catch {} finally { setDeleting(false); setDeleteId(null); }
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Education</h1>
          <p className="text-muted-foreground">Manage your education history</p>
        </div>
        <Link href="/admin/education/new"><Button><Plus className="mr-2 h-4 w-4" /> Add Education</Button></Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Institution</TableHead>
              <TableHead>Degree</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {educations?.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No education added yet.</TableCell></TableRow>
            )}
            {educations?.map((edu) => (
              <TableRow key={edu._id}>
                <TableCell className="font-medium">{edu.institution}</TableCell>
                <TableCell>{edu.degree}</TableCell>
                <TableCell>{formatDate(edu.startDate)} - {edu.current ? "Present" : edu.endDate ? formatDate(edu.endDate) : "N/A"}</TableCell>
                <TableCell><Badge variant={edu.current ? "default" : "secondary"}>{edu.current ? "Current" : "Completed"}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/education/${edu._id}`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(edu._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
