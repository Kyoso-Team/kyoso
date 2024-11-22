import { countryRepository } from './repository';
import { CountryValidation } from './validation';
import { createServiceFnFromRepositoryQuery } from '$src/utils/factories';

export const createCountry = createServiceFnFromRepositoryQuery(
  CountryValidation.CreateCountry,
  countryRepository.createCountry,
  'country',
  'Failed to create country'
);

export const countryService = { createCountry };
