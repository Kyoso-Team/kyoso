import { countryRepository } from './repository';
import { CountryValidation } from './validation';
import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';

export const createCountry = createServiceFnFromRepositoryQueryAndValidation(
  CountryValidation.CreateCountry,
  countryRepository.createCountry,
  'country',
  'Failed to create country'
);

export const countryService = { createCountry };
