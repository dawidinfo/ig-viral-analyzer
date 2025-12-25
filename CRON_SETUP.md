# Cron-Job Einrichtung für ReelSpy.ai

## Übersicht

Der tägliche Cron-Job führt folgende Aufgaben aus:
- **Drip-Campaign E-Mails** versenden (Onboarding-Sequenz für neue Nutzer)
- **Follower-Tracking** für alle gespeicherten Accounts aktualisieren
- **Datenbereinigung** alter Cache-Einträge

## Einrichtung auf cron-job.org

### 1. Account erstellen
1. Gehe zu [cron-job.org](https://cron-job.org)
2. Erstelle einen kostenlosen Account (bis 3 Jobs kostenlos)

### 2. Neuen Cron-Job erstellen

**URL:**
```
https://igviralana-2nevkskx.manus.space/api/cron/daily?secret=reelspy-cron-2024
```

**Einstellungen:**
- **Title:** ReelSpy Daily Tasks
- **URL:** (siehe oben)
- **Schedule:** Täglich um 08:00 Uhr
- **Timezone:** Europe/Berlin
- **Request Method:** GET
- **Request Timeout:** 120 Sekunden

### 3. Cron-Expression (Alternative)

Falls du einen anderen Dienst nutzt:
```
0 8 * * *
```
(Täglich um 08:00 Uhr)

## Sicherheit

### Secret ändern (empfohlen)

1. Gehe zu **Settings → Secrets** im Manus Dashboard
2. Füge ein neues Secret hinzu: `CRON_SECRET`
3. Generiere ein sicheres Secret (z.B. mit `openssl rand -hex 32`)
4. Aktualisiere die URL in cron-job.org mit dem neuen Secret

### Beispiel mit sicherem Secret:
```
https://igviralana-2nevkskx.manus.space/api/cron/daily?secret=DEIN_SICHERES_SECRET
```

## Webhook-Konfiguration (Optional)

Für Echtzeit-Benachrichtigungen bei Sicherheitsereignissen:

### Slack Webhook
1. Gehe zu [api.slack.com/apps](https://api.slack.com/apps)
2. Erstelle eine neue App → Incoming Webhooks aktivieren
3. Kopiere die Webhook-URL
4. Füge in Manus Settings → Secrets hinzu: `SLACK_WEBHOOK_URL`

### Discord Webhook
1. Server-Einstellungen → Integrationen → Webhooks
2. Neuen Webhook erstellen
3. Kopiere die Webhook-URL
4. Füge in Manus Settings → Secrets hinzu: `DISCORD_WEBHOOK_URL`

## Testen

### Manueller Test
```bash
curl "https://igviralana-2nevkskx.manus.space/api/cron/daily?secret=reelspy-cron-2024"
```

### Erwartete Antwort
```json
{
  "success": true,
  "dripCampaign": { "emailsSent": 5 },
  "followerTracking": { "accountsTracked": 10 },
  "timestamp": "2024-12-25T08:00:00.000Z"
}
```

## Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| 401 Unauthorized | Secret in URL prüfen |
| 500 Server Error | Server-Logs prüfen |
| Timeout | Request Timeout erhöhen |
| Keine E-Mails | Resend API Key prüfen |

## Alternative Dienste

Falls cron-job.org nicht funktioniert:
- [EasyCron](https://www.easycron.com/)
- [Cronitor](https://cronitor.io/)
- [GitHub Actions](https://github.com/features/actions) (kostenlos)

### GitHub Actions Beispiel

```yaml
name: Daily Cron
on:
  schedule:
    - cron: '0 8 * * *'
jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cron
        run: |
          curl -X GET "https://igviralana-2nevkskx.manus.space/api/cron/daily?secret=${{ secrets.CRON_SECRET }}"
```

## Support

Bei Fragen oder Problemen: support@reelspy.ai
