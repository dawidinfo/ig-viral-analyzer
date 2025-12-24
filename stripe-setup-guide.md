# Stripe Einrichtung - Produkte erstellen

## Deine Pakete (für Stripe)

| Plan | Preis/Monat | Preis/Jahr (-20%) | KI-Analysen |
|------|-------------|-------------------|-------------|
| Free | €0 | - | 3 (einmalig) |
| Starter | €19 | €182,40 (€15,20/Mo) | 10/Monat |
| Pro | €49 | €470,40 (€39,20/Mo) | 35/Monat |
| Business | €99 | €950,40 (€79,20/Mo) | 100/Monat |
| Enterprise | €299 | €2.870,40 (€239,20/Mo) | Unbegrenzt |

## Stripe Einrichtung - Schritt für Schritt

### 1. Vorgefertigtes Formular (Checkout) - ✅ Bereits ausgewählt
Du hast die richtige Option gewählt. Klicke auf "Speichern".

### 2. Produkte in Stripe erstellen
Nach dem Speichern musst du für jeden Plan ein Produkt erstellen:

**Für jeden Plan:**
1. Gehe zu "Produkte" → "Produkt erstellen"
2. Name: z.B. "ReelSpy Starter"
3. Preis: €19/Monat (wiederkehrend)
4. Optional: Jahrespreis als zweite Preisoption

**Wichtig:** Notiere dir die Stripe Price IDs (z.B. price_1ABC...) - diese brauchen wir für die Integration.

### 3. Checkout-Integration
Die App verwendet bereits Stripe Checkout. Du musst nur die Price IDs in den Umgebungsvariablen aktualisieren.

## Nächste Schritte in Stripe
1. ✅ Zahlungsintegration wählen (erledigt)
2. ⏳ Produkte erstellen (als nächstes)
3. ⏳ Checkout testen
4. ⏳ Unternehmen verifizieren
5. ⏳ Live gehen
