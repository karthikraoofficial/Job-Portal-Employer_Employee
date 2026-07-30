import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';
import { TitleBlock } from '@/components/ui';
import { CompanyForm } from './CompanyForm';

export const metadata = { title: 'Company details' };

export default async function CompanyPage() {
  const user = await requireRole('EMPLOYER');
  const company = await prisma.company.findUnique({ where: { ownerId: user.id } });

  return (
    <div className="max-w-2xl">
      <TitleBlock
        cells={[
          { label: 'Sheet', value: 'Company' },
          { label: 'Status', value: company ? 'Issued' : 'Not issued' },
          { label: 'Ref', value: company?.slug.slice(0, 16).toUpperCase() ?? '—' },
        ]}
        className="mb-8"
      />

      <CompanyForm
        defaults={{
          name: company?.name ?? '',
          website: company?.website ?? '',
          location: company?.location ?? '',
          description: company?.description ?? '',
        }}
      />
    </div>
  );
}
