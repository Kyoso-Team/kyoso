import * as v from 'valibot';
import type { MapInput, MapOutput } from '$src/types';

export abstract class IpInfoValidation {
  public static IpMetadataResponse = v.partial(
    v.object({
      city: v.string(),
      region: v.string(),
      country: v.string()
    })
  );
}

export type IpInfoValidationOutput = MapOutput<typeof IpInfoValidation>;
export type IpInfoValidationInput = MapInput<typeof IpInfoValidation>;
