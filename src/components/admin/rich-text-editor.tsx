"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Heading2, Link as LinkIcon, Undo, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sanitizeRichText, sanitizeUrl } from "@/lib/sanitize";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function ToolButton({
  onClick,
  isActive,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", isActive && "bg-accent")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function RichTextEditor({ value, onChange, placeholder = "Write something..." }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "tiptap prose dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(sanitizeRichText(editor.getHTML()));
    },
  });

  useEffect(() => {
    const sanitizedValue = sanitizeRichText(value);

    if (editor && sanitizedValue !== editor.getHTML()) {
      editor.commands.setContent(sanitizedValue);
    }
  }, [value, editor]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    const safeUrl = sanitizeUrl(url);

    if (safeUrl) {
      editor.chain().focus().setLink({ href: safeUrl }).run();
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50 flex-wrap">
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        >
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={addLink} isActive={editor.isActive("link")}>
          <LinkIcon className="h-4 w-4" />
        </ToolButton>
        <div className="flex-1" />
        <ToolButton onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </ToolButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
