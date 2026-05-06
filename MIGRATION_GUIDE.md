# Wunschhimmel — Cloudflare Umzugsguide
> Automatisch aktuell gehalten. Letztes Update: 2026-05-04

## Wenn du umziehen willst — sage: "Ich will umziehen"
Ich packe dir dann alles fertig zusammen mit aktuellem Stand.

---

## Aktueller Stack

| Komponente | Runable (aktuell) | Cloudflare (selbst) |
|---|---|---|
| Worker/API | Runable managed | Cloudflare Workers (kostenlos) |
| Datenbank | D1 — ID: `f843a1f6-5a43-4398-9c0e-f489b51ab3bf` | Eigene D1 |
| Dateispeicher | R2 — `p34ftuts8rcin1xqp4xdz2pqgeyi76ez` | Eigenes R2 Bucket |
| E-Mail | Resend (eigener Key) ✅ | Resend (gleicher Key) |
| Auth | Better Auth (eigener Secret) ✅ | Better Auth (gleicher Secret) |

---

## Benötigte Secrets (diese hast du bereits)
```
BETTER_AUTH_SECRET=<dein secret>
RESEND_API_KEY=<dein key>
```

---

## Datenbank-Migrations (alle müssen eingespielt werden)

| Datei | Inhalt | Status Produktion |
|---|---|---|
| `0000_lively_absorbing_man.sql` | Basis-Schema (wishlists, wishes, users) | ✅ eingespielt |
| `0001_nostalgic_wolfsbane.sql` | share_invitations, list_updates | ✅ eingespielt |
| `0002_cultured_dragon_man.sql` | update_likes, update_comments | ✅ eingespielt |
| `0003_soft_madame_hydra.sql` | user_profiles.is_admin | ✅ eingespielt |
| `0004_product_click_tracking.sql` | product click tracking | ⚠️ PENDING (Runable Support) |
| `0005_wish_extra_fields.sql` | wishes: category, shop, notes | ⚠️ PENDING (Runable Support) |

---

## Umzugs-Schritte (vollständig)

### 1. Cloudflare Account
→ https://cloudflare.com → kostenlos registrieren

### 2. Wrangler installieren & einloggen
```bash
npm install -g wrangler
wrangler login
```

### 3. Code runterladen
→ Sage "Ich will umziehen" — ich packe den ZIP

### 4. Neue Infrastruktur anlegen
```bash
# D1 Datenbank
wrangler d1 create wunschhimmel
# → Gibt dir eine neue database_id — notieren!

# R2 Bucket für Bilder
wrangler r2 bucket create wunschhimmel-images
```

### 5. wrangler.json anpassen
Ersetze in `wrangler.json`:
```json
"database_name": "wunschhimmel",
"database_id": "<DEINE_NEUE_ID>",
...
"bucket_name": "wunschhimmel-images"
```

### 6. Alle Migrations einspielen
```bash
wrangler d1 migrations apply wunschhimmel --remote
```
→ Spielt automatisch alle SQL-Dateien in `src/api/migrations/` ein

### 7. Secrets setzen
```bash
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put RESEND_API_KEY
```

### 8. Bauen & deployen
```bash
bun run build
wrangler deploy
```

### 9. Domain (optional)
Im Cloudflare Dashboard → Workers → wunschhimmel → Custom Domain → wunschhimmel.com eintragen

### 10. Daten exportieren (von Runable)
Vor dem Umzug Runable Support anschreiben:
> "Bitte exportiert mir meine D1-Datenbank als SQLite-Dump für das Projekt wunschhimmel."

Dann auf neue D1 importieren:
```bash
wrangler d1 execute wunschhimmel --remote --file=export.sql
```

---

## Features & Abhängigkeiten

| Feature | Abhängigkeit | Migrierbar? |
|---|---|---|
| Auth / Login | Better Auth (self-hosted) | ✅ Ja |
| E-Mails | Resend API | ✅ Ja (gleicher Key) |
| Bilder Upload | R2 | ✅ Ja (neues Bucket) |
| Wunsch-Scraper | fetch() im Worker | ✅ Ja |
| Amazon Affiliate | Tag `wunschhimme00-21` | ✅ Ja |
| Awin Affiliate | Publisher ID `2864125` | ✅ Ja |

---

## Changelog (für Umzugs-Tracking)

### 2026-05-04
- AddWishSheet Component (Bottom Sheet, URL-Import, Manuell, Kategorien, Notizen, Händler)
- WishDetailModal Component (Vollansicht, Edit, Delete, Reservierung)
- WishCard überarbeitet (Tap → Modal, Kategorie/Shop/Notizen-Badges)
- list-detail.tsx neu (FAB, Stats-Bar, Kategorie-Filter, kein Horizontal-Scroll)
- shared.tsx neu (Reservierungs-Flow via Modal, Kategorie-Filter, Stats)
- DB Migration 0005: wishes.category, wishes.shop, wishes.notes
- DB Migration 0004: product click tracking (beide pending bei Runable Support)
- Mobile Fix: Modal z-index > RunableBadge (10001 vs 10000)
- Mobile Fix: overflow-x hidden global + Input min-width fix
