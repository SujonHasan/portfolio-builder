"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export function ImageUpload({ value, onChange, folder = "projects" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "File size must be less than 5MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        onChange(data.data.url);
        toast({ title: "Success", description: "Image uploaded successfully" });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <Image
            src={value}
            alt="Upload"
            width={200}
            height={150}
            className="rounded-lg object-cover border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={() => onChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload image</p>
              <p className="text-xs text-muted-foreground mt-1">Max 5MB (JPEG, PNG, WebP)</p>
            </>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
