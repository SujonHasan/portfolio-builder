import PreviewPage, { generateMetadata as previewGenerateMetadata } from "../preview/[username]/page";

export const dynamic = "force-dynamic";

export const generateMetadata = previewGenerateMetadata;

export default PreviewPage;
