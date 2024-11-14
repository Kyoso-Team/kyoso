import * as v from 'valibot';

const CreateCountry = v.object({
  code: v.pipe(v.string(), v.length(2)),
  name: v.pipe(v.string(), v.maxLength(35))
});

export type CountryValidationOutput = {
  CreateCountry: v.InferOutput<typeof CreateCountry>;
}

export const CountryValidation = {
  CreateCountry
};
