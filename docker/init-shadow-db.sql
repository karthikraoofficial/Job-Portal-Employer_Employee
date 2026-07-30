-- Runs once, the first time the Postgres container is created.
-- Prisma migrations need a second, throwaway database to verify migrations
-- against before applying them to the real one.
CREATE DATABASE jobportal_shadow OWNER jobportal;
