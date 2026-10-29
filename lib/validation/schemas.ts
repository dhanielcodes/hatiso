import * as Yup from 'yup';

/** Shared field builders — compose into page-level schemas */

export const emailSchema = Yup.string()
  .trim()
  .email('Enter a valid email address')
  .required('Email is required');

export const optionalEmailSchema = Yup.string()
  .trim()
  .transform((value) => (value === '' ? undefined : value))
  .email('Enter a valid email address')
  .optional();

export const phoneSchema = Yup.string()
  .trim()
  .matches(
    /^(\+?234|0)?[789][01]\d{8}$/,
    'Enter a valid Nigerian phone number'
  )
  .required('Phone number is required');

export const loosePhoneSchema = Yup.string()
  .trim()
  .min(7, 'Phone number is too short')
  .required('Phone number is required');

export const passwordSchema = Yup.string()
  .min(8, 'Password must be at least 8 characters')
  .required('Password is required');

export const requiredString = (label = 'This field') =>
  Yup.string().trim().required(`${label} is required`);

export function amountSchema(opts?: {
  min?: number;
  max?: number;
  required?: boolean;
  currency?: string;
}) {
  const currency = opts?.currency ?? '₦';
  const min = opts?.min ?? 0;
  const max = opts?.max;
  const required = opts?.required !== false;

  const base = Yup.number()
    .transform((value, original) =>
      original === '' || original === null || original === undefined ? undefined : value
    )
    .typeError('Enter a valid amount')
    .min(min, `Minimum amount is ${currency}${min.toLocaleString()}`);

  const withMax =
    max !== undefined
      ? base.max(max, `Maximum amount is ${currency}${max.toLocaleString()}`)
      : base;

  return required
    ? withMax.required('Amount is required')
    : withMax.optional();
}

export function numberSchema(opts?: {
  min?: number;
  max?: number;
  required?: boolean;
  label?: string;
  integer?: boolean;
}) {
  const label = opts?.label ?? 'Value';
  let schema = Yup.number()
    .transform((value, original) =>
      original === '' || original === null || original === undefined ? undefined : value
    )
    .typeError(`${label} must be a number`);

  if (opts?.integer) {
    schema = schema.integer(`${label} must be a whole number`);
  }
  if (opts?.min !== undefined) {
    schema = schema.min(opts.min, `${label} must be at least ${opts.min}`);
  }
  if (opts?.max !== undefined) {
    schema = schema.max(opts.max, `${label} must be at most ${opts.max}`);
  }

  return opts?.required === false
    ? schema.optional()
    : schema.required(`${label} is required`);
}

export function dateSchema(opts?: {
  required?: boolean;
  min?: string;
  max?: string;
  label?: string;
}) {
  const label = opts?.label ?? 'Date';
  const min = opts?.min;
  const max = opts?.max;

  const schema = Yup.string()
    .trim()
    .test('valid-date', `Enter a valid ${label.toLowerCase()}`, (value) => {
      if (!value) return opts?.required === false;
      return !Number.isNaN(Date.parse(value));
    })
    .test('min-date', `${label} is too early`, (value) => {
      if (!value || !min) return true;
      return value >= min;
    })
    .test('max-date', `${label} is too late`, (value) => {
      if (!value || !max) return true;
      return value <= max;
    });

  return opts?.required === false
    ? schema.optional()
    : schema.required(`${label} is required`);
}

/** Page schemas */

export const loginSchema = Yup.object({
  emailOrPhone: Yup.string().trim().required('Email or phone is required'),
  password: Yup.string().required('Password is required'),
  rememberMe: Yup.boolean(),
});

export const registerSchema = Yup.object({
  accountType: Yup.mixed<'personal' | 'business'>()
    .oneOf(['personal', 'business'])
    .required(),
  fullName: Yup.string()
    .trim()
    .min(2, 'Name is too short')
    .required('Name is required'),
  email: emailSchema,
  phone: loosePhoneSchema,
  password: passwordSchema,
  agreeTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the Terms of Service')
    .required(),
});

export const contactSchema = Yup.object({
  businessName: requiredString('Business name'),
  email: emailSchema,
  phone: loosePhoneSchema,
  message: Yup.string()
    .trim()
    .min(10, 'Message should be at least 10 characters')
    .required('Message is required'),
});

export function servicePaymentSchema(opts: {
  slug: string;
  requireAmount: boolean;
  minAmount?: number;
  maxAmount?: number;
}) {
  const recipientLabel =
    opts.slug === 'electricity'
      ? 'Meter number'
      : opts.slug === 'tv'
        ? 'Smartcard number'
        : opts.slug === 'betting'
          ? 'User ID'
          : 'Phone number';

  return Yup.object({
    providerId: requiredString('Provider'),
    recipientNumber: Yup.string()
      .trim()
      .required(`${recipientLabel} is required`),
    meterType: Yup.mixed<'prepaid' | 'postpaid'>().oneOf(['prepaid', 'postpaid']),
    amount: opts.requireAmount
      ? amountSchema({
          min: opts.minAmount ?? 100,
          max: opts.maxAmount ?? 100000,
          required: true,
        })
      : Yup.mixed().optional().nullable(),
    dataFrequency: Yup.string().optional(),
    selectedDataPlan: Yup.string().optional(),
    tvFrequency: Yup.string().optional(),
    selectedTvPlan: Yup.string().optional(),
    email: optionalEmailSchema,
  });
}

export type LoginFormValues = Yup.InferType<typeof loginSchema>;
export type RegisterFormValues = Yup.InferType<typeof registerSchema>;
export type ContactFormValues = Yup.InferType<typeof contactSchema>;
