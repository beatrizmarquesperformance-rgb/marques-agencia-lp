import { adminSettings } from "@/lib/admin-data";
import { saveSettings } from "@/lib/admin-actions";
import { ImageField } from "@/components/admin/ImageField";

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

      <form action={saveSettings} noValidate className="mt-6 space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Geral</h2>
          <Row name="siteName" label="Nome da agência (cabeçalho, rodapé, SEO)" defaultValue={s.siteName} />
          <Row name="ogImage" label="Imagem de partilha (Open Graph) — URL" defaultValue={s.ogImage} />
          <Row name="contactPhone" label="Telefone de booking (1)" defaultValue={s.contactPhone} />
          <Row name="contactName" label="Nome de contacto (1)" defaultValue={s.contactName} />
          <Row name="contactPhone2" label="Telefone de booking (2) — opcional" defaultValue={s.contactPhone2} />
          <Row name="contactName2" label="Nome de contacto (2) — opcional" defaultValue={s.contactName2} />
          <Row name="contactEmail" label="E-mail de contacto (opcional)" defaultValue={s.contactEmail} />
          <Row
            name="bandsintownArtist"
            label='Artista Bandsintown (nome exato ou "id_123")'
            defaultValue={s.bandsintownArtist}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Vídeo do topo (hero)</h2>
          <label className="flex flex-col text-xs text-neutral-400">
            Fonte do vídeo
            <select
              name="heroVideoProvider"
              defaultValue={s.heroVideoProvider}
              className="mt-1 w-40 bg-neutral-950 px-2 py-1 text-sm text-white"
            >
              {["mp4", "mux", "youtube", "vimeo", "cloudflare"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
          <Row
            name="heroVideoSrc"
            label="URL do vídeo (mp4) ou ID (YouTube/Vimeo/Mux/Cloudflare)"
            defaultValue={s.heroVideoSrc}
          />
          <ImageField
            name="heroVideoPoster"
            label="Poster do vídeo (mostrado enquanto carrega)"
            defaultValue={s.heroVideoPoster}
          />
          <Row name="heroHeadline" label="Título do hero" defaultValue={s.heroHeadline} />
          <Row name="heroSubhead" label="Subtítulo do hero" defaultValue={s.heroSubhead} />
        </section>

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
