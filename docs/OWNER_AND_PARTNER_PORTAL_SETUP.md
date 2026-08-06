# Owner and partner portal activation

## 1. Apply database migrations

From the project folder, link the correct Supabase project and run:

```bash
npx supabase login
npx supabase link
npx supabase db push
```

This applies the empty-directory cleanup, owner authorization, partner
ownership policies, and invitation tracking.

## 2. Create the first owner account

In Supabase Dashboard, open **Authentication → Users → Add user** and create the
iThoddoo owner with a secure email and password.

Copy that user's UUID. Then run this in **SQL Editor**, replacing both example
values:

```sql
insert into public.admin_users (auth_user_id, email, role)
values ('OWNER_AUTH_USER_UUID', 'OWNER_EMAIL_ADDRESS', 'owner');
```

Do not put the owner's password in SQL, source code, or environment variables.

## 3. Configure production environment

Set these server environment variables in the live hosting project:

```text
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SITE_URL=https://thoddoomaldives.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
EMAIL_FROM_NAME=iThoddoo Maldives
EMAIL_FROM_ADDRESS=hello@thoddoomaldives.com
EMAIL_REPLY_TO=hello@thoddoomaldives.com
SMTP_HOST=...
SMTP_PORT=587
SMTP_USERNAME=...
SMTP_PASSWORD=...
```

The service-role key must remain server-only.
The SMTP credentials must remain server-only.

## 3b. Redirect URLs

In Supabase Auth settings, add these redirect URLs:

- `https://thoddoomaldives.com/partner/reset-password`
- `https://thoddoomaldives.com/partner/login`

Keep the localhost equivalents for development.

## 3c. DNS and email delivery

For `hello@thoddoomaldives.com`, ensure the domain has:

- SPF record for the SMTP sender
- DKIM signing enabled by your SMTP provider
- DMARC policy for the root domain
- A valid `From` identity matching the verified sender

If your SMTP provider gives a custom return-path or bounce domain, configure that as well.

## 4. Real partner workflow

1. A business owner submits a partner application.
2. The iThoddoo owner reviews the submitted identity and business information.
3. Approving the application creates the business as pending and sends a
   Supabase invitation to the submitted email.
4. The new partner sets a password and signs in.
5. The linked account can see and manage only its own business records.
6. Publication remains controlled by iThoddoo owner approval.
7. Partner emails and booking notifications use the configured SMTP service.

## 5. Final checks before deployment

- Confirm the public business directories are empty.
- Confirm `/admin` rejects accounts not present in `admin_users`.
- Confirm a test partner cannot read or update another partner's records.
- Confirm invitation redirects use `https://thoddoomaldives.com`.
- Confirm the first real listing remains draft until owner approval.
- Confirm partner emails send from `hello@thoddoomaldives.com`.
