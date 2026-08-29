import type { SiteContent } from "@/lib/types";

/**
 * Built-in content. The site renders from this until a database is connected;
 * `prisma/seed.ts` loads the same data into Postgres for the admin to edit.
 *
 * RULES (from the brief):
 *  - Copy for MARQUES / PIMBA / FUNKISS / GANGBANGERS is verbatim and must not be altered.
 *  - ZARA G has no content yet — structure only, `comingSoon: true`.
 *  - No invented social URLs. `socials: []` until the real links are provided.
 *  - `heroImage` / photo `image` / `logoImage` = null until the real Dropbox assets are placed.
 */
export const seedContent: SiteContent = {
  settings: {
    siteName: null, // agency name not decided yet
    ogImage: null,
    contactPhone: "918 602 908",
    contactName: "Pedro Jarrais",
    contactEmail: null,
    bandsintownArtist: null,
    heroVideoProvider: "mp4",
    heroVideoSrc: "/media/hero.mp4",
    heroVideoPoster: "/media/hero-poster.webp",
    heroHeadline: "CINCO PROJETOS. UMA FESTA DO INÍCIO AO FIM.",
    heroSubhead:
      "Animação e espetáculo para festivais, municípios, marcas, clubes e eventos privados.",
  },
  playedAt: [
    // Populated via /admin. Examples referenced in the brief copy:
    // Rock in Rio, RFM Somnii, Viagens de Finalistas, municípios de Portugal.
  ],
  projects: [
    {
      slug: "marques",
      name: "MARQUES",
      order: 1,
      enabled: true,
      comingSoon: false,
      tagline: "ENERGIA, INTERAÇÃO E FESTA DO INÍCIO AO FIM",
      description: `MARQUES É ENERGIA, INTERAÇÃO E FESTA DO INÍCIO AO FIM.

Com um estilo OPEN FORMAT, Marques adapta cada set ao público, misturando os grandes hits nacionais e internacionais, dos clássicos de sempre aos temas que marcam a atualidade, numa viagem musical capaz de envolver diferentes públicos e gerações.

Os seus sets destacam-se pelos mashups e versões diferenciadoras, introduções personalizadas e momentos interativos, dando uma identidade própria a cada atuação.

Ao longo do seu percurso, já marcou presença em eventos a convite de grandes nomes e organizações, como o ROCK IN RIO, RFM SOMNII, VIAGENS DE FINALISTAS, bem como em eventos promovidos por vários municípios de norte a sul de Portugal continental e ilhas.

Com uma identidade própria e uma presença cada vez mais consolidada no panorama nacional, DJ Marques apresenta um espetáculo DINÂMICO, VERSÁTIL E PENSADO PARA TRANSFORMAR CADA EVENTO NUMA VERDADEIRA FESTA.`,
      heroImage: "/media/marques/hero.webp",
      heroAlt: "Retrato de DJ Marques",
      logoImage: "/media/marques/logo.webp",
      heroCutout: null,
      heroCutoutSide: "left",
      promoVideo: {
        provider: "mp4",
        src: "/media/marques/promo.mp4",
        poster: "/media/marques/promo-poster.webp",
      },
      theme: {
        bg: "#22cfe4",
        primary: "#0b0b0b",
        secondary: "#0b3a42",
        text: "#06131a",
        accent: "#0b0b0b",
      },
      socials: [], // real Instagram URL pending
      photos: [
        { image: "/media/marques/g1.webp", alt: "DJ Marques — sessão de estúdio" },
        { image: "/media/marques/g2.webp", alt: "DJ Marques — retrato" },
        { image: "/media/marques/g3.webp", alt: "DJ Marques" },
        { image: "/media/marques/g4.webp", alt: "DJ Marques nos bastidores" },
        { image: "/media/marques/g5.webp", alt: "Marques e Maycon" },
        { image: "/media/marques/g6.webp", alt: "Marques e Maycon" },
      ],
      videos: [
        {
          provider: "mp4",
          src: "/media/marques/v1.mp4",
          poster: "/media/marques/v1-poster.webp",
          title: "Marques — Festa de Peniche",
        },
      ],
    },
    {
      slug: "pimba-a-bruta",
      name: "PIMBA À BRUTA",
      order: 2,
      enabled: true,
      comingSoon: false,
      tagline: "O MELHOR DA MÚSICA E DA FESTA PORTUGUESA",
      description: `PIMBA À BRUTA — O MELHOR DA MÚSICA E DA FESTA PORTUGUESA! 🇵🇹

O Pimba à Bruta é um projeto de animação de música portuguesa que junta o melhor da nossa cultura popular à energia, interação e diversão de um espetáculo moderno.

Composto por DJ, MC e bailarinas, apresenta um repertório recheado de grandes êxitos da música portuguesa, dos clássicos que atravessam gerações aos temas da atualidade.

É um projeto que une idades e gerações, onde há espaço para tudo: desde o típico bailarico português às coreografias do momento, sempre com muita animação.

Ao longo das 2 horas de espetáculo, não faltam dinâmicas como o Jogo da Baliza, distribuição de sticks insufláveis, apitos e brindes, balões, além dos nossos insufláveis gigantes, com destaque para o irreverente garrafão "PINGA À BRUTA", uma das imagens de marca do projeto.

Com uma forte identidade visual, decoração e elementos próprios de palco, o Pimba à Bruta transforma cada atuação num verdadeiro arraial, pensado para CANTAR, DANÇAR, RIR E FAZER FESTA DO INÍCIO AO FIM.

NO PIMBA À BRUTA, A VERGONHA E A INDIFERENÇA FICAM À ENTRADA. CÁ DENTRO, É FESTA À BRUTA! 🇵🇹🍻`,
      heroImage: "/media/pimba/hero.webp",
      heroAlt: "Multidão num arraial do Pimba à Bruta",
      logoImage: "/media/pimba/logo.webp",
      heroCutout: null,
      heroCutoutSide: "left",
      promoVideo: {
        provider: "mp4",
        src: "/media/pimba/promo.mp4",
        poster: "/media/pimba/promo-poster.webp",
      },
      theme: {
        bg: "#0e7a3f",
        bgSplit: "#e2241a",
        primary: "#ffe14d",
        secondary: "#0b5c30",
        text: "#ffffff",
        accent: "#ffe14d",
      },
      socials: [], // Instagram + TikTok URLs pending
      photos: [
        { image: "/media/pimba/g1.webp", alt: "Pimba à Bruta — bastidores" },
        { image: "/media/pimba/g2.webp", alt: "Pimba à Bruta ao vivo" },
        { image: "/media/pimba/g3.webp", alt: "Pimba à Bruta — arraial" },
        { image: "/media/pimba/g4.webp", alt: "Pimba à Bruta — atuação" },
        { image: "/media/pimba/g5.webp", alt: "Público no Pimba à Bruta" },
        { image: "/media/pimba/g6.webp", alt: "Pimba à Bruta ao vivo" },
      ],
      videos: [
        {
          provider: "mp4",
          src: "/media/pimba/v1.mp4",
          poster: "/media/pimba/v1-poster.webp",
          title: "Pimba à Bruta — Aftermovie",
        },
      ],
    },
    {
      slug: "funkiss",
      name: "FUNKISS",
      order: 3,
      enabled: true,
      comingSoon: false,
      tagline: "O CALOR DO BRASIL NUMA SÓ FESTA",
      description: `FUNKISS — O CALOR DO BRASIL NUMA SÓ FESTA! 🇧🇷💋

FUNKISS é um projeto de animação que junta a energia do Funk, os maiores hits da música Brasileira e os hinos incontornáveis da White Girl Music, num espetáculo onde é impossível ficar parado.

Dos grandes hits do Funk Brasileiro aos temas comerciais que todos sabem cantar, passando pelos clássicos e tendências que dominam o TikTok, cada atuação mistura música, dança e interação com o público. Um projeto pensado especialmente para as novas gerações e para todos os apaixonados pelos ritmos latinos.

A Funkiss ganha ainda mais força com os seus insufláveis em formato de lábios (KISS), gomas gigantes e sticks insufláveis, aliados a jogos, desafios e dinâmicas com o público, tornando cada atuação mais interativa, divertida e imprevisível.

Ao longo do seu percurso, a FUNKISS já marcou presença em vários festivais, eventos promovidos por municípios e comissões de festas, levando a sua energia a palcos de norte a sul de Portugal, incluindo as ilhas. Um percurso que tem permitido ao projeto chegar a diferentes públicos e afirmar a sua identidade em eventos de diferentes dimensões.`,
      heroImage: "/media/funkiss/hero.webp",
      heroAlt: "Atuação da Funkiss com público",
      // NOTE: name is FUNKISS (brief §28). The KISSCAM lockup exists at
      // /media/funkiss/logo-kisscam.webp if a lockup is ever wanted here.
      logoImage: null,
      heroCutout: null,
      heroCutoutSide: "right",
      promoVideo: {
        provider: "mp4",
        src: "/media/funkiss/promo.mp4",
        poster: "/media/funkiss/promo-poster.webp",
      },
      theme: {
        bg: "#ff2e9a",
        primary: "#ffffff",
        secondary: "#5b1170",
        text: "#ffffff",
        accent: "#ffd23f",
      },
      socials: [],
      photos: [
        { image: "/media/funkiss/g1.webp", alt: "Funkiss — sessão de estúdio" },
        { image: "/media/funkiss/g2.webp", alt: "Funkiss — sessão de estúdio" },
        { image: "/media/funkiss/g3.webp", alt: "Funkiss ao vivo" },
        { image: "/media/funkiss/g4.webp", alt: "Funkiss em palco" },
        { image: "/media/funkiss/g5.webp", alt: "Funkiss — atuação" },
        { image: "/media/funkiss/g6.webp", alt: "Funkiss ao vivo com pirotecnia" },
      ],
      videos: [
        {
          provider: "mp4",
          src: "/media/funkiss/v1.mp4",
          poster: "/media/funkiss/v1-poster.webp",
          title: "Funkiss — Aftermovie",
        },
      ],
    },
    {
      slug: "gangbangers",
      name: "GANGBANGERS",
      order: 4,
      enabled: true,
      comingSoon: false,
      tagline: "SE É UM HIT, TOCA",
      description: `GANGBANGERS - SE É UM HIT, TOCA!

A GANGBANGERS é uma festa temática que celebra os maiores clássicos da música Comercial, White Girl Music, Hip-Hop e R&B, dos anos 2000 até à atualidade. Aqui existe apenas uma regra: SE É UM BANGER, TOCA.

É o REMEMBER de uma geração que ainda se sente demasiado jovem para ter um REMEMBER, mas que sabe todos estes hits de cor. 💜😂

Composta por DJ, Host, bailarinas e até Live Performances, a GANGBANGERS é uma experiência pensada especialmente para Millennials e Gen Z, fazendo-nos viajar no tempo e recordar os grandes hits que marcaram a nossa infância e adolescência.

Mais do que uma festa, a GANGBANGERS vive da reação do público: cantar, dançar, saltar e voltar, por alguns minutos, às memórias com que crescemos.

NÃO IMPORTA A ÉPOCA. NÃO IMPORTA O GÉNERO. SE É UM BANGER, É GANGBANGERS. 💜🔥`,
      // hero + gallery are stills pulled from the aftermovie (no press photos
      // were supplied for Gangbangers) — replace when real photos arrive.
      heroImage: "/media/gangbangers/hero.webp",
      heroAlt: "Festa Gangbangers",
      logoImage: "/media/gangbangers/logo.webp",
      heroCutout: null,
      heroCutoutSide: "left",
      promoVideo: {
        provider: "mp4",
        src: "/media/gangbangers/promo.mp4",
        poster: "/media/gangbangers/promo-poster.webp",
      },
      theme: {
        bg: "#1f2f7a",
        primary: "#ff4fbf",
        secondary: "#7c5cff",
        text: "#ffffff",
        accent: "#37c8ff",
      },
      socials: [],
      photos: [
        { image: "/media/gangbangers/g1.webp", alt: "DJ na Gangbangers" },
        { image: "/media/gangbangers/g2.webp", alt: "Bailarina na Gangbangers" },
        { image: "/media/gangbangers/g3.webp", alt: "Performance na Gangbangers" },
        { image: "/media/gangbangers/g4.webp", alt: "Público na Gangbangers" },
        { image: "/media/gangbangers/g5.webp", alt: "Gangbangers ao vivo" },
        { image: "/media/gangbangers/g6.webp", alt: "Multidão na Gangbangers" },
      ],
      videos: [
        {
          provider: "mp4",
          src: "/media/gangbangers/v1.mp4",
          poster: "/media/gangbangers/v1-poster.webp",
          title: "Gangbangers",
        },
      ],
    },
    {
      slug: "zara-g",
      name: "ZARA G",
      order: 5,
      enabled: true,
      comingSoon: true,
      tagline: null,
      description: "",
      heroImage: null,
      heroAlt: "",
      logoImage: null,
      heroCutout: null,
      heroCutoutSide: "left",
      promoVideo: { provider: "mp4", src: null, poster: null },
      theme: {
        bg: "#111111",
        primary: "#ffffff",
        secondary: "#6b6b6b",
        text: "#ffffff",
        accent: "#ffffff",
      },
      socials: [],
      photos: [],
      videos: [],
    },
  ],
};
