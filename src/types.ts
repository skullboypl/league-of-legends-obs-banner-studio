export type BannerStyle =
  | "crest"
  | "lane"
  | "compact"
  | "card"
  | "split"
  | "minimal"
  | "tower"
  | "scoreboard"
  | "slim"
  | "wide"
  | "info"
  | "stripe"
  | "badge"
  | "ticket"
  | "deck"
  | "orbit"
  | "marquee"
  | "hex"
  | "tabs"
  | "radar"
  | "flip"
  | "ladder";

export type ExtraView = "strip" | "pills" | "rings" | "cycle" | "ticker";

export type AvatarShape = "round" | "square" | "hex";

export type BannerTheme =
  | "classic"
  | "glass"
  | "neon"
  | "circuit"
  | "aurora"
  | "amoled"
  | "avatarbg";

export type RankedEntry = {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak?: boolean;
  miniSeries?: { target: number; wins: number; losses: number; progress: string };
};

export type ChampionMastery = {
  championId: number;
  name: string;
  level: number;
  points: number;
  iconUrl: string;
};

export type PlayerData = {
  riotId: string;
  gameName: string;
  tagLine: string;
  platform: string;
  summonerLevel: number;
  profileIconUrl: string;
  solo: RankedEntry | null;
  flex: RankedEntry | null;
  mastery?: { score: number; top: ChampionMastery[] } | null;
  recent?: { games: boolean[]; kda: number; csPerMin: number } | null;
  moduleErrors?: { mastery?: number; recent?: number };
  updatedAt: string;
};

export type BannerSettings = {
  riotId: string;
  platform: string;
  style: BannerStyle;
  accent: string;
  showIcon: boolean;
  showRecord: boolean;
  showWinrate: boolean;
  queue: "solo" | "flex";
  background: string;
  textColor: string;
  opacity: number;
  radius: number;
  scale: number;
  font: "sans" | "condensed" | "mono";
  showTag: boolean;
  showRegion: boolean;
  showLevel: boolean;
  showRank: boolean;
  showLP: boolean;
  showGames: boolean;
  showProgress: boolean;
  glow: boolean;
  animate: boolean;
  showStreak: boolean;
  showForm: boolean;
  showKda: boolean;
  showCs: boolean;
  showTop: boolean;
  extraView: ExtraView;
  theme: BannerTheme;
  speed: number;
  topCount: number;
  showMastery: boolean;
  showTopline: boolean;
  avatarShape: AvatarShape;
};
