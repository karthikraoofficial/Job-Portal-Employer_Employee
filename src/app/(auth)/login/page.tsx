'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { signIn } from '@/lib/auth-client';
import { loginSchema } from '@/lib/validation/auth';
import { Alert, Button, Field, Sheet, TitleBlock } from '@/components/ui';

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary during prerendering.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!parsed.success) {
      const next: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'email' | 'password';
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    const { error } = await signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setSubmitting(false);

    if (error) {
      // Deliberately vague: naming which field was wrong would let someone
      // discover which email addresses are registered.
      setFormError('That email and password combination did not work.');
      return;
    }

    // `next` is where proxy.ts sent them from. Same-site paths only, so this
    // cannot be used to bounce someone to another domain.
    const next = searchParams.get('next');
    const destination = next?.startsWith('/') && !next.startsWith('//') ? next : '/';

    router.push(destination);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <TitleBlock
        cells={[
          { label: 'Form', value: 'Sign in' },
          { label: 'Ref', value: 'JP-AUTH' },
        ]}
      />

      <Sheet className="border-t-0 px-5 py-8 sm:px-8">
        <h1 className="heading">Sign in</h1>
        <p className="data mt-2 text-ink-3">
          No account yet?{' '}
          <Link
            href="/register"
            className="font-semibold text-markup-ink underline decoration-rule underline-offset-4 hover:decoration-markup"
          >
            Register
          </Link>
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8">
          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            error={errors.email}
          />
          <Field label="Password" name="password" type="password" error={errors.password} />

          {formError && <Alert>{formError}</Alert>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Signing in' : 'Sign in'}
          </Button>
        </form>
      </Sheet>
    </div>
  );
}
