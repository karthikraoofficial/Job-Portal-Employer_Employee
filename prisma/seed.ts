import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';

// Fills an empty database with companies and job listings so the search page
// has something to show. Safe to run repeatedly - it clears its own data first.
//
//   npm run db:seed

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const COMPANIES = [
  {
    name: 'Bluebird Technologies',
    slug: 'bluebird-technologies',
    location: 'Bengaluru, India',
    website: 'https://bluebird.example.com',
    description: 'We build developer tools used by teams across India.',
    email: 'hiring@bluebird.seed',
  },
  {
    name: 'Nimbus Labs',
    slug: 'nimbus-labs',
    location: 'Remote',
    website: 'https://nimbus.example.com',
    description: 'A fully remote infrastructure company.',
    email: 'hiring@nimbus.seed',
  },
  {
    name: 'Craftline Studio',
    slug: 'craftline-studio',
    location: 'Mumbai, India',
    description: 'A small design studio working with product teams.',
    email: 'hiring@craftline.seed',
  },
  {
    name: 'Meridian Retail',
    slug: 'meridian-retail',
    location: 'Hyderabad, India',
    description: 'One of the larger retail chains in southern India.',
    email: 'hiring@meridian.seed',
  },
];

type SeedJob = {
  company: string;
  title: string;
  description: string;
  location: string | null;
  isRemote: boolean;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
  experienceLevel: 'INTERN' | 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: 'YEAR' | 'MONTH';
  daysAgo: number;
};

