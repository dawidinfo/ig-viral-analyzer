# Störender Balken in Heatmap

Der User hat einen weißen/hellen Balken oben rechts in der Heatmap gemeldet (bei Sonntag 23:00-24:00 Bereich).

Dies könnte sein:
1. Ein fehlerhaftes Heatmap-Feld mit falscher Farbe
2. Ein Debug-Element
3. Ein Scrollbar oder UI-Artefakt

Zu prüfen: PostingTimeAnalysis.tsx und BestPostingTime.tsx
