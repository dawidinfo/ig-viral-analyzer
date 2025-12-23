import { Link } from "wouter";
import { ArrowLeft, AlertTriangle, Info, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalFooter } from "@/components/GlobalFooter";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Disclaimer / Haftungsausschluss</h1>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Letzte Aktualisierung: 24. Dezember 2025
          </p>

          {/* Important Notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 mb-12">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-amber-500 mb-2">Wichtiger Hinweis</h3>
                <p className="text-muted-foreground">
                  ReelSpy.ai ist ein Analyse-Tool und bietet keine Garantie für den Erfolg Ihrer 
                  Social-Media-Aktivitäten. Die bereitgestellten Daten und Empfehlungen dienen 
                  ausschließlich zu Informationszwecken.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              1. Allgemeiner Haftungsausschluss
            </h2>
            <p className="text-muted-foreground mb-4">
              Die Inhalte und Analysen auf ReelSpy.ai werden mit größtmöglicher Sorgfalt erstellt. 
              QLIQ Marketing L.L.C. übernimmt jedoch keine Gewähr für die Richtigkeit, Vollständigkeit 
              und Aktualität der bereitgestellten Informationen.
            </p>
            <p className="text-muted-foreground mb-4">
              Die Nutzung der Inhalte erfolgt auf eigene Gefahr des Nutzers. Mit der reinen Nutzung 
              der Website kommt keinerlei Vertragsverhältnis zwischen dem Nutzer und dem Anbieter zustande.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Keine Erfolgsgarantie</h2>
            <p className="text-muted-foreground mb-4">
              ReelSpy.ai analysiert Social-Media-Inhalte basierend auf historischen Daten und 
              KI-gestützten Algorithmen. Die Ergebnisse stellen Einschätzungen und Empfehlungen dar, 
              jedoch:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Garantieren wir <strong>keinen</strong> viralen Erfolg Ihrer Inhalte</li>
              <li>Können wir <strong>keine</strong> bestimmte Reichweite oder Engagement-Rate zusichern</li>
              <li>Sind vergangene Ergebnisse <strong>kein</strong> Indikator für zukünftige Performance</li>
              <li>Unterliegen Social-Media-Algorithmen ständigen Änderungen außerhalb unserer Kontrolle</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Datengenauigkeit</h2>
            <p className="text-muted-foreground mb-4">
              Die angezeigten Metriken und Statistiken werden von Drittanbieter-APIs bezogen. 
              Wir bemühen uns um Genauigkeit, können jedoch nicht garantieren, dass:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Follower-Zahlen in Echtzeit aktuell sind</li>
              <li>Engagement-Raten exakt den Plattform-Daten entsprechen</li>
              <li>Historische Daten vollständig verfügbar sind</li>
              <li>API-Daten fehlerfrei übermittelt werden</li>
            </ul>
            <p className="text-muted-foreground">
              Bei Abweichungen zwischen unseren Daten und den offiziellen Plattform-Statistiken 
              sind letztere maßgeblich.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. KI-generierte Inhalte</h2>
            <p className="text-muted-foreground mb-4">
              ReelSpy.ai verwendet künstliche Intelligenz für:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Analyse von Viral-Faktoren und Content-Qualität</li>
              <li>Generierung von Verbesserungsvorschlägen</li>
              <li>Erstellung von Caption-Empfehlungen</li>
              <li>Bewertung nach dem HAPSS-Framework</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              KI-generierte Inhalte können Fehler enthalten und sollten vor der Verwendung 
              überprüft werden. Die finale Entscheidung über die Nutzung liegt beim User.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Externe Links</h2>
            <p className="text-muted-foreground mb-4">
              Unsere Website kann Links zu externen Websites Dritter enthalten, auf deren Inhalte 
              wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der 
              jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
            <p className="text-muted-foreground">
              Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße 
              überprüft. Eine permanente inhaltliche Kontrolle ist jedoch ohne konkrete Anhaltspunkte 
              nicht zumutbar.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. Haftungsbeschränkung</h2>
            <p className="text-muted-foreground mb-4">
              QLIQ Marketing L.L.C. haftet nicht für:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Direkte oder indirekte Schäden aus der Nutzung der Analysen</li>
              <li>Entgangene Gewinne oder Geschäftsmöglichkeiten</li>
              <li>Verlust von Daten oder Reputation</li>
              <li>Schäden durch Ausfälle oder Unterbrechungen des Dienstes</li>
              <li>Handlungen Dritter (z.B. Plattform-Sperrungen)</li>
            </ul>
            <p className="text-muted-foreground">
              Diese Haftungsbeschränkung gilt nicht für Schäden aus der Verletzung des Lebens, 
              des Körpers oder der Gesundheit sowie bei Vorsatz oder grober Fahrlässigkeit.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. Keine Anlageberatung</h2>
            <p className="text-muted-foreground mb-4">
              Informationen über Monetarisierung, Einnahmen oder Geschäftspotenziale auf dieser 
              Plattform stellen keine Finanz- oder Anlageberatung dar. Entscheidungen über 
              Investitionen in Social-Media-Marketing sollten mit qualifizierten Beratern 
              besprochen werden.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              8. Markenrechte
            </h2>
            <p className="text-muted-foreground mb-4">
              Instagram, TikTok, YouTube und andere erwähnte Plattformen sind eingetragene 
              Marken ihrer jeweiligen Eigentümer. ReelSpy.ai ist nicht mit diesen Unternehmen 
              verbunden, wird nicht von ihnen unterstützt oder gesponsert.
            </p>
            <p className="text-muted-foreground">
              Die Verwendung dieser Markennamen dient ausschließlich der Beschreibung der 
              Funktionalität unseres Dienstes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">9. Änderungen</h2>
            <p className="text-muted-foreground mb-4">
              Wir behalten uns vor, diesen Disclaimer jederzeit ohne vorherige Ankündigung zu ändern. 
              Die jeweils aktuelle Version ist auf dieser Seite verfügbar. Durch die fortgesetzte 
              Nutzung unserer Dienste nach Änderungen stimmen Sie den aktualisierten Bedingungen zu.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">10. Kontakt</h2>
            <p className="text-muted-foreground mb-4">
              Bei Fragen zu diesem Disclaimer kontaktieren Sie uns:
            </p>
            <div className="bg-card/50 border border-border rounded-lg p-6">
              <p className="text-muted-foreground mb-2">
                <strong>QLIQ Marketing L.L.C.</strong>
              </p>
              <p className="text-muted-foreground mb-2">
                Dubai, United Arab Emirates
              </p>
              <p className="text-muted-foreground mb-2">
                Registrierungsnummer: 2580137
              </p>
              <p className="text-muted-foreground">
                E-Mail: <a href="mailto:report@reelspy.ai" className="text-primary hover:underline">report@reelspy.ai</a>
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">11. Anwendbares Recht</h2>
            <p className="text-muted-foreground">
              Dieser Disclaimer unterliegt dem Recht der Vereinigten Arabischen Emirate. 
              Gerichtsstand ist Dubai, VAE, soweit gesetzlich zulässig.
            </p>
          </section>
        </div>
      </main>

      <GlobalFooter />
    </div>
  );
}
