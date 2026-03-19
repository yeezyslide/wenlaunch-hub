import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResourceEditor } from "@/components/resources/resource-editor";

export default async function ResourceDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const doc = await prisma.resourceDocument.findUnique({
    where: { id },
    include: { folder: true },
  });

  if (!doc) notFound();

  return (
    <ResourceEditor
      document={{
        id: doc.id,
        title: doc.title,
        content: doc.content ?? "",
        folderId: doc.folderId,
        folderName: doc.folder.name,
      }}
    />
  );
}
