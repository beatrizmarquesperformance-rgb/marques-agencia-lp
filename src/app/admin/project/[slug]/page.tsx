import { notFound } from "next/navigation";
import Link from "next/link";
import { adminProject } from "@/lib/admin-data";
import {
  saveProject,
  replaceSocials,
  replacePhotos,
  replaceVideos,
} from "@/lib/admin-actions";
import { RowsEditor } from "@/components/admin/RowsEditor";

const COLORS = ["bg", "primary", "secondary", "text", "accent"] as const;

export default async function ProjectEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { slug } = await params;
  const { saved } = await searchParams;
  const p = await adminProject(slug);
  if (!p) notFound();

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin" className="text-sm text-neutral-400 hover:text-white">
          ← Projetos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{p.name}</h1>
        {saved && <p className="mt-1 text-sm text-green-400">Guardado.</p>}
      </div>

      {/* Core fields */}
      <form action={saveProject.bind(null, slug)} className="space-y-4">
        <h2 className="text-lg font-medium">Texto & identidade</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="name" label="Nome" defaultValue={p.name} />
          <Field name="order" label="Ordem" defaultValue={String(p.order)} />
          <Field
            name="tagline"
            label="Tagline (linha destacada)"
            defaultValue={p.tagline ?? ""}
          />
          <Field name="heroAlt" label="Descrição da imagem hero (alt)" defaultValue={p.heroAlt} />
          <Field name="heroImage" label="URL imagem hero" defaultValue={p.heroImage ?? ""} wide />
          <Field name="logoImage" label="URL logótipo" defaultValue={p.logoImage ?? ""} wide />
        </div>

        <label className="block text-xs text-neutral-400">
          Descrição (parágrafos separados por linha em branco)
          <textarea
            name="description"
            defaultValue={p.description}
            rows={12}
            className="mt-1 w-full bg-neutral-950 p-2 font-mono text-sm text-white"
          />
        </label>

        <div className="flex flex-wrap gap-4">
          {COLORS.map((c) => (
            <label key={c} className="flex flex-col text-xs text-neutral-400">
              {c}
              <span className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  name={c}
                  defaultValue={p.theme[c]}
                  className="h-8 w-10 bg-transparent"
                />
                <code className="text-[11px]">{p.theme[c]}</code>
              </span>
            </label>
          ))}
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="enabled" defaultChecked={p.enabled} /> Visível no site
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="comingSoon" defaultChecked={p.comingSoon} /> Em breve
            (sem conteúdo)
          </label>
        </div>

        <button className="bg-white px-4 py-1.5 text-sm font-medium text-black">
          Guardar texto & identidade
        </button>
      </form>

      <section>
        <h2 className="text-lg font-medium">Redes sociais</h2>
        <p className="mb-2 text-xs text-neutral-500">Só aparecem no site as que tiverem URL.</p>
        <RowsEditor
          action={replaceSocials.bind(null, slug)}
          addLabel="rede social"
          initial={p.socials.map((s) => ({ platform: s.platform, url: s.url }))}
          fields={[
            {
              name: "platform",
              label: "Plataforma",
              type: "select",
              options: ["instagram", "tiktok", "facebook", "youtube", "website"],
            },
            { name: "url", label: "URL", type: "url", wide: true },
          ]}
        />
      </section>

      <section>
        <h2 className="text-lg font-medium">Fotos</h2>
        <p className="mb-2 text-xs text-neutral-500">
          Cola o URL de cada foto (Vercel Blob quando o upload estiver ligado). Reordena com ↑ ↓.
        </p>
        <RowsEditor
          action={replacePhotos.bind(null, slug)}
          addLabel="foto"
          initial={p.photos
            .filter((x) => x.image)
            .map((x) => ({ image: x.image ?? "", alt: x.alt }))}
          fields={[
            { name: "image", label: "URL", type: "url", wide: true },
            { name: "alt", label: "Alt (acessibilidade)", wide: true },
          ]}
        />
      </section>

      <section>
        <h2 className="text-lg font-medium">Vídeos</h2>
        <p className="mb-2 text-xs text-neutral-500">
          2 a 4 vídeos. Para YouTube/Vimeo usa o ID; para MP4/Mux/Cloudflare usa o URL ou
          playback ID.
        </p>
        <RowsEditor
          action={replaceVideos.bind(null, slug)}
          addLabel="vídeo"
          initial={p.videos.map((v) => ({
            provider: v.provider,
            src: v.src,
            poster: v.poster ?? "",
            title: v.title,
          }))}
          fields={[
            {
              name: "provider",
              label: "Fonte",
              type: "select",
              options: ["mp4", "mux", "youtube", "vimeo", "cloudflare"],
            },
            { name: "src", label: "URL / ID", wide: true },
            { name: "poster", label: "Poster URL", type: "url", wide: true },
            { name: "title", label: "Título", wide: true },
          ]}
        />
      </section>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  wide,
}: {
  name: string;
  label: string;
  defaultValue: string;
  wide?: boolean;
}) {
  return (
    <label className={`flex flex-col text-xs text-neutral-400 ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-1 bg-neutral-950 px-2 py-1 text-sm text-white"
      />
    </label>
  );
}
