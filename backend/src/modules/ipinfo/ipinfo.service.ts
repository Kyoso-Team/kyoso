import * as v from 'valibot';
import { env } from '$src/utils/env';
import { Service } from '$src/utils/service';

export class IpInfoService extends Service {
  public async getIpMetadata(ip: string): Promise<{
    city?: string | undefined;
    region?: string | undefined;
    country?: string | undefined;
  }> {
    if (env.NODE_ENV !== 'production') {
      return {
        city: 'city',
        country: 'country',
        region: 'region'
      };
    }

    return this.fetch({
      url: `https://ipinfo.io/${ip}?token=${env.IPINFO_ACCESS_TOKEN}`,
      method: 'GET',
      schema: v.partial(
        v.object({
          city: v.string(),
          region: v.string(),
          country: v.string()
        })
      ),
      error: {
        fetchFailed: 'Failed to get IP metadata',
        unhandledStatus: 'Unhandled status code when getting IP metadata',
        validationFailed: "IP metadata response doesn't match the expected schema",
        parseFailed: 'Failed to parse IP metadata'
      }
    });
  }
}
