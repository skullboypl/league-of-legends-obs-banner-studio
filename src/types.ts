export type BannerStyle =
  | "crest"
  | "lane"
  | "compact"
  | "card"
  | "split"
  | "minimal"
  | "tower"
  | "scoreboard";

export type RankedEntry = {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
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
};
