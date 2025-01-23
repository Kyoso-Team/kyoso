import { meilisearch } from '$src/singletons/meilisearch.ts';
import type { MeilisearchTournamentIndex, MeilisearchUserIndex } from '$src/types';

async function setupUsersIndex() {
  await meilisearch
    .getIndex('users')
    .then(() => {
      console.log("Index 'users' is already present, skipping setup...");
    })
    .catch(async () => {
      await meilisearch.createIndex('users', {
        primaryKey: 'osuUserId'
      });

      const userIndex = meilisearch.index<MeilisearchUserIndex>('users');

      await userIndex.addDocuments([
        {
          osuUserId: 7979597,
          username: 'Ryan Rofling',
          discordUserId: '195523166150459392',
          banned: false
        },
        {
          osuUserId: 14544646,
          username: 'Mario564',
          discordUserId: '377246696469561367',
          banned: false
        },
        {
          osuUserId: 8191845,
          username: 'Stage',
          discordUserId: '146092837723832320',
          banned: false
        }
      ]);

      await userIndex.updateSettings({
        searchableAttributes: ['osuUserId', 'discordUserId', 'username'],
        sortableAttributes: ['username'],
        filterableAttributes: ['banned']
      });

      console.log("Setup for index 'users' finished!");
    });
}

async function setupTournamentsIndex() {
  await meilisearch
    .getIndex('tournaments')
    .then(() => {
      console.log("Index 'tournaments' is already present, skipping setup...");
    })
    .catch(async () => {
      await meilisearch.createIndex('tournaments', {
        primaryKey: 'id'
      });

      const tournamentIndex = meilisearch.index<MeilisearchTournamentIndex>('tournaments');

      await tournamentIndex.addDocuments([
        {
          id: 1,
          name: 'osu! World Cup 2023',
          acronym: 'OWC2023',
          urlSlug: 'owc2023',
          publishedAt: new Date('2023-12-23T19:15:16.867Z'),
          deletedAt: null
        },
        {
          id: 2,
          name: '3 Digit World Cup 2024',
          acronym: '3WC2024',
          urlSlug: '3wc2024',
          publishedAt: new Date('2024-09-23T19:15:16.867Z'),
          deletedAt: new Date('2024-12-23T19:15:16.867Z')
        },
        {
          id: 3,
          name: 'osu! World Cup 2024',
          acronym: 'OWC2024',
          urlSlug: 'owc2024',
          publishedAt: new Date('2024-12-23T19:15:16.867Z'),
          deletedAt: null
        }
      ]);

      await tournamentIndex.updateSettings({
        searchableAttributes: ['id', 'name', 'acronym', 'urlSlug'],
        sortableAttributes: ['name'],
        filterableAttributes: ['publishedAt', 'deletedAt']
      });

      console.log("Setup for index 'tournaments' finished!");
    });
}

await setupUsersIndex();
await setupTournamentsIndex();
