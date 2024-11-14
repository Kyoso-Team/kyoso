import { Country } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import type { CountryValidationOutput } from './validation';

async function createCountry(db: DatabaseClient, country: CountryValidationOutput['CreateCountry']) {
  return db
    .insert(Country)
    .values({
      code: country.code.toUpperCase(),
      name: country.name
    })
    .onConflictDoNothing({
      target: Country.code
    });
}

export const countryRepository = { createCountry };
