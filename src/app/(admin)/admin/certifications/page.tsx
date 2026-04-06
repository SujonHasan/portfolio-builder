"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { ICertification } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function CertificationsPage() {
  const { data: certifications, isLoading, mutate } = useApi<ICertification[]>("/api/certifications");
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/certifications/${deleteId}`, "DELETE");
      toast({ title: "Deleted", description: "Certification deleted successfully" });
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
          <h1 className="text-3xl font-bold">Certifications</h1>
          <p className="text-muted-foreground">Manage your certifications</p>
        </div>
        <Link href="/admin/certifications/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Certification</Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Issuer</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certifications?.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No certifications found.</TableCell></TableRow>
            )}
            {certifications?.map((certification) => (
              <TableRow key={certification._id}>
                <TableCell className="font-medium">{certification.title}</TableCell>
                <TableCell>{certification.issuer}</TableCell>
                <TableCell>{formatDate(certification.issueDate)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/certifications/${certification._id}`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(certification._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
