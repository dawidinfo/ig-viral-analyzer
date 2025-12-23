# ReelSpy.ai - Deployment & Live-Betrieb Guide

Diese Dokumentation erklärt, wie du ReelSpy.ai live schalten, mit echten Daten arbeiten und sicher weiterentwickeln kannst, ohne dass User-Daten verloren gehen.

---

## 1. Aktueller Status

### Was funktioniert bereits

| Komponente | Status | Details |
|------------|--------|---------|
| **Instagram API** | ✅ Live | RapidAPI + Manus Data API als Fallback |
| **TikTok API** | ✅ Live | Manus Data API mit 1h Caching |
| **YouTube API** | ✅ Live | Manus Data API mit 1h Caching |
| **Stripe Zahlungen** | ⚠️ Test-Modus | Sandbox aktiv, Test-Karte: 4242 4242 4242 4242 |
| **E-Mail (Resend)** | ✅ Live | Willkommens-E-Mails, Admin-Benachrichtigungen |
| **Datenbank** | ✅ Live | PostgreSQL mit allen User-Daten |
| **OAuth Login** | ✅ Live | Manus OAuth System |
| **Follower-Tracking** | ✅ Live | Tägliche Snapshots um 3:00 Uhr |

### Was noch fehlt für echte Zahlungen

1. **Stripe Live-Keys** - Nach KYC-Verifizierung bei Stripe
2. **Custom Domain** - DNS bei Hostinger konfigurieren

---

## 2. Echte Daten vs. Demo-Modus

### So funktioniert das System

Die APIs arbeiten bereits mit echten Daten. Der Demo-Fallback greift nur, wenn:
- Die API nicht erreichbar ist
- Rate-Limits überschritten wurden
- Der Account nicht gefunden wird

```
Echte Daten → RapidAPI/Manus Data API
     ↓ (bei Fehler)
Demo-Fallback → Generierte Beispieldaten
```

### API Rate-Limits

| Plattform | Limit | Caching |
|-----------|-------|---------|
| Instagram | ~100 Requests/Tag (RapidAPI Free) | 5 Min |
| TikTok | Unbegrenzt (Manus Data API) | 1 Stunde |
| YouTube | Unbegrenzt (Manus Data API) | 1 Stunde |

**Empfehlung für mehr Requests:** RapidAPI Paid Plan für Instagram (~$10-50/Monat)

---

## 3. Live gehen - Schritt für Schritt

### Schritt 1: Stripe Live-Keys aktivieren

