# RapidAPI Setup-Anleitung für ReelSpy.ai

Diese Anleitung erklärt, wie du RapidAPI für echte Instagram-Daten konfigurierst und die Credits verwaltest.

---

## 1. RapidAPI Account erstellen

### Schritt 1: Registrierung

1. Gehe zu [RapidAPI.com](https://rapidapi.com)
2. Klicke auf **Sign Up** (oben rechts)
3. Registriere dich mit Google, GitHub oder E-Mail
4. Bestätige deine E-Mail-Adresse

### Schritt 2: API abonnieren

1. Suche nach **"Instagram Scraper API"** oder **"Instagram Data"**
2. Empfohlene APIs (getestet und kompatibel):
   - **Instagram Scraper API 2023** (von yukimaru)
   - **Instagram Data** (von logicbuilder)
   - **Instagram Profile** (von api-dojo)

3. Klicke auf **Subscribe** und wähle einen Plan:

| Plan | Preis | Requests/Monat | Empfehlung |
|------|-------|----------------|------------|
| Free | $0 | 100-500 | Zum Testen |
| Basic | $9-19 | 5.000-10.000 | Kleine Teams |
| Pro | $29-49 | 50.000-100.000 | Agenturen |
| Ultra | $99+ | 500.000+ | Enterprise |

### Schritt 3: API-Key kopieren

1. Nach dem Abonnieren, gehe zu **Dashboard → My Apps**
2. Klicke auf deine App (oder erstelle eine neue)
3. Kopiere den **X-RapidAPI-Key** (sieht aus wie: `a1b2c3d4e5...`)

---

## 2. API-Key in ReelSpy.ai eintragen

### Option A: Über Manus UI (empfohlen)

1. Öffne dein Projekt in Manus
2. Gehe zu **Settings → Secrets**
3. Finde `RAPIDAPI_KEY`
4. Klicke auf **Edit** und füge deinen Key ein
5. Speichere die Änderungen

### Option B: Über .env Datei (lokal)

```bash
# .env
RAPIDAPI_KEY=dein_rapidapi_key_hier
```

---

## 3. API-Konfiguration prüfen

Nach dem Eintragen des Keys, teste die Verbindung:

1. Gehe zu ReelSpy.ai
2. Analysiere einen bekannten Account (z.B. `@instagram`)
3. Prüfe, ob echte Daten angezeigt werden (kein "Demo-Daten" Badge)

### Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| "Demo-Daten" wird angezeigt | API-Key prüfen, Rate-Limit erreicht? |
| 401 Unauthorized | Key ist ungültig oder abgelaufen |
| 429 Too Many Requests | Rate-Limit erreicht, Plan upgraden |
| Account nicht gefunden | Username prüfen, privater Account? |

---

## 4. Credits und Kosten verstehen

### Wie ReelSpy.ai Credits funktionieren

ReelSpy.ai verwendet ein eigenes Credit-System, das **unabhängig** von RapidAPI ist:

| Aktion | ReelSpy Credits | RapidAPI Requests |
|--------|-----------------|-------------------|
| Basis-Analyse | 1 Credit | 2-3 Requests |
| KI-Analyse | 5 Credits | 2-3 Requests + LLM |
| PDF-Export | 2 Credits | 0 Requests |
| Account-Vergleich | 3 Credits | 4-6 Requests |

### Kostenrechnung

**Beispiel: 100 KI-Analysen/Monat**

| Posten | Kosten |
|--------|--------|
| RapidAPI (Basic Plan) | ~$19/Monat |
| LLM-Kosten (OpenAI) | ~$5-10/Monat |
| **Gesamt** | ~$25-30/Monat |

Bei einem Verkaufspreis von €49/Monat (Pro Plan) ergibt das eine **Marge von ~40-50%**.

---

## 5. Rate-Limits optimieren

### Caching aktivieren (bereits eingebaut)

ReelSpy.ai cached automatisch:
- Instagram-Analysen: 5 Minuten
- TikTok-Analysen: 1 Stunde
- YouTube-Analysen: 1 Stunde

### Tipps zur Optimierung

1. **Beliebte Accounts cachen länger**: Accounts mit >1M Followern ändern sich selten
2. **Batch-Requests vermeiden**: Nicht 10 Accounts gleichzeitig analysieren
3. **Off-Peak nutzen**: Weniger Traffic = schnellere Antworten

---

## 6. Fallback-System

ReelSpy.ai hat ein mehrstufiges Fallback-System:

```
1. RapidAPI (primär)
   ↓ (bei Fehler)
2. Manus Data API (Backup)
   ↓ (bei Fehler)
3. Demo-Daten (letzter Ausweg)
```

**Wichtig:** Demo-Daten werden nur angezeigt, wenn beide APIs fehlschlagen. Der User sieht dann ein "Demo-Daten" Badge.

---

## 7. Alternative APIs

Falls RapidAPI nicht funktioniert, hier sind Alternativen:

| API | Preis | Qualität | URL |
|-----|-------|----------|-----|
| Apify | $49+/Monat | Sehr gut | apify.com |
| Bright Data | $500+/Monat | Enterprise | brightdata.com |
| ScrapingBee | $49+/Monat | Gut | scrapingbee.com |

**Hinweis:** Diese APIs erfordern Code-Änderungen in `server/instagram.ts`.

---

## 8. Häufige Fragen

### Warum sehe ich "Demo-Daten"?

1. RapidAPI-Key nicht eingetragen
2. Rate-Limit erreicht
3. API temporär nicht erreichbar
4. Account ist privat oder existiert nicht

### Wie viele Analysen kann ich pro Tag machen?

| RapidAPI Plan | Analysen/Tag |
|---------------|--------------|
| Free | ~30-50 |
| Basic | ~150-300 |
| Pro | ~1.500-3.000 |

### Werden meine Credits automatisch aufgeladen?

Nein, ReelSpy.ai Credits werden separat über Stripe gekauft. RapidAPI-Requests sind unabhängig davon.

### Kann ich mehrere API-Keys verwenden?

Aktuell nicht. Das System verwendet einen globalen Key. Für Load-Balancing wäre eine Code-Änderung nötig.

---

## Support

Bei Fragen zur API-Konfiguration:
- E-Mail: report@reelspy.ai
- Admin: qliq.marketing@proton.me

---

*Letzte Aktualisierung: Dezember 2024*
