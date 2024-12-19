import type { DiscordUser, OsuUser, Session, User } from '$src/schema';
import type { Selection } from '$src/types';

export type SessionSelection = Selection<typeof Session> &
  Partial<{
    user: Selection<typeof User> &
      Partial<{
        osu: Selection<typeof OsuUser>;
        discord: Selection<typeof DiscordUser>;
      }>;
  }>;
