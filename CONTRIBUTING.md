# Contribution Guide

Interesting in helping out in the development of Kyoso? Read this guide before doing anything, as it is very important.

## Tech Stack

If you're interested in making a signficant contribution, it's recommended that you know some of these techonologies.

**General Tools**

- [pnpm](https://pnpm.io): Package manager
- [SvelteKit](https://kit.svelte.dev): Full-stack framework
- [Valibot](https://valibot.dev): Validation library

**Frontend**

- [Taiwind](https://tailwindcss.com): Styling
- [Skeleton](https://www.skeleton.dev): UI library

**Backend**

- [Drizzle](https://orm.drizzle.team): ORM for the database
- [PostgreSQL](https://www.postgresql.org): The database itself
- [tRPC](https://trpc.io): Backend / API (in most cases)

**Hosting**

- [Bunny](https://bunny.net): File storage
- [Upstash](https://upstash.com): Redis instance (for rate limiting)
- [Vercel](https://vercel.com): CI/CD and website deployments
- [Neon](https://neon.tech): Database deployments

**Other**

- [osu!](https://osu.ppy.sh/home) & [Discord](https://discord.com): OAuth providers.
- [IPInfo](https://ipinfo.io): Get data from IP addresses.

## Scripts

Scripts present in the package.json file. Each script must be prepended with `pnpm` or `npm run`.

**Basic**

- `dev`: Starts the development server.
- `build`: Builds the website.
- `preview`: Starts a server running the output of the `build` script.
- `check:watch` & `check`: Updates SvelteKit's type definitions and verifies if the app can be compiled. With or without watch mode respectively.

**Code Quality**

- `lint`: Lints the code.
- `fmt`: Fromats the code.
- `review`: Runs `format`, `lint` and `check`, one after the other.

**Database**

- `db:generate`: Generate a new migration file. Must be used after you're done making changes to the Drizzle schema.
- `db:generate-custom`: Generate a new blank migration file to write your own migration logic.
- `db:migrate`: Apply generated migrations.
- `db:reset`: Resets the database schema (deletes all rows, drops all tables, views, functions, triggers, etc.)
- `db:seed`: Seeds the database, for which it resets the database and reapplies migrations before doing so. **Currently broken, do not use**.
- `db:studio`: Opens Drizzle Kit Studio, a UI to explore your database.

## Development Environment Setup

### Requisites

- Node.js v18 or greater installed.
- PNPM latest version installed.
- Postgres v14 or greater. You can have it hosted on Neon or installed locally.
- An osu! account with an OAuth app.
- A Discord account with an OAuth app.
- Any storage zone hosted on Bunny. **IMPORTANT:** Do not delete your zone once created. If you've just signed up to Bunny, you have a 14 day trial and when that trial expires, you're still able to read and write to your existing zones but you can no longer create new one's.
- A Redis database on Upstash.
- An IPInfo account.

### Setup

```bash
# Clone the repository
git clone https://github.com/Kyoso-Team/kyoso.git
# Change directory
cd kyoso
# Install dependencies
pnpm install
# Set your environment variables before proceeding
# Optionally, seed the database
pnpm db:seed
# Run dev server
pnpm dev
```

### Environemt Variables

**General**

| Name                 | Type                                       | optional | Description                                                                         |
| -------------------- | ------------------------------------------ | -------- | ----------------------------------------------------------------------------------- |
| NODE_ENV             | 'production' \| 'development'              |          | Specify the environment to the Vite compiler.                                       |
| ENV                  | 'production' \| 'testing' \| 'development' |          | Specify the environment to Kyoso.                                                   |
| DATABASE_URL         | string                                     |          | URL of the Postgres database you wish to use for development.                       |
| JWT_SECRET           | string                                     |          | Random string as a secret key used to sign JWT tokens.                              |
| OWNER                | number                                     |          | osu! user ID of the user who is the owner of the website. Your ID, for development. |
| TESTERS              | number[]                                   | ✓        | osu! user IDs of the users who are able to provide feedback and test the site       |
| PUBLIC_CONTACT_EMAIL | string                                     | ✓        | An email address that users can contact for any inquires.                           |

**osu! OAuth**

Log into your osu! account and [create an OAuth application](https://osu.ppy.sh/home/account/edit). The application callback URL must match `PUBLIC_OSU_REDIRECT_URI` and should point to `/api/auth/callback/osu`.

| Name                    | Type   | optional |
| ----------------------- | ------ | -------- |
| PUBLIC_OSU_CLIENT_ID    | number |          |
| OSU_CLIENT_SECRET       | string |          |
| PUBLIC_OSU_REDIRECT_URI | string |          |

**Discord OAuth**

Log into your Discord account in a browser and [create an OAuth application](https://discord.com/developers/applications). Under the `OAuth2` menu in the UI, you'll find the first four variables. This app must have two redirect URIs: the first one must match `PUBLIC_DISCORD_MAIN_REDIRECT_URI` and should point to `/api/auth/callback/discord`; the second one must match `PUBLIC_DISCORD_CHANGE_ACCOUNT_REDIRECT_URI` and should point to `/api/auth/callback/discord/change`. For the bot token, go under the `Bot` menu, create a bot for the OAuth app and copy its token (no bot permissions need to be specified).

| Name                                       | Type   | optional |
| ------------------------------------------ | ------ | -------- |
| PUBLIC_DISCORD_CLIENT_ID                   | string |          |
| DISCORD_CLIENT_SECRET                      | string |          |
| PUBLIC_DISCORD_MAIN_REDIRECT_URI           | string |          |
| PUBLIC_DISCORD_CHANGE_ACCOUNT_REDIRECT_URI | string |          |
| DISCORD_BOT_TOKEN                          | string |          |

**Bunny Storage**

Log into your Bunny account and [create a storage zone](https://dash.bunny.net/storage). Once the storage zone is selected, head to `FTP & API Access` and there you'll find everything you need.

| Name           | Type   | optional |
| -------------- | ------ | -------- |
| BUNNY_HOSTNAME | string |          |
| BUNNY_USERNAME | string |          |
| BUNNY_PASSWORD | string |          |

**IPInfo**

Log into your IPInfo account and go to your [dashboard](https://ipinfo.io/account/home), scroll down and copy the access token.

| Name                    | Type   | optional |
| ----------------------- | ------ | -------- |
| IPINFO_API_ACCESS_TOKEN | string |          |

**Upstash**

Log into your Upstash account and [create a Redis database](https://console.upstash.com). In the dashboard for the Redis DB, The rest URL is what's under "Endpoint" and the rest token is what's under "Password".

| Name                     | Type   | optional |
| ------------------------ | ------ | -------- |
| UPSTASH_REDIS_REST_URL   | string |          |
| UPSTASH_REDIS_REST_TOKEN | string |          |

## Code Quality

### Component Structure

Structure to follow when writing Svelte components.

```svelte
<script lang="ts">
  // Default imports
  // Destructured imports
  // Type imports

  // Type definitions

  // Props
  // Variables
  // Constants

  // Lifecycle events (onMount & onDestroy)

  // Functions

  // Reactive statements
</script>

<!-- Page content -->
```

**Example:**

```svelte
<script lang="ts">
  // Default imports
  import env from '$lib/env';
  // Destructured imports
  import { onMount } from 'svelte';
  // Type imports
  import type { PageServerData } from './$types';

  // Type definitions
  interface Example {
    // ...
  }

  // Props
  export let page: PageServerData;
  // Variables
  let object: Example = {
    // ...
  };
  // Constants
  const someConstant = 21;

  // Lifecycle events
  onMount(() => {
    // ...
  });

  // Functions
  function onClick() {
    // ...
  }

  // Reactive statements
  $: {
    // ...
  }
</script>

<main>Page content</main>
```

### Database Queries

Drizzle ORM has two APIs for querying data: core and RQB. When developing for this project, we only use the core API to avoid having confusion as to when to use which. The RQB is also a high-level abstraction, so it can have its limitations, bugs and performance issues compared to core.

## Pull Request Requirements

Make sure you do follow these guidelines when submitting a pull request:

- Run `pnpm review` to first format, then lint the project.
- Any pull request must point to the `dev` branch.

## Development Shortcuts

If `ENV` is set to `development` then the user will be able to execute keyboard shortcuts made specifically for use in a development environement, and are not accessible in test or production builds.

The shortcuts are the following:

- Shift+Ctrl+1: Opens a modal that allows the user to impersonate another. This is useful to test functionality that requires actions from two or more users, in that case, you can perform actions as different users (hence "impersonating").
- Shift+Ctrl+2: Toggles the theme (between light and dark).