1. Gehe zu [Stripe Dashboard](https://dashboard.stripe.com)
2. Schließe die KYC-Verifizierung ab (Identität, Bankkonto)
3. Wechsle von "Test mode" zu "Live mode"
4. Kopiere die Live-Keys:
   - `STRIPE_SECRET_KEY` (sk_live_...)
   - `STRIPE_PUBLISHABLE_KEY` (pk_live_...)
5. In Manus: **Settings → Secrets** → Keys aktualisieren

### Schritt 2: Domain konfigurieren (Hostinger)

Bei Hostinger DNS-Einstellungen:

```
Typ: CNAME
Name: @ (oder www)
Ziel: [Deine Manus Domain].manus.space
TTL: 3600
```

Oder A-Record:
```
Typ: A
Name: @
Ziel: [Manus IP-Adresse]
TTL: 3600
```

**Hinweis:** Die genaue Manus-Domain findest du nach dem Publish unter **Dashboard → Domains**.

### Schritt 3: Veröffentlichen

1. Stelle sicher, dass ein Checkpoint gespeichert ist
2. Klicke auf **Publish** im Manus UI (oben rechts)
3. Warte auf Deployment (~2-5 Minuten)
4. Teste alle Funktionen auf der Live-URL

---

## 4. Sichere Weiterentwicklung

### Checkpoints = Deine Versicherung

Jeder Checkpoint ist ein vollständiger Snapshot deiner App:
- Code
- Konfiguration
- Umgebungsvariablen

**User-Daten (Datenbank) werden NICHT im Checkpoint gespeichert!**

### Workflow für sichere Updates

```
1. Änderungen entwickeln (im Dev-Server)
2. Testen (pnpm test)
3. Checkpoint speichern
4. Publish
5. Live testen
6. Bei Problemen: Rollback zum vorherigen Checkpoint
```

### Was bei einem Rollback passiert

| Was wird zurückgesetzt | Was bleibt erhalten |
|------------------------|---------------------|
| ✅ Code | ✅ User-Daten |
| ✅ Frontend | ✅ Zahlungen |
| ✅ API-Routen | ✅ Analysen |
| ✅ Konfiguration | ✅ Credits |

**Wichtig:** User-Daten in der Datenbank sind unabhängig von Checkpoints!

### Datenbank-Migrationen

Bei Schema-Änderungen:

```bash
# Schema ändern in drizzle/schema.ts
# Dann:
pnpm db:push
```

**Vorsicht:** Spalten löschen = Datenverlust! Immer erst Backup machen.

---

## 5. Zahlungs-Status im Detail

### Stripe Integration - Was ist eingerichtet

| Feature | Status |
|---------|--------|
| Checkout Sessions | ✅ Funktioniert |
| Webhook für Zahlungen | ✅ Konfiguriert |
| Credit-Gutschrift | ✅ Automatisch |
| Zahlungshistorie | ✅ Im Dashboard |
| Rechnungen/Invoices | ✅ PDF-Download |

### Preise und Pakete

| Paket | Preis | Credits | Marge |
|-------|-------|---------|-------|
| Starter | €19 | 10 KI-Analysen | ~75% |
| Pro | €49 | 35 KI-Analysen | ~75% |
| Business | €99 | 100 KI-Analysen | ~75% |

### Webhook-URL für Stripe

Nach dem Publish musst du den Webhook in Stripe aktualisieren:

```
https://reelspy.ai/api/stripe/webhook
```

Oder deine Manus-Domain:
```
https://[deine-domain].manus.space/api/stripe/webhook
```

---

## 6. Monitoring & Logs

### Admin-Dashboard

Zugang: `/admin` (nur für qliq.marketing@proton.me)

Features:
- User-Übersicht mit Statistiken
- Umsatz-Tracking
- Verdächtige Aktivitäten
- Follower-Tracking Status

### E-Mail-Benachrichtigungen

Du erhältst automatisch E-Mails bei:
- Neuen Registrierungen
- Käufen/Upgrades
- Verdächtigen Aktivitäten

---

## 7. Checkliste vor Go-Live

- [ ] Stripe KYC abgeschlossen
- [ ] Stripe Live-Keys eingetragen
- [ ] Domain bei Hostinger konfiguriert
- [ ] Webhook-URL in Stripe aktualisiert
- [ ] Alle Funktionen getestet
- [ ] Checkpoint gespeichert
- [ ] Publish durchgeführt
- [ ] Live-Seite getestet
- [ ] Erste Test-Zahlung durchgeführt

---

## 8. Häufige Fragen

### Kann ich Updates machen ohne User-Daten zu verlieren?

**Ja!** Die Datenbank ist unabhängig von Checkpoints. Du kannst beliebig viele Updates machen.

### Was passiert bei einem Fehler nach dem Publish?

Rollback zum vorherigen Checkpoint. User-Daten bleiben erhalten.

### Wie erhöhe ich die API-Limits?

Für Instagram: RapidAPI Paid Plan kaufen und `RAPIDAPI_KEY` aktualisieren.

### Kann ich die Preise ändern?

Ja, in `client/src/pages/Pricing.tsx` und `server/routers/payment.ts`. Dann Checkpoint + Publish.

---

## Support

Bei Fragen oder Problemen:
- E-Mail: report@reelspy.ai
- Admin: qliq.marketing@proton.me

---

*Letzte Aktualisierung: Dezember 2024*
