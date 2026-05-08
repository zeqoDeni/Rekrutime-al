import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useAuth } from '@/app/context/AuthContext';
import { updateUserName } from '@/lib/userProfile';
import {
  employerProfileSchema,
  type EmployerProfileFormData,
  formatValidationError,
  type FormErrors,
} from '@/lib/schemas/validation';
import { DashboardLayout } from '@/app/features/dashboard/layout/DashboardLayout';
import { Button } from '@/app/shared/ui/button';
import { FormInput } from '@/app/shared/ui/form-field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/shared/ui/card';
import { toast } from 'sonner';

export default function EmployerProfile() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState<EmployerProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFormData({ name: user.name, email: user.email });
  }, [user]);

  const handleChange = (field: keyof EmployerProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setErrors({});
    setIsSaving(true);
    try {
      const validatedData = employerProfileSchema.parse(formData);
      await updateUserName(user.id, validatedData.name);
      updateProfile({ name: validatedData.name });
      toast.success('Profil u ruajt me sukses!');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(formatValidationError(error));
        toast.error('Ju lutem korrigjoni gabimet në formë.');
      } else {
        toast.error('Ndodhi një gabim gjatë ruajtjes.');
        console.error('Error saving profile:', error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout title="Profili i Punëdhënësit">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Duke ngarkuar...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profili i Punëdhënësit">
      <Card>
        <CardHeader>
          <CardTitle>Informacioni i llogarisë</CardTitle>
          <CardDescription>Rifreskoni emrin e kompanisë. Email-i nuk mund të ndryshohet direkt.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <FormInput
              label="Emri i Kompanisë"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name?.[0]}
              required
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <p className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                {formData.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Email-i lidhet me llogarinë dhe nuk mund të ndryshohet këtu.
              </p>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Po ruhet...' : 'Ruaj ndryshimet'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
