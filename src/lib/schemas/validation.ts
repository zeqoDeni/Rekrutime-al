import { z } from 'zod';

// Job creation form schema — matches CreateMarketplaceJobInput fields
export const createJobSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Titulli duhet të ketë të paktën 5 karaktere')
      .max(100, 'Titulli nuk duhet të kalojë 100 karaktere'),
    location: z
      .string()
      .min(2, 'Vendndodhja duhet të ketë të paktën 2 karaktere')
      .max(50, 'Vendndodhja nuk duhet të kalojë 50 karaktere'),
    salaryMin: z.coerce
      .number({ error: 'Pagesa minimale duhet të jetë numër' })
      .min(0, 'Pagesa duhet të jetë pozitive'),
    salaryMax: z.coerce
      .number({ error: 'Pagesa maksimale duhet të jetë numër' })
      .min(0, 'Pagesa duhet të jetë pozitive'),
    type: z.enum(['full-time', 'part-time', 'contract', 'freelance'] as const),
    experience: z.string().max(50, 'Përvoja nuk duhet të kalojë 50 karaktere').optional(),
    description: z
      .string()
      .min(20, 'Përshkrimi duhet të ketë të paktën 20 karaktere')
      .max(5000, 'Përshkrimi nuk duhet të kalojë 5000 karaktere'),
  })
  .refine((data) => data.salaryMax >= data.salaryMin, {
    message: 'Pagesa maksimale duhet të jetë ≥ pagesa minimale',
    path: ['salaryMax'],
  });

export type CreateJobFormData = z.infer<typeof createJobSchema>;

// Candidate profile schema
export const candidateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Emri duhet të ketë të paktën 2 karaktere')
    .max(100, 'Emri nuk duhet të kalojë 100 karaktere'),
  email: z
    .string()
    .email('Email-i nuk është i vlefshëm')
    .max(255, 'Email-i nuk duhet të kalojë 255 karaktere'),
});

export type CandidateProfileFormData = z.infer<typeof candidateProfileSchema>;

// Employer profile schema
export const employerProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Emri i kompanisë duhet të ketë të paktën 2 karaktere')
    .max(100, 'Emri i kompanisë nuk duhet të kalojë 100 karaktere'),
  email: z
    .string()
    .email('Email-i nuk është i vlefshëm')
    .max(255, 'Email-i nuk duhet të kalojë 255 karaktere'),
});

export type EmployerProfileFormData = z.infer<typeof employerProfileSchema>;

// Message compose schema
export const messageSchema = z.object({
  subject: z
    .string()
    .min(3, 'Tema duhet të ketë të paktën 3 karaktere')
    .max(100, 'Tema nuk duhet të kalojë 100 karaktere'),
  body: z
    .string()
    .min(5, 'Mesazhi duhet të ketë të paktën 5 karaktere')
    .max(1000, 'Mesazhi nuk duhet të kalojë 1000 karaktere'),
});

export type MessageFormData = z.infer<typeof messageSchema>;

// CRM candidate creation schema
export const crmCandidateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Emri duhet të ketë të paktën 2 karaktere')
    .max(100, 'Emri nuk duhet të kalojë 100 karaktere'),
  email: z
    .string()
    .email('Email-i nuk është i vlefshëm')
    .max(255, 'Email-i nuk duhet të kalojë 255 karaktere')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(30, 'Numri i telefonit nuk duhet të kalojë 30 karaktere')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(2000, 'Shënimi nuk duhet të kalojë 2000 karaktere')
    .optional()
    .or(z.literal('')),
});

export type CrmCandidateFormData = z.infer<typeof crmCandidateSchema>;

export const formatValidationError = (error: z.ZodError) => {
  return error.flatten().fieldErrors;
};

export type FormErrors = Record<string, string[] | undefined>;
