import { ResumeTemplateKey } from "@/types";

export const RESUME_TEMPLATES: Array<{
  id: ResumeTemplateKey;
  name: string;
  description: string;
}> = [
  {
    id: "classic",
    name: "Classic Professional",
    description: "Clean single-column layout with strong section hierarchy.",
  },
  {
    id: "compact",
    name: "Compact Modern",
    description: "Denser modern layout with emphasis on skills and highlights.",
  },
  {
    id: "timeline",
    name: "Timeline Story",
    description: "Career-focused resume with a visual experience timeline.",
  },
];
