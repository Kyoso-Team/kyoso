import * as v from 'valibot';

const CreateCountry = v.object({
  code: v.pipe(v.string(), v.length(2), v.toUpperCase()),
  name: v.pipe(v.string(), v.maxLength(35))
});

export const CountryValidation = {
  CreateCountry
};
