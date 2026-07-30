import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';
import { TitleBlock } from '@/components/ui';
import { ProfileForm } from './ProfileForm';
import { ResumeCard } from './ResumeCard';

export const metadata = { title: 'My profile' };

export default async function ProfilePage() {
  const user = await requireRole('SEEKER');

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: user.id } });

  return (
    <div className="max-w-3xl">
      <TitleBlock
        cells={[
          { label: 'Sheet', value: 'Profile' },
          { label: 'Holder', value: user.name },
          { label: 'Resume', value: profile?.resumeFilename ? 'On file' : 'None' },
        ]}
        className="mb-8"
      />

      <ResumeCard
        filename={profile?.resumeFilename ?? null}
        size={profile?.resumeSize ?? null}
        updatedAt={profile?.resumeUpdatedAt ?? null}
      />

      <div className="mt-8">
        <ProfileForm
          defaults={{
            name: user.name,
            phone: user.phone ?? '',
            headline: profile?.headline ?? '',
            location: profile?.location ?? '',
            bio: profile?.bio ?? '',
            experienceYears: profile?.experienceYears?.toString() ?? '',
            skills: (profile?.skills ?? []).join(', '),
          }}
        />
      </div>
    </div>
  );
}
