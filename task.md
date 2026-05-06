# Wunschhimmel — Full UX Implementation

## Was implementiert wird

### 1. DB Schema-Erweiterungen
- `wishes`: + `category` (text), `shop` (text), `notes` (text) Felder
- Migration SQL schreiben

### 2. API-Erweiterungen
- addWish / updateWish: neue Felder entgegennehmen
- PATCH /api/wishes/:id — für Edit-Wish

### 3. Neues: AddWishSheet (Bottom Sheet Component)
- Tab 1: Link-Import mit Auto-Scrape-on-paste
- Tab 2: Manuelle Eingabe
- Felder: url, title, image, price, shop, category, priority, notes
- "Mehr Optionen" Accordion
- Swipe-down to close
- z-index > 10000

### 4. Neues: WishDetailModal
- Vollansicht eines Wunsches
- Tap auf Karte öffnet Modal (kein Seitenwechsel)
- Edit-Modus direkt drin
- Löschen mit Confirm

### 5. Überarbeitetes WishCard
- Tap → öffnet WishDetailModal (via callback)
- Kein eigener Delete-Button mehr (im Modal)
- Zeigt: shop badge, category badge, notes-indicator

### 6. Reservierungs-Flow (shared.tsx)
- Tap auf Karte → ReserveSheet (Bottom Sheet)
- Name eingeben, Bestätigung
- Reserviert-Status klar sichtbar
- Anonym gegenüber Besitzer

### 7. list-detail.tsx
- FAB "+" Button fixed bottom-center (über Badge)
- Öffnet AddWishSheet
- Filter-Tabs: Alle / Kategorie-Filter
- Wish-Karten öffnen WishDetailModal

### 8. Kategorien
- Vordefinierte Liste: Technik, Mode, Bücher, Sport, Zuhause, Reise, Essen, Spielzeug, Schönheit, Sonstiges
- Emoji pro Kategorie

## Reihenfolge
1. Migration + Schema
2. API-Route PATCH wishes
3. AddWishSheet Component
4. WishDetailModal Component  
5. WishCard update
6. list-detail.tsx update
7. shared.tsx Reservierungs-Update
8. Build + deliver
