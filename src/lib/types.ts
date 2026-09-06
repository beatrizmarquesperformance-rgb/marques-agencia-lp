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

export type VideoProvider = "mp4" | "mux" | "youtube" | "vimeo" | "cloudflare";

export interface Video {
  provider: VideoProvider;
  src: string;
  poster: string | null;
  title: string;
}

export interface PromoVideo {
  provider: VideoProvider;
  src: string | null;
  poster: string | null;
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
  heroCutout: string | null;
  heroCutoutSide: "left" | "right";
  promoVideo: PromoVideo;
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

export interface Contact {
  name: string;
  phone: string;
}

export interface SiteSettings {
  siteName: string | null;
  ogImage: string | null;
  contactPhone: string;
  contactName: string;
  contactPhone2: string | null;
  contactName2: string | null;
  contactEmail: string | null;
  bandsintownArtist: string | null;
  heroVideoProvider: VideoProvider;
  heroVideoSrc: string | null;
  heroVideoPoster: string | null;
  heroHeadline: string;
  heroSubhead: string;
}

export interface SiteContent {
  settings: SiteSettings;
  projects: Project[];
  playedAt: PlayedAt[];
}
