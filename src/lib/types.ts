export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "youtube"
  | "website";

export interface Social {
  platform: SocialPlatform;
  url: string;
}

export interface GalleryPhoto {
  image: string | null; // null => themed placeholder tile
  alt: string;
}

export interface Video {
  provider: "mp4" | "mux" | "youtube" | "vimeo" | "cloudflare";
  src: string;
  poster: string | null;
  title: string;
}

export interface ProjectTheme {
  bg: string;
  primary: string;
  secondary: string;
  text: string;
  accent: string;
  /** optional second solid used for the split-panel effect (Pimba) */
  bgSplit?: string;
}

export interface Project {
  slug: string;
  name: string;
  order: number;
  enabled: boolean;
  comingSoon: boolean;
  tagline: string | null;
  /** paragraphs separated by a blank line */
  description: string;
  heroImage: string | null;
  heroAlt: string;
  logoImage: string | null;
  theme: ProjectTheme;
  socials: Social[];
  photos: GalleryPhoto[];
  videos: Video[];
}

export interface PlayedAt {
  name: string;
  logo: string | null;
  url: string | null;
}

export interface SiteContent {
  settings: {
    siteName: string | null;
    ogImage: string | null;
    contactPhone: string;
    contactName: string;
    bandsintownArtist: string | null;
  };
  projects: Project[];
  playedAt: PlayedAt[];
}
