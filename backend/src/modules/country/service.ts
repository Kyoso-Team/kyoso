import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';
import { countryRepository } from './repository';
import { CountryValidation } from './validation';

export const createCountry = createServiceFnFromRepositoryQueryAndValidation(
  CountryValidation.CreateCountry,
  countryRepository.createCountry,
  'country',
  'Failed to create country'
);

export const countryService = { createCountry };
