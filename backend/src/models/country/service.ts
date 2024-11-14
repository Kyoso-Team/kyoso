import * as v from 'valibot';
import { unknownError, validationError } from '$src/utils/error';
import { countryRepository } from './repository';
import { CountryValidation } from './validation';
import type { DatabaseClient } from '$src/types';
import type { CountryValidationOutput } from './validation';

async function createCountry(
  db: DatabaseClient,
  country: CountryValidationOutput['CreateCountry']
) {
  const errorDescription = 'Failed to create country';
  const parsed = await v.parseAsync(CountryValidation.CreateCountry, country).catch(
    validationError(errorDescription, 'country')
  );
  await countryRepository.createCountry(db, parsed).catch(unknownError(errorDescription));
}

export const countryService = { createCountry };
