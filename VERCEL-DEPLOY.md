# Vercel deployment checklist

1. Push this project to GitHub and import the repository into Vercel.
2. Create a PostgreSQL database (for example Neon or Supabase) and copy its connection string.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `DATABASE_URL`: PostgreSQL connection string, including SSL options required by your provider.
   - `SESSION_SECRET`: a long, random secret (at least 32 characters).
   - `NEXT_PUBLIC_SITE_URL`: the deployed HTTPS URL.
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`: credentials for the first seeded admin account.
   - `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` only if WhatsApp Cloud API is configured.
4. Apply the database schema before using the site. With dependencies installed and `DATABASE_URL` set, run `npm run db:generate` if migrations have not been generated, then `npm run db:migrate`.
5. Redeploy after adding or changing environment variables.

Build command: `npm run build` (Vercel's default). Install command: `npm install`.
