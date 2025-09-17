import { fadeUi } from './fade-ui.svelte';
import type { Snippet } from 'svelte';
import type { EventHandler } from 'svelte/elements';
import type { MaybePromise } from '../types';

type HandleFieldType<T extends Field<any, any> | Record<string, Field<any, any>>> =
  T['$data'] extends boolean
    ? T['$data']
    : T['isOptional'] extends true
      ? T['$data'] | null
      : T['$data'];

export class FormHandler<
  TFields extends Record<string, Field<any, any> | Record<string, Field<any, any>>>
> {
  public $data: {
    [K1 in keyof TFields]: TFields[K1] extends Record<string, Field<any>>
      ?
          {
            [K2 in keyof TFields[K1]]: HandleFieldType<TFields[K1][K2]>;
          }
      : HandleFieldType<TFields[K1]>;
  } = undefined as any;
  public defaultValue?: () => this['$data'];
  public submit: EventHandler<SubmitEvent, HTMLFormElement> = (e) => {
    e.preventDefault();
  };
  public cancel: () => MaybePromise<void> = () => {
    fadeUi.set(false);
  };
  public errors: Record<string, true> = $state({});
  public hasErrors: boolean = $derived(Object.keys(this.errors).length > 0);
  public attemptedToSubmit: boolean = $state(false);

  constructor(
    public title: string,
    public fields: TFields
  ) {
    for (const [k1, field1] of Object.entries(this.fields)) {
      if (field1 instanceof Field) {
        field1.setFormAndKey(this, k1);
      } else {
        for (const [k2, field2] of Object.entries(field1)) {
          field2.setFormAndKey(this, `${k1}.${k2}`);
        }
      }
    }
  }

  public setDefaultValue(fn: () => this['$data']) {
    this.defaultValue = fn;
    this.reset();
    return this;
  }

  public reset() {
    const defaultValue = this.defaultValue ? this.defaultValue() : undefined;

    for (const [k1, field1] of Object.entries(this.fields)) {
      if (field1 instanceof Field) {
        field1.defaultValue = defaultValue?.[k1] ?? null;
        field1.shouldReset = true;
        field1.canDiplayError = false;
      } else {
        for (const [k2, field2] of Object.entries(field1)) {
          field2.defaultValue = defaultValue?.[k1]?.[k2] ?? null;
          field2.shouldReset = true;
          field2.canDiplayError = false;
        }
      }
    }

    this.errors = {};
    this.attemptedToSubmit = false;
  }

  public onSubmit(callback: (value: this['$data']) => MaybePromise<void>) {
    this.submit = async (e) => {
      e.preventDefault();
      const value: Record<string, any> = {};
      let totalFields = 0;
      const fieldsSameAsDefault: string[] = [];

      for (const [k1, field1] of Object.entries(this.fields)) {
        if (field1 instanceof Field) {
          field1.set(field1.value);
          value[k1] = field1.value;
          
          totalFields += 1;
          if (field1.value === field1.defaultValue) {
            fieldsSameAsDefault.push(k1);
          }
        } else {
          if (typeof value[k1] !== 'object') {
            value[k1] = {};
          }

          for (const [k2, field2] of Object.entries(field1)) {
            field2.set(field2.value);
            value[k1][k2] = field2.value;

            totalFields += 1;
            if (field2.value === field2.defaultValue) {
              fieldsSameAsDefault.push(`${k1}.${k2}`);
            }
          }
        }
      }

      for (const field1 of Object.values(this.fields)) {
        if (field1 instanceof Field) {
          field1.displayError();
        } else {
          for (const field2 of Object.values(field1)) {
            field2.displayError();
          }
        }
      }

      if (!this.hasErrors && totalFields > fieldsSameAsDefault.length) {
        await callback(value as this['$data']);
      }

      this.attemptedToSubmit = true;
    };

    return this;
  }

  public onCancel(callback: () => MaybePromise<void>) {
    this.cancel = async () => {
      await callback();
      fadeUi.set(false);
    };
    return this;
  }
}

abstract class Field<TType, TOptional extends boolean = boolean> {
  public $data: TType = undefined as any;
  public value: TType | null = $state(null);
  public defaultValue: TType | null = $state(null);
  public raw: TType | null | undefined = $state();
  public error: string | undefined = $state();
  public canDiplayError: boolean = $state(false);
  public validations: {
    parse: (value: TType) => boolean;
    error: string;
  }[] = [];
  public isDisabled: boolean = $state(false);
  public isOptional: TOptional = $state(false) as any;
  public shouldReset: boolean = $state(false);
  public description?: string | Snippet;
  public preview?: string | Snippet;
  public form?: FormHandler<any> | undefined;
  public key?: string | undefined;

