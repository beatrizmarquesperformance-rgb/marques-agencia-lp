import Link from "next/link";
import { adminProjects } from "@/lib/admin-data";

export default async function AdminHome() {
  const projects = await adminProjects();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Projetos</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Edita texto, cores, fotos, vídeos e redes sociais de cada projeto.
      </p>

      <ul className="mt-6 divide-y divide-neutral-800 border border-neutral-800">
        {projects.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/admin/project/${p.slug}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-neutral-900"
            >
              <span className="flex items-center gap-3">
                <span
                  className="inline-block h-4 w-4 rounded-sm border border-neutral-700"
                  style={{ background: p.theme.bg }}
                />
                <span className="font-medium">{p.name}</span>
                {p.comingSoon && (
                  <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] uppercase text-neutral-400">
                    Em breve
                  </span>
                )}
                {!p.enabled && (
                  <span className="rounded bg-red-900/60 px-1.5 py-0.5 text-[10px] uppercase text-red-300">
                    Oculto
                  </span>
                )}
              </span>
              <span className="text-xs text-neutral-500">
                {p.photos.length} fotos · {p.videos.length} vídeos · {p.socials.length} redes
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
