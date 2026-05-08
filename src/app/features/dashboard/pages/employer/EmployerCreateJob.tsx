import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/app/context/AuthContext';
import { createMarketplaceJob } from '@/lib/marketplace';
import {
  createJobSchema,
  type CreateJobFormData,
  formatValidationError,
  type FormErrors,
} from '@/lib/schemas/validation';
import { DashboardLayout } from '@/app/features/dashboard/layout/DashboardLayout';
import { Button } from '@/app/shared/ui/button';
import { FormInput, FormTextarea } from '@/app/shared/ui/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/shared/ui/select';
import { Label } from '@/app/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/shared/ui/card';
import { toast } from 'sonner';

interface CreateJobFormState {
  title: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  type: string;
  experience: string;
  description: string;
}

const JOB_TYPE_LABELS: Record<CreateJobFormData['type'], string> = {
  'full-time': 'Me kohë të plotë',
  'part-time': 'Me kohë të pjesshme',
  contract: 'Kontratë',
  freelance: 'Freelance',
};

export default function EmployerCreateJob() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateJobFormState>({
    title: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    type: 'full-time',
    experience: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof CreateJobFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setErrors({});
    setIsSaving(true);

    try {
      const validatedData = createJobSchema.parse(formData);

      await createMarketplaceJob(
        {
          title: validatedData.title,
          company: user.name,
          description: validatedData.description,
          location: validatedData.location,
          salary: { min: validatedData.salaryMin, max: validatedData.salaryMax, currency: 'EUR' },
          type: validatedData.type,
          category: 'Të tjera',
          experience: validatedData.experience ?? '',
          requirements: [],
          employerId: user.id,
        },
        user
      );

      toast.success('Punë u krijua me sukses!');
      navigate('/dashboard/employer');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(formatValidationError(error));
        toast.error('Ju lutem korrigjoni gabimet në formë.');
      } else {
        toast.error('Ndodhi një gabim gjatë ruajtjes së punës. Provoni përsëri.');
        console.error('Error saving job:', error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout title="Shto Punë të Re">
      <Card>
        <CardHeader>
          <CardTitle>Formulari i krijimit të punës</CardTitle>
          <CardDescription>Krijoni një njoftim të ri pune për kandidatët.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Titulli i Punës"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="P.sh. Inxhinier/e Senior Frontend"
              error={errors.title?.[0]}
              required
            />

            <FormInput
              label="Vendndodhja"
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="P.sh. Tiranë"
              error={errors.location?.[0]}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Paga Minimale (EUR)"
                id="salaryMin"
                type="number"
                min="0"
                value={formData.salaryMin}
                onChange={(e) => handleChange('salaryMin', e.target.value)}
                placeholder="P.sh. 1200"
                error={errors.salaryMin?.[0]}
                required
              />
              <FormInput
                label="Paga Maksimale (EUR)"
                id="salaryMax"
                type="number"
                min="0"
                value={formData.salaryMax}
                onChange={(e) => handleChange('salaryMax', e.target.value)}
                placeholder="P.sh. 1800"
                error={errors.salaryMax?.[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Lloji i punës <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.type} onValueChange={(val) => handleChange('type', val)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Zgjidhni llojin" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(JOB_TYPE_LABELS) as [CreateJobFormData['type'], string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {errors.type?.[0] && (
                <p className="text-sm font-medium text-destructive">{errors.type[0]}</p>
              )}
            </div>

            <FormInput
              label="Përvoja e kërkuar"
              id="experience"
              value={formData.experience}
              onChange={(e) => handleChange('experience', e.target.value)}
              placeholder="P.sh. 2+ vite, Junior, Senior"
              error={errors.experience?.[0]}
            />

            <FormTextarea
              label="Përshkrimi i Punës"
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={6}
              placeholder="Përshkruani përgjegjësitë, kërkesat dhe avantazhet..."
              error={errors.description?.[0]}
              required
            />

            <Button type="submit" disabled={isSaving || !user}>
              {isSaving ? 'Po ruhet...' : 'Publiko njoftimin e punës'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