  constructor(
    public legend: string,
    options?: {
      description?: string | Snippet;
      preview?: string | Snippet;
    }
  ) {
    this.description = options?.description;
    this.preview = options?.preview;
  }

  public set(value: TType | null | undefined) {
    if (this.isDisabled) return;
    this.raw = value;

    if (value === undefined || value === '') {
      value = null;
    }

    if (value === null && !this.isOptional) {
      this.error = 'This field is required';
      this.form!.errors[this.key!] = true;
      return;
    }

    this.error = undefined;
    delete this.form!.errors[this.key!];

    if (value !== null) {
      for (const validation of this.validations) {
        if (!validation.parse(value as TType)) {
          this.error = validation.error;
          this.form!.errors[this.key!] = true;
          break;
        }
      }
    }

    this.value = value;
  }

  public disable(state: boolean) {
    if (state) {
      this.isDisabled = true;
      this.raw = null;
      this.value = null;
      this.error = undefined;
      delete this.form!.errors[this.key!];
    } else {
      this.isDisabled = false;
    }
  }

  public displayError() {
    this.canDiplayError = true;
  }

  public setFormAndKey(form: FormHandler<any>, key: string) {
    this.form = form;
    this.key = key;
  }
}

export class TextField<TOptional extends boolean = false> extends Field<string, TOptional> {
  public lte(length: number) {
    this.validations.push({
      parse: (value) => value.length <= length,
      error: `Input must contain ${length} character(s) or less`
    });
    return this;
  }

  public gte(length: number) {
    this.validations.push({
      parse: (value) => value.length >= length,
      error: `Input must contain ${length} character(s) or more`
    });
    return this;
  }

  public regex(regex: RegExp, error: string) {
    this.validations.push({
      parse: (value) => regex.test(value),
      error
    });
    return this;
  }

  public optional(): TextField<true> {
    this.isOptional = true as any;
    return this as any;
  }
}

export class OptionsField<T extends string> extends Field<T, false> {
  public options: Record<T, string>;

  constructor(
    legend: string,
    fieldOptions: Record<T, string>,
    options?: {
      description?: string | Snippet;
      preview?: string | Snippet;
    }
  ) {
    super(legend, options);
    this.options = fieldOptions;
  }

  public optional(): OptionalOptionsField<T> {
    this.isOptional = true as any;
    return this as any;
  }
}

export interface OptionalOptionsField<T extends string>
  extends Omit<OptionsField<T>, 'isOptional'>,
    Field<T, true> {}

export class BooleanField extends Field<boolean, true> {
  constructor(
    legend: string,
    options?: {
      description?: string | Snippet;
      preview?: string | Snippet;
    }
  ) {
    super(legend, options);
    this.isOptional = true as any;
  }

  public disable(state: boolean) {
    super.disable(state);
    if (state) {
      this.raw = false;
      this.value = false;
    }
  }

  public set(value: boolean | null | undefined) {
    if (this.isDisabled) return;
    this.raw = value;

    if (value === undefined || value === null) {
      value = false;
    }

    this.error = undefined;
    this.value = value;
  }
}

export class NumberField<TOptional extends boolean = false> extends Field<number, TOptional> {
  public lt(value: number) {
    this.validations.push({
      parse: (value) => value < value,
      error: `Input must be less than ${value.toString()}`
    });
    return this;
  }

  public lte(value: number) {
    this.validations.push({
      parse: (value) => value <= value,
      error: `Input must be equal to orless than ${value.toString()}`
    });
    return this;
  }

  public gt(value: number) {
    this.validations.push({
      parse: (value) => value > value,
      error: `Input must be greater than ${value.toString()}`
    });
    return this;
  }

  public gte(value: number) {
    this.validations.push({
      parse: (value) => value >= value,
      error: `Input must be equal to or greater than ${value.toString()}`
    });
    return this;
  }

  public int() {
    this.validations.push({
      parse: (value) => Number.isInteger(value),
      error: 'Input must be an integer'
    });
    return this;
  }

  public optional(): NumberField<true> {
    this.isOptional = true as any;
    return this as any;
  }
}

export class F {
  static Text = TextField;
  static Options = OptionsField;
  static Boolean = BooleanField;
  static Number = NumberField;
}