const JOBS: SeedJob[] = [
  {
    company: 'bluebird-technologies',
    title: 'Frontend Developer',
    description:
      'Build and maintain customer-facing web interfaces using React and TypeScript. You will work closely with designers to turn mockups into responsive, accessible pages, and you will own features from first sketch through to production.',
    location: 'Bengaluru, India',
    isRemote: false,
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryMin: 800000,
    salaryMax: 1200000,
    salaryPeriod: 'YEAR',
    daysAgo: 7,
  },
  {
    company: 'nimbus-labs',
    title: 'Backend Engineer',
    description:
      'Design and ship REST APIs in Node.js. Own database schema design, background jobs, and the reliability of the services you build. We care about clear code and good tests more than we care about which framework you have used before.',
    location: null,
    isRemote: true,
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    salaryMin: 1400000,
    salaryMax: 2000000,
    salaryPeriod: 'YEAR',
    daysAgo: 9,
  },
  {
    company: 'craftline-studio',
    title: 'UI/UX Designer',
    description:
      'Run discovery interviews, produce wireframes, and deliver polished Figma prototypes for web and mobile products across a range of clients. You will be the only designer on some projects, so comfort with ambiguity matters.',
    location: 'Mumbai, India',
    isRemote: false,
    employmentType: 'CONTRACT',
    experienceLevel: 'MID',
    salaryMin: 60000,
    salaryMax: null,
    salaryPeriod: 'MONTH',
    daysAgo: 5,
  },
  {
    company: 'meridian-retail',
    title: 'Data Analyst',
    description:
      'Turn raw sales and inventory data into dashboards leadership actually uses. Strong SQL is required; Python and Power BI are a plus. You will sit with the merchandising team rather than in a separate data silo.',
    location: 'Hyderabad, India',
    isRemote: false,
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryMin: 900000,
    salaryMax: 1300000,
    salaryPeriod: 'YEAR',
    daysAgo: 12,
  },
  {
    company: 'bluebird-technologies',
    title: 'QA Automation Intern',
    description:
      'Six-month internship writing automated browser tests with Playwright. Ideal for a final-year student who wants real production experience rather than a toy project. Mentorship from the senior QA engineer throughout.',
    location: 'Bengaluru, India',
    isRemote: false,
    employmentType: 'INTERNSHIP',
    experienceLevel: 'INTERN',
    salaryMin: 25000,
    salaryMax: null,
    salaryPeriod: 'MONTH',
    daysAgo: 3,
  },
  {
    company: 'nimbus-labs',
    title: 'DevOps Engineer',
    description:
      'Own our CI/CD pipelines and cloud infrastructure. Experience with Docker, GitHub Actions, and infrastructure-as-code expected. You will have real authority over how we deploy, not just tickets to implement.',
    location: null,
    isRemote: true,
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    salaryMin: 1600000,
    salaryMax: 2400000,
    salaryPeriod: 'YEAR',
    daysAgo: 16,
  },
  {
    company: 'craftline-studio',
    title: 'Technical Content Writer',
    description:
      'Write developer tutorials, release notes, and product documentation. You should be comfortable reading code even if you do not write it daily. Part-time, roughly twenty hours a week, with flexible timing.',
    location: 'Pune, India',
    isRemote: false,
    employmentType: 'PART_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: 35000,
    salaryMax: null,
    salaryPeriod: 'MONTH',
    daysAgo: 8,
  },
  {
    company: 'meridian-retail',
    title: 'Customer Success Associate',
    description:
      'Be the first point of contact for enterprise customers. Onboard new accounts, resolve escalations, and feed product gaps back to engineering. Retail experience helps but is not required.',
    location: 'Delhi, India',
    isRemote: false,
    employmentType: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: 500000,
    salaryMax: 700000,
    salaryPeriod: 'YEAR',
    daysAgo: 4,
  },
  {
    company: 'nimbus-labs',
    title: 'Engineering Manager',
    description:
      'Lead a distributed team of six engineers building platform services. We are looking for someone who still reads pull requests and who sees hiring and growing people as the core of the job rather than a distraction from it.',
    location: null,
    isRemote: true,
    employmentType: 'FULL_TIME',
    experienceLevel: 'LEAD',
    salaryMin: 2800000,
    salaryMax: 3600000,
    salaryPeriod: 'YEAR',
    daysAgo: 20,
  },
  {
    company: 'bluebird-technologies',
    title: 'Junior Backend Engineer',
    description:
      'Join the API team and grow into service ownership. You will start with well-scoped bug fixes and small features, paired with a senior engineer, and take on larger work as you find your feet. Node.js and SQL exposure expected.',
    location: 'Bengaluru, India',
    isRemote: false,
    employmentType: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: 600000,
    salaryMax: 900000,
    salaryPeriod: 'YEAR',
    daysAgo: 2,
  },
  {
    company: 'meridian-retail',
    title: 'Warehouse Operations Lead',
    description:
      'Run the day shift at our Hyderabad distribution centre. Manage a team of twenty, own throughput and safety targets, and work with the logistics team on route planning. Prior warehouse leadership required.',
    location: 'Hyderabad, India',
    isRemote: false,
    employmentType: 'FULL_TIME',
    experienceLevel: 'LEAD',
    salaryMin: 1100000,
    salaryMax: 1500000,
    salaryPeriod: 'YEAR',
    daysAgo: 11,
  },
  {
    company: 'craftline-studio',
    title: 'Motion Designer',
    description:
      'Produce short product animations and interface motion for client launches. After Effects and a good sense of timing matter more than a long CV. Six-month contract with a strong chance of extension.',
    location: 'Mumbai, India',
    isRemote: false,
    employmentType: 'CONTRACT',
    experienceLevel: 'MID',
    salaryMin: 70000,
    salaryMax: 90000,
    salaryPeriod: 'MONTH',
    daysAgo: 6,
  },
];

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

async function main() {
  // Remove anything from a previous seed run. Deleting the employer cascades to
  // their company and jobs, so real accounts you created are left alone.
  const removed = await prisma.user.deleteMany({
    where: { email: { endsWith: '.seed' } },
  });
  if (removed.count > 0) console.log(`cleared ${removed.count} seeded employer(s)`);

  const companyIds = new Map<string, string>();

  for (const company of COMPANIES) {
    const { email, ...companyData } = company;

    const owner = await prisma.user.create({
      data: {
        name: `${company.name} Hiring`,
        email,
        role: 'EMPLOYER',
        emailVerified: true,
        company: { create: companyData },
      },
      include: { company: true },
    });

    companyIds.set(company.slug, owner.company!.id);
  }
  console.log(`created ${COMPANIES.length} companies`);

  for (const job of JOBS) {
    const { company, daysAgo: age, ...jobData } = job;
    const publishedAt = daysAgo(age);

    await prisma.job.create({
      data: {
        ...jobData,
        slug: `${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${company}`,
        salaryCurrency: 'INR',
        status: 'PUBLISHED',
        publishedAt,
        companyId: companyIds.get(company)!,
      },
    });
  }
  console.log(`created ${JOBS.length} published jobs`);
  console.log('\nSeed complete. Visit http://localhost:3000/jobs');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
