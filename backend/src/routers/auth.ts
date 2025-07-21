import { vValidator } from '@hono/valibot-validator';
import { generateState } from 'arctic';
import { t } from 'elysia';
import { existsSync, unlinkSync } from 'fs';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as v from 'valibot';
import { servicesMiddleware } from '$src/middlewares/services';
import { sessionMiddleware } from '$src/middlewares/session';
import { AuthenticationService } from '$src/modules/authentication/authentication.service';
import { CookieService } from '$src/modules/cookie/service';
import { osuRepository } from '$src/modules/osu/osu.repository';
import { OsuService } from '$src/modules/osu/osu.service';
import { osuBadgeService } from '$src/modules/osu-badge/service';
import { UserService } from '$src/modules/user/user.service';
import { db, redis } from '$src/singletons';
import {
	changeAccountDiscordOAuth,
	mainDiscordOAuth,
	osuOAuth
} from '$src/singletons/oauth';
import { time } from '$src/utils';
import { env } from '$src/utils/env';
import { unknownError } from '$src/utils/error';
import * as s from '$src/utils/validation';
import { elysia } from './base';

const sessionPath = `${process.cwd()}/test-tokens/session.txt`;

// Testing, to be removed
const userService = new UserService('request', 'adasd');
const osuService = new OsuService('request', 'adasd');
const authService = new AuthenticationService('request', 'adasd');

export const newAuthRouter = elysia({ prefix: '/auth' })

	.get('/login', ({ cookie, redirect }) => {
		const state = generateState();
		const url = osuOAuth.createAuthorizationURL(state, ['identify', 'public']);

		cookie.osu_oauth_state.value = state;
		cookie.osu_oauth_state.maxAge = time.minutes(10);
		cookie.osu_oauth_state.httpOnly = true;
		cookie.osu_oauth_state.sameSite = 'lax';
		cookie.osu_oauth_state.path = '/';

		return redirect(url.toString(), 302);
	})
	.group(
		'/callback',
		{
			query: t.Object({
				code: t.String(),
				state: t.String()
			}),
			cookie: t.Cookie({
				osu_oauth_state: t.String(),
				discord_oauth_state: t.String()
			})
		},
		(app) =>
			app
				.derive(({ server, request }) => ({
					remoteAddress:
						env.NODE_ENV === 'test'
							? '127.0.0.1'
							: server!.requestIP(request)!.address
				}))
				.get(
					'/osu',
					async ({ query, cookie, status, redirect, remoteAddress }) => {
						const { code, state } = query;

						const storedState = cookie.osu_oauth_state;
						if (!storedState) {
							throw status(400, {
								message: 'State cookie is undefined'
							});
						}
						if (state !== storedState.value) {
							throw status(400, {
								message: "States don't match"
							});
						}

						const tokens = await osuService.getTokens(code);
						const accessToken = tokens.accessToken();
						const osuUserId =
							osuService.getOsuUserIdFromAccessToken(accessToken);
						const osuUser = await userService.getOsuUser(osuUserId);

						if (osuUser) {
							const banned = await userService.isUserBanned(db, osuUser.userId);

							if (banned) {
								throw status(403, {
									message: 'You are banned from using this service'
								});
							}

							await authService.createSession(
								db,
								osuUser.userId,
								remoteAddress
							);

							const badges = await osuService
								.getOsuSelf(accessToken)
								.then((user) => user.badges.map(authService.transformBadge));

							await osuBadgeService.handleOsuUserAwardedBadges(
								db,
								badges,
								osuUserId
							);

							return redirect(`${env.FRONTEND_URL}/`, 302);
						}

						const newState = generateState();
						osuRepository.kv.setTempOsuTokens(
							authService.transformArcticToken(tokens),
							newState
						);

						const url = mainDiscordOAuth.createAuthorizationURL(newState, [
							'identify'
						]);

						cookie.discord_oauth_state.value = state;
						cookie.discord_oauth_state.maxAge = time.minutes(10);
						cookie.discord_oauth_state.httpOnly = true;
						cookie.discord_oauth_state.sameSite = 'lax';
						cookie.discord_oauth_state.path = '/';

						return redirect(`${url}&prompt=consent`, 302);
					}
				)
				.get(
					'/discord',
					async ({ query, cookie, status, redirect, remoteAddress }) => {
						const { code, state } = query;
						const storedState = cookie.discord_oauth_state;
						if (!storedState) {
							throw status(400, {
								message: 'State cookie is undefined'
							});
						}
						if (state !== storedState.value) {
							throw status(400, {
								message: "States don't match"
							});
						}

						const osuTokens = await osuService.getTempOsuTokens(state);

						if (osuTokens === null) {
							throw status(400, {
								message: 'Log into osu! first'
							});
						}

						const unparsedDiscordTokens = await mainDiscordOAuth
							.validateAuthorizationCode(code)
							.catch(
								unknownError('Failed to validate Discord authorization code')
							);

						await osuService.deleteTempOsuTokens(state);
						const discordTokens = authService.transformArcticToken(
							unparsedDiscordTokens
						);

						// Necessary for test environment
						if (env.NODE_ENV === 'test') {
							await Bun.write(
								`${process.cwd()}/test-tokens/discord.json`,
								JSON.stringify(discordTokens)
							);
							await Bun.write(
								`${process.cwd()}/test-tokens/osu.json`,
								JSON.stringify(osuTokens)
							);
						}

						const user = await authService.registerUser(
							osuTokens,
							discordTokens
						);

						await authService.createSession(db, user.id, remoteAddress);

						return redirect(`${env.FRONTEND_URL}/`, 302);
					}
				)
	);

