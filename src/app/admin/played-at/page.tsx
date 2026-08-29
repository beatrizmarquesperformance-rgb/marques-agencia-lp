import { adminPlayedAt } from "@/lib/admin-data";
import { savePlayedAt } from "@/lib/admin-actions";
import { RowsEditor } from "@/components/admin/RowsEditor";

export default async function PlayedAtPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const items = await adminPlayedAt();
  const { saved } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Já passámos por</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Festivais, municípios, marcas e eventos. Reordena com ↑ ↓.
      </p>

      <div className="mt-6">
        <RowsEditor
          action={savePlayedAt}
          addLabel="entrada"
          saved={Boolean(saved)}
          initial={items.map((i) => ({
            name: i.name,
            logo: i.logo ?? "",
            paurl: i.url ?? "",
          }))}
          fields={[
            { name: "name", label: "Nome", wide: true },
            { name: "logo", label: "Logótipo", type: "image", wide: true },
            { name: "paurl", label: "Link (opcional)", type: "url", wide: true },
          ]}
        />
      </div>
    </div>
  );
}
