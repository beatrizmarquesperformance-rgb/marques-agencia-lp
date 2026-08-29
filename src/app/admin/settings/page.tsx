import { adminSettings } from "@/lib/admin-data";
import { saveSettings } from "@/lib/admin-actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const s = await adminSettings();
  const { saved } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Definições</h1>
      {saved && <p className="mt-1 text-sm text-green-400">Guardado.</p>}

      <form action={saveSettings} className="mt-6 space-y-4">
        <Row name="siteName" label="Nome da agência (cabeçalho, rodapé, SEO)" defaultValue={s.siteName} />
        <Row name="ogImage" label="Imagem de partilha (Open Graph) — URL" defaultValue={s.ogImage} />
        <Row name="contactPhone" label="Telefone de booking" defaultValue={s.contactPhone} />
        <Row name="contactName" label="Nome de contacto" defaultValue={s.contactName} />
        <Row
          name="bandsintownArtist"
          label='Artista Bandsintown (nome exato ou "id_123")'
          defaultValue={s.bandsintownArtist}
        />
        <button className="bg-white px-4 py-1.5 text-sm font-medium text-black">Guardar</button>
      </form>

      <p className="mt-6 text-xs text-neutral-500">
        O <code>app_id</code> do Bandsintown é um segredo de servidor (variável{" "}
        <code>BANDSINTOWN_APP_ID</code>), não editável aqui.
      </p>
    </div>
  );
}

function Row({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <label className="flex flex-col text-xs text-neutral-400">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-1 max-w-md bg-neutral-950 px-2 py-1 text-sm text-white"
      />
    </label>
  );
}