const authRouter = new Hono()
	.basePath('/auth')
	.use(
		servicesMiddleware({
			cookieService: CookieService
		})
	)
	.get(
		'/login',
		vValidator(
			'query',
			v.object({
				redirect_path: v.optional(s.nonEmptyString())
			})
		),
		async (c) => {
			const { redirect_path } = c.req.valid('query');
			if (redirect_path) {
				c.var.cookieService.setRedirectPath(c, redirect_path);
			}

			return await authService.redirectToOsuLogin(c);
		}
	)
	.get(
		'/callback/osu',
		vValidator(
			'query',
			v.object({
				code: s.nonEmptyString(),
				state: s.nonEmptyString()
			})
		),
		async (c) => {
			const { code, state } = c.req.valid('query');
			const storedState = c.var.cookieService.getOAuthState(c, 'osu');
			if (!storedState) {
				throw new HTTPException(400, {
					message: 'State cookie is undefined'
				});
			}
			if (state !== storedState) {
				throw new HTTPException(400, {
					message: "States don't match"
				});
			}

			const tokens = await osuService.getTokens(code);
			const accessToken = tokens.accessToken();
			const osuUserId = osuService.getOsuUserIdFromAccessToken(accessToken);
			const osuUser = await userService.getOsuUser(osuUserId);

			if (osuUser) {
				const banned = await userService.isUserBanned(db, osuUser.userId);
				if (banned) {
					throw new HTTPException(403, {
						message: 'You are banned from using this service'
					});
				}

				const ip =
					env.NODE_ENV === 'test'
						? '127.0.0.1'
						: (getConnInfo(c).remote.address ?? '127.0.0.1');

				await authService.createSession(db, osuUser.userId);

				const badges = await osuService
					.getOsuSelf(accessToken)
					.then((user) => user.badges.map(authService.transformBadge));

				await osuBadgeService.handleOsuUserAwardedBadges(db, badges, osuUserId);

				const redirectPath = cookieService.getRedirectPath(c);
				cookieService.deleteRedirectPath(c);
				return c.redirect(`${env.FRONTEND_URL}${redirectPath ?? '/'}`, 302);
			}

			const newState = generateState();
			osuRepository.kv.setTempOsuTokens(
				authenticationService.transformArcticToken(tokens),
				newState
			);

			return await authenticationService.redirectToDiscordLogin(c, newState);
		}
	)
	.get(
		'/callback/discord',
		vValidator(
			'query',
			v.object({
				code: s.nonEmptyString(),
				state: s.nonEmptyString()
			})
		),
		async (c) => {
			const { code, state } = c.req.valid('query');
			const storedState = cookieService.getOAuthState(c, 'discord');
			if (!storedState) {
				throw new HTTPException(400, {
					message: 'State cookie is undefined'
				});
			}
			if (state !== storedState) {
				throw new HTTPException(400, {
					message: "States don't match"
				});
			}

			const unparsedDiscordTokens = await mainDiscordOAuth
				.validateAuthorizationCode(code)
				.catch(unknownError('Failed to validate Discord authorization code'));
			const osuTokens = await osuService.getTempOsuTokens(redis, state);

			if (osuTokens === null) {
				throw new HTTPException(400, {
					message: 'Log into osu! first'
				});
			}

			await osuService.deleteTempOsuTokens(redis, state);
			const discordTokens = authenticationService.transformArcticToken(
				unparsedDiscordTokens
			);

			// Necessary for test environment
			if (env.NODE_ENV !== 'production') {
				await Bun.write(
					`${process.cwd()}/test-tokens/discord.json`,
					JSON.stringify(discordTokens)
				);
				await Bun.write(
					`${process.cwd()}/test-tokens/osu.json`,
					JSON.stringify(osuTokens)
				);
			}

			const user = await authenticationService.registerUser(
				osuTokens,
				discordTokens
			);

			await authenticationService.createSession(c, db, user.id);

			const redirectPath = cookieService.getRedirectPath(c);
			cookieService.deleteRedirectPath(c);
			return c.redirect(`${env.FRONTEND_URL}${redirectPath ?? '/'}`, 302);
		}
	)
	.get(
		'/callback/discord/change',
		sessionMiddleware(),
		vValidator(
			'query',
			v.object({
				code: s.nonEmptyString(),
				state: s.nonEmptyString(),
				redirect_path: v.optional(s.nonEmptyString())
			})
		),
		async (c) => {
			const { discord } = c.get('user');

			const { code, redirect_path } = c.req.valid('query');

			const discordTokens = await changeAccountDiscordOAuth
				.validateAuthorizationCode(code)
				.catch(unknownError('Failed to validate Discord authorization code'));

			const transformedDiscordToken =
				authenticationService.transformArcticToken(discordTokens);

			const discordUser = await discordService.getDiscordSelf(
				transformedDiscordToken.accessToken
			);
			await userService.updateDiscordUser(
				db,
				{
					username: discordUser.username,
					token: transformedDiscordToken
				},
				discord.discordUserId
			);
			return c.redirect(`${env.FRONTEND_URL}${redirect_path ?? '/'}`, 302);
		}
	)
	.patch('/refresh-tokens', sessionMiddleware(), async (c) => {
		const { osu, discord } = c.get('user');

		await authenticationService.refreshTokens({
			osu,
			discord
		});

		return c.json({
			success: true
		});
	})
	.get(
		'/logout',
		vValidator(
			'query',
			v.object({
				redirect_path: v.optional(s.nonEmptyString())
			})
		),
		async (c) => {
			const { redirect_path } = c.req.valid('query');
			await authenticationService.deleteSession(c, db);
			return c.redirect(`${env.FRONTEND_URL}${redirect_path ?? '/'}`, 302);
		}
	)
	.get('/session', async (c) => {
		const session = await authenticationService.validateSession(c, db, {
			user: {
				id: true,
				osu: {
					osuUserId: true,
					username: true
				},
				discord: {
					discordUserId: true,
					username: true
				}
			}
		});

		return c.json(
			session
				? {
						id: session.id,
						user: session.user,
						osu: session.osu,
						discord: {
							id: session.discord.discordUserId.toString(),
							username: session.discord.username
						}
					}
				: null
		);
	})
	.post(
		'/login/test',
		vValidator('json', v.object({ userId: v.number() })),
		async (c) => {
			if (env.NODE_ENV === 'production') {
				throw new HTTPException(403, {
					message: 'Not allowed in production'
				});
			}

			const sessionExists = existsSync(sessionPath);
			if (sessionExists) {
				await authenticationService.deleteSession(c, db);
			}

			const body = c.req.valid('json');
			const sessionToken = await authenticationService.createSession(
				c,
				db,
				body.userId
			);
			await Bun.write(sessionPath, sessionToken);
			return c.json(null);
		}
	)
	.post('/logout/test', async (c) => {
		if (env.NODE_ENV === 'production') {
			throw new HTTPException(403, {
				message: 'Not allowed in production'
			});
		}

		await authenticationService.deleteSession(c, db);
		unlinkSync(sessionPath);
		return c.json(null);
	});

export { authRouter };
