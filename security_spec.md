# Security Specification & Red Team Verification

## 1. Data Invariants
1. Global default deny catch-all at top of ruleset.
2. Public visitors can ONLY read `siteSettings/main`, `professionalProfile/main`, `media`, and `empreendimentos`/`properties` where `published == true`, and `landingPages` where `status == 'published'`.
3. Public visitors can ONLY `create` documents in `leads`, `visitRequests`, and `analytics` with strict schema validation, forced initial status (`Novo` / `Pendente`), `createdAt == request.time`, and zero `read`/`list`/`update`/`delete` access (PII isolation).
4. Admin privileges require `request.auth != null && request.auth.token.email_verified == true` AND either bootstrapped owner email (`nonhu2490@gmail.com`) or an active `adminUsers/{uid}` document.
5. All IDs are validated against `^[a-zA-Z0-9_-]+$` and bounded to `<= 128` chars.
6. Every string field enforces `.size()` limits; every array enforces `.size() <= MAX`.
7. `createdAt` is immutable after creation (`incoming().createdAt == existing().createdAt`).

## 2. Dirty Dozen Attack Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated `list` on `/leads` -> DENIED (PII isolation).
2. Unauthenticated `get` on `/visitRequests/{id}` -> DENIED (PII isolation).
3. Unauthenticated `create` on `/leads/{id}` with ghost field `isVerified: true` -> DENIED (`hasOnly` check).
4. Unauthenticated `create` on `/leads/{id}` with forged `status: "Concluído"` -> DENIED (initial status must be `"Novo"`).
5. Unauthenticated `create` on `/leads/{id}` with backdated `createdAt` -> DENIED (`createdAt == request.time`).
6. Unauthenticated `create` on `/leads/{id}` with 1.5KB junk path ID -> DENIED (`isValidId`).
7. Authenticated non-admin user updating `/empreendimentos/{id}` -> DENIED (`isAdmin()`).
8. Authenticated non-admin user creating `/adminUsers/{uid}` to escalate privilege -> DENIED (`isAdmin()`).
9. Spoofed admin email with `email_verified: false` writing `/siteSettings/main` -> DENIED (`email_verified == true`).
10. Public `list` on `/empreendimentos` without `where('published', '==', true)` -> DENIED (resource.data.published == true enforced in `allow list`).
11. Public `list` on `/landingPages` fetching paused/draft pages -> DENIED (`resource.data.status == 'published'` enforced).
12. Unauthenticated `delete` on `/analytics/{id}` -> DENIED (`isAdmin()`).
