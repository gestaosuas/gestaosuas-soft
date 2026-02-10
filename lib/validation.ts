import { z } from 'zod';

export const submissionBaseSchema = z.object({
    month: z.number().min(1).max(12),
    year: z.number().min(2024).max(2030),
    directorateId: z.string().uuid(),
    setor: z.string().optional(),
});

export const genericDataSchema = z.record(z.string(), z.any());

export const dailyReportSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    directorateId: z.string().uuid(),
    data: genericDataSchema,
});

export const visitSchema = z.object({
    osc_id: z.string().uuid(),
    directorate_id: z.string().uuid(),
    visit_date: z.string(),
    technician_name1: z.string().optional(),
    technician_name2: z.string().optional(),
    status: z.enum(['draft', 'finalized']).optional(),
    documents: z.array(z.object({
        name: z.string(),
        url: z.string()
    })).optional(),
    data: genericDataSchema.optional(),
}).passthrough();

export const oscSchema = z.object({
    name: z.string().min(2),
    activity_type: z.string(),
    cep: z.string(),
    address: z.string(),
    number: z.string(),
    neighborhood: z.string(),
    phone: z.string(),
    subsidized_count: z.number().optional().nullable(),
    directorate_id: z.string().uuid().optional(),
});
