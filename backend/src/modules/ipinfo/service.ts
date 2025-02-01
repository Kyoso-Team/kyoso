import { env } from '$src/utils/env';
import { Service } from '$src/utils/service';
import { IpInfoValidation } from './validation';

class IpInfoService extends Service {
  public async getIpMetadata(ip: string) {
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
