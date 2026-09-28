import { adminGigs, adminProjects } from "@/lib/admin-data";
import { replaceGigs } from "@/lib/admin-actions";
import { RowsEditor } from "@/components/admin/RowsEditor";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [gigs, projects] = await Promise.all([adminGigs(), adminProjects()]);
  const { saved } = await searchParams;

  const projectSlugs = projects.map((p) => p.slug);
  const projectLabels = Object.fromEntries(projects.map((p) => [p.slug, p.name]));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Agenda</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Datas de todos os projetos, mostradas juntas no site (ordenadas por data). Uma
          data que já passou deixa de aparecer no site sozinha — não precisas de a apagar.
        </p>
      </div>
      <RowsEditor
        action={replaceGigs}
        addLabel="data"
        saved={saved === "1"}
        initial={gigs}
        fields={[
          {
            name: "projectSlug",
            label: "Projeto",
            type: "select",
            options: projectSlugs,
            optionLabels: projectLabels,
          },
          { name: "date", label: "Data e hora", type: "datetime" },
          { name: "venue", label: "Recinto / local", wide: true },
          { name: "city", label: "Cidade" },
          { name: "ticketUrl", label: "Link de bilhetes", type: "url", wide: true },
          {
            name: "status",
            label: "Estado",
            type: "select",
            options: ["CONFIRMED", "SOLD_OUT", "CANCELLED"],
            optionLabels: {
              CONFIRMED: "Confirmado",
              SOLD_OUT: "Esgotado",
              CANCELLED: "Cancelado",
            },
          },
        ]}
      />
    </div>
  );
}
