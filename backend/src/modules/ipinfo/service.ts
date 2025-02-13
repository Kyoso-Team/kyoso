import { env } from '$src/utils/env';
import { Service } from '$src/utils/service';
import { IpInfoValidation } from './validation';
import type { IpInfoValidationOutput } from './validation';

class IpInfoService extends Service {
  public async getIpMetadata(ip: string): Promise<IpInfoValidationOutput['IpMetadataResponse']> {
    if (env.NODE_ENV !== 'production') {
      return {
        city: 'city',
        country: 'country',
        region: 'region'
      };
    }

    return this.fetch(
      `https://ipinfo.io/${ip}?token=${env.IPINFO_ACCESS_TOKEN}`,
      'GET',
      'Failed to get info about IP',
      IpInfoValidation.IpMetadataResponse,
      'ipMetadata'
    );
  }
}

export const ipInfoService = new IpInfoService();
