export type RosterItem = {
  id: string;
  name: string;
  group: string;
  enabled: boolean;
  photo?: string;
};

export type Settings = {
  min_picks: number;
  max_picks: number;
  auto_refresh_sec: number;
  current_batch: string;
};


