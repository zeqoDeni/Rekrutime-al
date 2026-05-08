import { ReactNode } from 'react';
import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './label';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

/**
 * FormField component for consistent form field layout with error display
 * Wraps inputs with labels and error messages
 */
export function FormField({ label, id, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

/**
 * Convenience component for text inputs
 */
export function FormInput({
  label,
  id,
  error,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <FormField label={label} id={id || ''} error={error} required={required}>
      <Input id={id} {...props} className={error ? 'border-destructive' : ''} />
    </FormField>
  );
}

/**
 * Convenience component for textarea
 */
export function FormTextarea({
  label,
  id,
  error,
  required,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <FormField label={label} id={id || ''} error={error} required={required}>
      <Textarea id={id} {...props} className={error ? 'border-destructive' : ''} />
    </FormField>
  );
}
