# My Service UI

Angular frontend for **My Service**: login, dashboard, password manager, and settings (categories, providers, users).

Standalone Angular 22 app with zoneless change detection, SSR, and an HTTP proxy to the Java backend (`my-service` on `localhost:8081`).

Palette (CSS variables in `src/styles.scss`):

- Light background: `#E9F1FA` (`--color-bg-light`)
- Primary: `#00ABE4` (`--color-primary`)
- White: `#FFFFFF` (`--color-white`)

UI copy is in French.

---

## Run locally

Prerequisites: Node.js, npm, and the backend running on **port 8081**.

```bash
npm install
npm start
# or: ng serve
```

Open [http://localhost:4200/](http://localhost:4200/). The app reloads on file changes.

`src/environments/environment.ts` (and `environment.development.ts`) set `apiUrl` to `/api`. Dev proxy [`proxy.conf.json`](proxy.conf.json) forwards `/api` to `http://localhost:8081`.

```json
{
  "/api": {
    "target": "http://localhost:8081",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

## Stack

| Piece | Choice |
|-------|--------|
| Framework | Angular 22 (standalone components) |
| Change detection | `provideZonelessChangeDetection()` |
| State | Signals (`signal`, `computed`, `input` / `output`) |
| HTTP | `HttpClient` + functional `jwtInterceptor` |
| Routing | `app.routes.ts` + `authGuard` |
| SSR | `@angular/ssr` (Express); dashboard/settings are client-rendered |
| Tests | Vitest (`ng test`) |
| Icons catalog | `simple-icons` (metadata) + `https://cdn.simpleicons.org/{slug}/{hex}` |

---

## Folder structure

Component files use the Angular suffix: `*.component.ts` | `.html` | `.scss`.

```
src/app/
  app.ts | app.html | app.routes.ts | app.config.ts   # app.html hosts <app-notification-toast />
  core/
    guards/auth.guard.ts
    interceptors/jwt.interceptor.ts
    services/auth.ts
    utils/slugify.ts
  shared/
    components/
      app-tile/
      app-sidebar/
      app-notification-toast/   # global toast (mounted in app.html)
    models/notification.ts
    services/notification.service.ts
  features/
    auth/login/
    dashboard/
      dashboard.component.ts | .html | .scss
    password-manager/
      password-manager.component.ts | .html | .scss
      models/external-account.ts
      services/external-account.service.ts
      components/
        pm-stats-panel/
        pm-filters-bar/
        pm-accounts-panel/
        pm-account-item/
        pm-account-detail-modal/
        pm-create-account-modal/
        pm-searchable-select/
    settings/
      settings.component.ts | .html | .scss   # shell: header + sidebar + router-outlet
      page/
        categories/
          categories.component.ts | .html | .scss
          models/category.ts
          services/category.service.ts
          components/
            category-filters-bar/
            category-item/
            category-list-panel/
            create-category-modal/
            delete-category-modal/
        providers/
          providers.component.ts | .html | .scss
          models/provider.ts
          services/provider.service.ts
          data/simple-icons.catalog.ts
          components/
            provider-filters-bar/
            provider-item/
            provider-list-panel/
            create-provider-modal/
            delete-provider-modal/
            icon-picker/
        users/
          users.component.ts | .html | .scss
          models/user.ts
          services/user.service.ts
          components/
            user-filters-bar/
            user-item/
            user-list-panel/
            create-user-modal/
```

**Layers**

- `core/` — app-wide auth, HTTP interceptor, guards, shared utils
- `shared/` — reusable UI (`app-tile`, `app-sidebar`, `app-notification-toast`) and cross-feature services (`NotificationService`)
- `features/` — screens; each feature owns its models and HTTP services. Settings pages live under `settings/page/` and stay thin orchestrators with nested presentational `components/`

**Naming**

- Page and component files: `*.component.ts|html|scss`
- Guards and interceptors: `*.guard.ts`, `*.interceptor.ts`
- Password-manager nested components use the `pm-` prefix (e.g. `pm-filters-bar.component.ts`)

---

## Routes

Defined in [`src/app/app.routes.ts`](src/app/app.routes.ts).

| Path | Component | Guard |
|------|-----------|-------|
| `/login` | Login | public |
| `/dashboard` | Dashboard | `authGuard` |
| `/password-manager` | PasswordManager | `authGuard` |
| `/settings` | Settings shell | `authGuard` |
| `/settings` (child `''`) | redirect → `categories` | |
| `/settings/categories` | Categories | |
| `/settings/providers` | Providers | |
| `/settings/users` | Users | |
| `''` / `**` | redirect → `/login` | |

`authGuard` allows SSR to render, then on the browser redirects to `/login` if there is no access token.

---

## Auth

[`AuthService`](src/app/core/services/auth.ts) + [`jwtInterceptor`](src/app/core/interceptors/jwt.interceptor.ts).

1. Login `POST /api/auth/login` → store `access_token` and `refresh_token` in `localStorage`.
2. Every non-auth request gets:
   - `Authorization: Bearer <access_token>`
   - `X-User-Id: <JWT sub>`
3. On **401**, interceptor calls `POST /api/auth/refresh` with `{ refreshToken }`, retries the request, or logs out if refresh fails.
4. Login and refresh URLs do **not** get Bearer / `X-User-Id`.
5. Logout clears tokens and navigates to `/login`.

---

## Notifications

Global toast mounted once in [`app.html`](src/app/app.html) via [`AppNotificationToast`](src/app/shared/components/app-notification-toast/app-notification-toast.component.ts).

Inject [`NotificationService`](src/app/shared/services/notification.service.ts) from any component:

```ts
private notificationService = inject(NotificationService);

this.notificationService.showSuccess('Accès activé', 'Jean Dupont peut à nouveau se connecter.');
this.notificationService.showWarning('Accès désactivé', 'Jean Dupont ne peut plus se connecter.');
this.notificationService.showError('Modification impossible', 'Message d\'erreur.');
```

| Type | Color | Icon | Auto-dismiss |
|------|-------|------|--------------|
| `success` | Green | Check | Yes (4.5 s) |
| `warning` | Orange | User blocked | Yes (4.5 s) |
| `error` | Red | Alert | No (manual close) |

Toast appears **top-right** with glass styling, animated icon, and progress bar on auto-dismiss.

---

## Features

### Login

Username + password. On success → `/dashboard`.

### Dashboard

App tiles:

- **My service Passwords** → `/password-manager`
- **Paramètre** → `/settings`
- **Se déconnecter** → logout

### Password manager

Sticky header (back to dashboard). Stats (top 3 categories / providers). Sticky filters: search, category, provider, sort (`createdAt` / `updatedAt`), list/grid, **Ajouter un compte**.

- Cards open the **detail modal** immediately (`GET /accounts/{id}`).
- Password is lazy (`GET .../password`); eye toggle and copy-without-reveal.
- Delete: typed confirm (`fullName` or `SUPPRIMER`) then `DELETE`.
- Create modal: searchable category/provider selects, password + confirm, `POST /accounts`, then refresh the list.

List filters are client-side from `GET /accounts`.

### Settings

Shell: back to dashboard, left **app-sidebar** (Catégories / Providers / Utilisateurs).

**Categories & providers:** search, sort (name / createdAt), list/grid, create modal, delete confirm.

- Badge **Système** when `userId === null` (seed data) — **no delete button**.
- Badge **Personnalisé** when `userId` is set — trash icon in the card footer.

**Categories:** name, slug (auto from name), description.

**Providers:** name, slug, website, Simple Icons picker (full catalog, ~3453 brands), color picker, live preview. `logoUrl` is `https://cdn.simpleicons.org/{slug}/{hex}`.

**Users** (admin only): search, sort (username / email / firstName / lastName), list/grid, create modal (username, email, first/last name, password + confirm).

- **Enable / disable toggle** on each card → `PATCH /api/v1/users/{id}/status?enabled=true|false`
- Optimistic UI update with rollback on error
- Inactive users: muted card styling + **Inactif** badge
- Toast feedback: green on reactivation, orange on deactivation, red on API error
- Non-admins see a 403 message on load. User delete is not in the UI yet.

Category/provider **GET by id** and **UPDATE** are not in the UI yet.

---

## API endpoints the UI calls

Base URL: `/api` (proxied to the backend). Authenticated routes need JWT + `X-User-Id` as above.

### Auth — `AuthService`

| Method | Path | Body | Notes |
|--------|------|------|--------|
| `POST` | `/api/auth/login` | `{ username, password }` | Returns tokens |
| `POST` | `/api/auth/refresh` | `{ refreshToken }` | Returns new tokens |

**Auth response**

```ts
{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}
```

### Accounts — `ExternalAccountService`

`apiUrl` = `/api/v1/accounts`

| Method | Path | Body / result |
|--------|------|----------------|
| `GET` | `/api/v1/accounts` | `ExternalAccount[]` |
| `GET` | `/api/v1/accounts/{id}` | `ExternalAccount` |
| `GET` | `/api/v1/accounts/{id}/password` | `{ password: string }` |
| `POST` | `/api/v1/accounts` | see create body |
| `DELETE` | `/api/v1/accounts/{id}` | empty |

**Create body** (`CreateExternalAccountRequest`)

| Field | Required |
|-------|----------|
| `categoryId` | yes |
| `providerId` | yes |
| `rawPassword` | yes |
| `fullName`, `username`, `email`, `link`, `description` | no |

**Account response** (`ExternalAccount`)

```ts
{
  id, userId,
  category: { id, name, slug },
  provider: { id, name, slug, logoUrl, color, websiteUrl },
  fullName, username, email, link, description,
  isActive,
  createdAt, updatedAt
}
```

### Categories — `CategoryService`

`apiUrl` = `/api/v1/categories`

| Method | Path | Body / result |
|--------|------|----------------|
| `GET` | `/api/v1/categories` | `Category[]` |
| `POST` | `/api/v1/categories` | `{ name, slug, description? }` |
| `DELETE` | `/api/v1/categories/{id}` | empty |

**Category**

```ts
{
  id: string;
  userId: string | null;  // null = system seed
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
}
```

### Providers — `ProviderService`

`apiUrl` = `/api/v1/providers`

| Method | Path | Body / result |
|--------|------|----------------|
| `GET` | `/api/v1/providers` | `Provider[]` |
| `POST` | `/api/v1/providers` | `{ name, slug, websiteUrl?, color?, logoUrl? }` |
| `DELETE` | `/api/v1/providers/{id}` | empty |

**Provider**

```ts
{
  id: string;
  userId: string | null;
  name: string;
  slug: string;
  websiteUrl: string | null;
  color: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
}
```

### Users — `UserService`

`apiUrl` = `/api/v1/users` — **admin only** (`403` for non-admins).

| Method | Path | Body / result |
|--------|------|----------------|
| `GET` | `/api/v1/users` | `User[]` |
| `POST` | `/api/v1/users` | see create body |
| `PATCH` | `/api/v1/users/{id}/status?enabled={bool}` | empty |

**Create body** (`CreateUserRequest`)

| Field | Required |
|-------|----------|
| `username` | yes |
| `email` | yes |
| `password` | yes |
| `firstName`, `lastName` | no |

**User**

```ts
{
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  enabled: boolean;
}
```

---

## Conventions

- Feature folders stay isolated; models and HTTP services live next to the feature that owns them (`page/categories`, `page/providers`, `page/users`, `password-manager`).
- Settings pages are **thin orchestrators** (load data, open/close modals). UI lives in nested `components/`.
- Component files are named `*.component.ts|html|scss`; guards/interceptors use `*.guard.ts` / `*.interceptor.ts`.
- User feedback goes through `NotificationService` — do not duplicate toast UI in feature pages.
- List/create data loads only in the browser (`isPlatformBrowser`) so SSR prerender does not hit the API.
- Surface panels use `.surface-panel` and the CSS variables above.
- Not implemented in the UI: category/provider get-by-id, update, user delete, inline create of categories/providers from the account modal.

---

## Scripts

| Command | What it does |
|---------|----------------|
| `npm start` / `ng serve` | Dev server + `/api` proxy |
| `ng build` | Production build → `dist/my-service-ui` |
| `ng build --watch --configuration development` | Watch build |
| `ng test` | Vitest |
| `npm run serve:ssr:my-service-ui` | Serve the SSR bundle (`dist/my-service-ui/server/server.mjs`) |

---

## Related repos

- **my-service** — Java API (accounts, categories, providers, users, auth)
- **my-service-infra** — infrastructure
- **my-service-crypto** — crypto helper used by the backend
