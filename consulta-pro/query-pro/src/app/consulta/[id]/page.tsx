import { prisma } from "@/lib/prisma";
import ConsultaTable from "../_components/ConsultaTable";

interface PageProps {
  params: {
    id: string;
    user_id: string;
  };
}

export const dynamic = "force-dynamic";

const Page = async ({ params: { id, user_id } }: PageProps) => {
  /*const consulta = await prisma.consulta.findUnique({
    where: { id: Number(id) },
  });*/

  const documentos = await prisma.documento.findMany({
    where: { consulta_id: Number(id), user_id: Number(user_id) },
    orderBy: [{ status: "asc" }, { document_name: "asc" }],
  });

  return <ConsultaTable consultas={documentos} />;
};

export default Page;
