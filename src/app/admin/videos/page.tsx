import { adminProjects, adminSettings } from "@/lib/admin-data";
import { saveHeroVideo, savePromoVideo } from "@/lib/admin-actions";
import { ImageField } from "@/components/admin/ImageField";

const PROVIDERS = ["mp4", "youtube", "vimeo", "mux", "cloudflare"];

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [s, projects] = await Promise.all([adminSettings(), adminProjects()]);
  const { saved } = await searchParams;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Vídeos da 1ª dobra</h1>
        <p className="mt-1 text-sm text-neutral-400">
          O vídeo grande do topo e o vídeo vertical de cada projeto (a fila de cartões
          logo abaixo). Carrega um MP4 (≤&nbsp;4&nbsp;MB) ou, para ficheiros maiores,
          escolhe a fonte <strong>youtube</strong>/<strong>vimeo</strong> e cola só o ID.
        </p>
      </div>

      {/* Hero video */}
      <section className="rounded border border-neutral-800 p-4">
        <h2 className="text-lg font-medium">Vídeo do topo (hero)</h2>
        {saved === "hero" && <p className="mt-1 text-sm text-green-400">Guardado.</p>}
        <form action={saveHeroVideo} noValidate className="mt-3 space-y-4">
          <ProviderSelect name="heroVideoProvider" value={s.heroVideoProvider} />
          <ImageField
            kind="video"
            name="heroVideoSrc"
            label="Vídeo — carrega MP4 ou cola URL / ID"
            defaultValue={s.heroVideoSrc}
          />
          <ImageField
            name="heroVideoPoster"
            label="Poster (imagem mostrada enquanto o vídeo carrega)"
            defaultValue={s.heroVideoPoster}
          />
          <Save />
        </form>
      </section>

      {/* Per-project rail video */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Vídeo vertical por projeto (fila “Os projetos”)</h2>
        {projects.map((p) => (
          <div key={p.slug} className="rounded border border-neutral-800 p-4">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-sm border border-neutral-700"
                style={{ background: p.theme.bg }}
              />
              <h3 className="font-medium">{p.name}</h3>
              {saved === p.slug && (
                <span className="text-sm text-green-400">· Guardado</span>
              )}
            </div>
            <form
              action={savePromoVideo.bind(null, p.slug)}
              noValidate
              className="mt-3 space-y-4"
            >
              <ProviderSelect name="promoProvider" value={p.promoVideo.provider} />
              <ImageField
                kind="video"
                name="promoSrc"
                label="Vídeo vertical (9:16) — carrega MP4 ou cola URL / ID"
                defaultValue={p.promoVideo.src ?? ""}
              />
              <ImageField
                name="promoPoster"
                label="Poster do vídeo vertical"
                defaultValue={p.promoVideo.poster ?? ""}
              />
              <Save />
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}

function ProviderSelect({ name, value }: { name: string; value: string }) {
  return (
    <label className="flex flex-col text-xs text-neutral-400">
      Fonte
      <select
        name={name}
        defaultValue={value}
        className="mt-1 w-44 bg-neutral-950 px-2 py-1 text-sm text-white"
      >
        {PROVIDERS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Save() {
  return (
    <button className="bg-white px-4 py-1.5 text-sm font-medium text-black">Guardar</button>
  );
}
