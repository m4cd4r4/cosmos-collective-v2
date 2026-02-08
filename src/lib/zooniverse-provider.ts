/**
 * Zooniverse OAuth Provider for NextAuth.js
 * Implements OAuth 2.0 flow for Zooniverse Panoptes API
 *
 * Docs: https://github.com/zooniverse/panoptes/blob/master/docs/source/includes/_authentication.md
 */

import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers/oauth'

export interface ZooniverseProfile {
  id: string
  login: string
  display_name: string
  email: string
  created_at: string
  updated_at: string
  credited_name: string | null
  avatar_src: string | null
  classifications_count: number
  project_contributions: Array<{
    project_id: string
    activity_count: number
  }>
}

export default function ZooniverseProvider<P extends ZooniverseProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: 'zooniverse',
    name: 'Zooniverse',
    type: 'oauth',

    // Zooniverse OAuth endpoints
    authorization: {
      url: 'https://www.zooniverse.org/oauth/authorize',
      params: {
        scope: 'public classification user', // Requested scopes
        response_type: 'code',
      },
    },
    token: 'https://www.zooniverse.org/oauth/token',
    userinfo: 'https://www.zooniverse.org/api/me',

    clientId: options.clientId,
    clientSecret: options.clientSecret,

    profile(profile) {
      return {
        id: profile.id,
        name: profile.display_name || profile.login,
        email: profile.email,
        image: profile.avatar_src,
        // Additional Zooniverse-specific data
        zooniverseId: profile.id,
        zooniverseUsername: profile.login,
        classificationsCount: profile.classifications_count,
      }
    },

    style: {
      logo: '/zooniverse-logo.svg',
      logoDark: '/zooniverse-logo.svg',
      bg: '#00979D', // Zooniverse brand teal
      text: '#fff',
      bgDark: '#00979D',
      textDark: '#fff',
    },

    options,
  }
}
