# API Recherche: Historische Instagram Follower-Daten

## 1. Social Blade API (Empfohlen für historische Daten)

**URL:** https://socialblade.com/developers
**Base URL:** https://matrix.sbapis.com/b

### Instagram Endpoints:

#### `/instagram/statistics` - Creator Statistics
- **Input:** Username
- **Output:** Umfangreiche Statistiken inkl. historischer Daten

**History Parameter:**
| Option | Credits | Daten |
|--------|---------|-------|
| default | 1 | bis 30 Tage |
| extended | 2 | bis 1 Jahr |
| archive | 3 | bis 3 Jahre |
| vault | 5 | bis 10 Jahre |

**Response enthält:**
- `statistics.total`: followers, following, media, engagement_rate
- `statistics.growth.followers`: 1, 3, 7, 14, 30, 60, 90, 180, 365 Tage
- `daily[]`: Tägliche Daten (date, followers, following, media, avg_likes, avg_comments)

**Beispiel Request:**
```bash
curl 'https://matrix.sbapis.com/b/instagram/statistics?query=username&history=default' \
  -H 'clientid: {CLIENT_ID}' \
  -H 'token: {CLIENT_SECRET}'
```

### Pricing:
- Credits müssen vorab gekauft werden
- 1 Credit = 1 Profil-Abfrage (30 Tage Daten)
- Nach Abfrage: 30 Tage kostenlose Updates für das Profil

---

## 2. Instagram Statistics API (RapidAPI)

**URL:** https://rapidapi.com/artemlipko/api/instagram-statistics-api
- Suche nach Accounts nach Land, Demografie, Kategorie
- Universal API für mehrere soziale Netzwerke

---

## 3. Instagram Statistical Analysis (RapidAPI)

**URL:** https://rapidapi.com/pradyumnacharate/api/instagram-statistical-analysis
- Lost Followers
- New Followers
- Post-Ranking nach Likes

---

## 4. NotJustAnalytics (Referenz)

**URL:** https://www.notjustanalytics.com/
- Zeigt wie historische Daten dargestellt werden sollten
- Follower-Wachstum Charts
- Engagement-Trends

---

## Empfehlung

**Social Blade API** ist die beste Option für historische Follower-Daten:
1. Bis zu 10 Jahre historische Daten verfügbar
2. Tägliche Datenpunkte (date, followers, following, etc.)
3. Wachstumsraten für verschiedene Zeiträume
4. Professionelle API mit guter Dokumentation

**Integration:**
1. Social Blade Developer Account erstellen
2. Credits kaufen
3. CLIENT_ID und CLIENT_SECRET als Secrets speichern
4. API in `server/services/socialBladeService.ts` integrieren
