"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { IProject } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ProjectsPage() {
  const { data: projects, isLoading, mutate } = useApi<IProject[]>("/api/projects");
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/projects/${deleteId}`, "DELETE");
      toast({ title: "Deleted", description: "Project deleted successfully" });
      mutate();
    } catch {
      // error handled by apiRequest
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your portfolio projects</p>
        </div>
        <Link href="/admin/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No projects found. Create your first project!
                </TableCell>
              </TableRow>
            )}
            {projects?.map((project) => (
              <TableRow key={project._id}>
                <TableCell className="font-medium">{project.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{project.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={project.status === "published" ? "default" : "outline"}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>{project.featured ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/projects/${project._id}`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(project._id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}
