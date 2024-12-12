import * as v from 'valibot';
import { Country } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import type { CountryValidation } from './validation';

async function createCountry(
  db: DatabaseClient,
  country: v.InferOutput<(typeof CountryValidation)['CreateCountry']>
) {
  return db.insert(Country).values(country).onConflictDoNothing({
    target: Country.code
  });
}

export const countryRepository = { createCountry };
