'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { signUp } from '@/lib/auth-client';
import { registerSchema } from '@/lib/validation/auth';
import { Alert, Button, Field, Sheet, TitleBlock } from '@/components/ui';

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'role', string>>;

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'SEEKER' | 'EMPLOYER'>('SEEKER');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const parsed = registerSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      password: formData.get('password'),
      role,
    });

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    const { data, error } = await signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      role: parsed.data.role,
      phone: parsed.data.phone,
    });
    setSubmitting(false);

    if (error || !data) {
      setFormError(error?.message ?? 'Could not create your account. Please try again.');
      return;
    }

    router.push(parsed.data.role === 'EMPLOYER' ? '/employer' : '/seeker');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl">
      <TitleBlock
        cells={[
          { label: 'Form', value: 'Registration' },
          { label: 'Ref', value: 'JP-REG-NEW' },
          { label: 'Fields', value: '004' },
        ]}
      />

      <Sheet className="border-t-0 px-5 py-8 sm:px-8">
        <h1 className="heading">Open an account</h1>
        <p className="data mt-2 text-ink-3">
          Already registered?{' '}
          <Link
            href="/login"
            className="font-semibold text-markup-ink underline decoration-rule underline-offset-4 hover:decoration-markup"
          >
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8">
          <fieldset className="mb-6">
            <legend className="lettering mb-2 text-ink-3">Account type</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <RoleOption
                value="SEEKER"
                label="Find work"
                description="Search listings and apply"
                selected={role === 'SEEKER'}
                onSelect={setRole}
              />
              <RoleOption
                value="EMPLOYER"
                label="Hire"
                description="Post listings, review applicants"
                selected={role === 'EMPLOYER'}
                onSelect={setRole}
              />
            </div>
          </fieldset>

          <Field label="Name" name="name" type="text" placeholder="Karthik Rao" error={errors.name} />
          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            error={errors.email}
          />
          <Field label="Phone" name="phone" type="tel" placeholder="9876543210" error={errors.phone} />
          <Field
            label="Password"
            name="password"
            type="password"
            hint="At least 8 characters."
            error={errors.password}
          />

          {formError && <Alert>{formError}</Alert>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Registering' : 'Register'}
          </Button>
        </form>
      </Sheet>
    </div>
  );
}

/** Two cells of a title block; the selected one is marked in the markup pass. */
function RoleOption({
  value,
  label,
  description,
  selected,
  onSelect,
}: {
  value: 'SEEKER' | 'EMPLOYER';
  label: string;
  description: string;
  selected: boolean;
  onSelect: (value: 'SEEKER' | 'EMPLOYER') => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={`border p-4 text-left transition-colors duration-150 ${
        selected
          ? 'border-markup bg-markup-wash'
          : 'border-rule bg-sheet hover:border-ink-3'
      } ${value === 'EMPLOYER' ? 'sm:border-l-0 max-sm:border-t-0' : ''}`}
    >
      <span className={`lettering block ${selected ? 'text-markup-ink' : 'text-ink-3'}`}>
        {selected ? '● Selected' : '○ Select'}
      </span>
      <span className="mt-2 block font-semibold">{label}</span>
      <span className="data mt-0.5 block text-ink-3">{description}</span>
    </button>
  );
}
