# Backend Structure

The backend keeps HTTP wiring, request handling, and domain logic in separate
folders:

- `routes/v1`: Express route definitions. Keep these thin: authentication,
  authorization, URL shape, and controller selection.
- `api/v1/*/controllers`: request/response adapters. Controllers validate
  inputs, call domain services, and return API responses.
- `lib/*`: domain services. Put business rules, model queries, and workflow
  logic here instead of in routes or controllers.
- `lib/validators`: Joi schemas for request contracts. Use enum values from
  `src/lib/apiContract.js`.
- `model`: Mongoose schemas and indexes. Model enums should also use
  `src/lib/apiContract.js`.
- `middleware`: cross-cutting Express behavior such as auth, rate limits,
  logging, metrics, and request context.
- `utils`: small framework-agnostic helpers.
- `lib/apiContract.js`: enum/status contract consumed by backend validators
  and models.

When adding a feature, prefer this flow:

1. Add or update `src/lib/apiContract.js` if the API introduces a new
   enum/status.
2. Add route wiring in `routes/v1`.
3. Keep the controller focused on HTTP details.
4. Put reusable business behavior in `lib/<feature>`.
5. Keep persistence details in `model` or service-level queries.

## Local Email

The root `docker-compose.yml` includes MailHog for development email delivery.
Use `EMAIL_HOST=localhost`, `EMAIL_PORT=1025`, and `EMAIL_SECURE=false`.
Open `http://localhost:8025` to inspect confirmation, reset, and newsletter
campaign emails.
