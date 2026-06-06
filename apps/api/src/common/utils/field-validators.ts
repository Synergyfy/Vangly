import { HttpException, HttpStatus } from '@nestjs/common';

export type FieldType =
  | 'text'
  | 'longtext'
  | 'number'
  | 'email'
  | 'phone'
  | 'url'
  | 'checkbox'
  | 'radio'
  | 'dropdown'
  | 'multiselect'
  | 'yesno'
  | 'date'
  | 'time'
  | 'monthday'
  | 'fileupload'
  | 'image'
  | 'signature'
  | 'rating'
  | 'address'
  | 'divider'
  | 'paragraph';

export const LAYOUT_FIELD_TYPES: ReadonlySet<FieldType> = new Set<FieldType>([
  'divider',
  'paragraph',
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_REGEX = /^\+?[1-9]\d{1,14}$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TIME_REGEX = /^\d{2}:\d{2}(?::\d{2})?$/;
const MONTH_DAY_REGEX = /^(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/;

export interface FormFieldLike {
  id: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  title?: string;
}

export function assertFieldOptions(field: FormFieldLike): void {
  if (
    field.type === 'yesno' &&
    (!field.options || field.options.length === 0)
  ) {
    field.options = ['Yes', 'No'];
  }
}

export function validateAnswer(
  field: FormFieldLike,
  value: unknown,
): string | null {
  if (value === undefined || value === null || value === '') {
    return field.required ? 'required' : null;
  }
  switch (field.type) {
    case 'text':
    case 'longtext':
    case 'paragraph':
    case 'divider':
      return typeof value === 'string' ? null : 'invalid_type';
    case 'number':
    case 'rating':
      return typeof value === 'number' && Number.isFinite(value)
        ? null
        : 'invalid_number';
    case 'email':
      return typeof value === 'string' && EMAIL_REGEX.test(value)
        ? null
        : 'invalid_email';
    case 'phone':
      return typeof value === 'string' && E164_REGEX.test(value)
        ? null
        : 'invalid_phone';
    case 'url':
      return typeof value === 'string' && URL_REGEX.test(value)
        ? null
        : 'invalid_url';
    case 'checkbox':
      return typeof value === 'boolean' ? null : 'invalid_boolean';
    case 'radio':
    case 'dropdown':
      if (typeof value !== 'string') return 'invalid_choice';
      if (field.options && !field.options.includes(value))
        return 'invalid_choice';
      return null;
    case 'multiselect':
      if (!Array.isArray(value)) return 'invalid_choices';
      if (field.options) {
        for (const v of value) {
          if (typeof v !== 'string' || !field.options.includes(v))
            return 'invalid_choices';
        }
      }
      return null;
    case 'yesno':
      if (typeof value === 'boolean') return null;
      if (
        typeof value === 'string' &&
        ['Yes', 'No', 'yes', 'no', 'true', 'false'].includes(value)
      )
        return null;
      return 'invalid_yesno';
    case 'date':
      return typeof value === 'string' && ISO_DATE_REGEX.test(value)
        ? null
        : 'invalid_date';
    case 'time':
      return typeof value === 'string' && ISO_TIME_REGEX.test(value)
        ? null
        : 'invalid_time';
    case 'monthday':
      return typeof value === 'string' && MONTH_DAY_REGEX.test(value)
        ? null
        : 'invalid_monthday';
    case 'fileupload':
    case 'image':
    case 'signature':
    case 'address':
      return null;
    default:
      return null;
  }
}

export function validateSubmission(
  fields: FormFieldLike[],
  answers: Record<string, unknown>,
): { field: string; code: string; message: string }[] {
  const errors: { field: string; code: string; message: string }[] = [];
  for (const field of fields) {
    const value = answers[field.id];
    const code = validateAnswer(field, value);
    if (code) {
      errors.push({
        field: field.id,
        code,
        message: `Field "${field.title ?? field.id}" is invalid: ${code}`,
      });
    }
  }
  if (errors.length > 0) {
    throw new HttpException(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'One or more fields are invalid.',
          details: errors,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  return errors;
}

export function flattenAnswers(
  fields: FormFieldLike[],
  answers: Record<string, unknown>,
): Array<{ id: string; label: string; value: string }> {
  const rows: Array<{ id: string; label: string; value: string }> = [];
  for (const field of fields) {
    if (LAYOUT_FIELD_TYPES.has(field.type)) continue;
    const raw = answers[field.id];
    let value = '';
    if (Array.isArray(raw))
      value = raw
        .map((x) =>
          typeof x === 'string' || typeof x === 'number'
            ? String(x)
            : JSON.stringify(x),
        )
        .join('; ');
    else if (raw === null || raw === undefined) value = '';
    else if (typeof raw === 'object') value = JSON.stringify(raw);
    else if (
      typeof raw === 'string' ||
      typeof raw === 'number' ||
      typeof raw === 'boolean'
    )
      value = String(raw);
    else value = JSON.stringify(raw);
    rows.push({ id: field.id, label: field.title ?? field.id, value });
  }
  return rows;
}
