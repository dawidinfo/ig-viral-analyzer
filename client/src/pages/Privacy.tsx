import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalFooter } from "@/components/GlobalFooter";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function Privacy() {
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
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Privacy Policy</h1>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Last updated: December 24, 2025
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. Data Controller</h2>
            <p className="text-muted-foreground mb-4">
              The data controller for this website is:
            </p>
            <div className="text-muted-foreground">
              <p className="font-medium">QLIQ Marketing L.L.C.</p>
              <p>Dubai Branch Building</p>
              <p>Office 1-141-278, Mankhool</p>
              <p>Dubai, UAE</p>
              <p>Reg. No. 2580137</p>
              <p className="mt-2">Email: <span className="text-primary">report[at]reelspy.ai</span></p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Erhobene Daten</h2>
            <p className="text-muted-foreground mb-4">
              Wir erheben und verarbeiten folgende personenbezogene Daten:
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Registrierungsdaten</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>E-Mail-Adresse</li>
              <li>Name (optional)</li>
              <li>Profilbild (bei OAuth-Login)</li>
              <li>OAuth-Identifikator</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Nutzungsdaten</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Analysierte Social-Media-Accounts (Benutzernamen)</li>
              <li>Zeitpunkt und Art der durchgeführten Analysen</li>
              <li>Credit-Verbrauch und Transaktionshistorie</li>
              <li>Gespeicherte Analysen und Favoriten</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Technische Daten</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>IP-Adresse (anonymisiert)</li>
              <li>Browser-Typ und -Version</li>
              <li>Betriebssystem</li>
              <li>Referrer-URL</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Zweck der Datenverarbeitung</h2>
            <p className="text-muted-foreground mb-4">
              Wir verarbeiten Ihre Daten für folgende Zwecke:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Bereitstellung und Verbesserung unserer Dienste</li>
              <li>Verwaltung Ihres Benutzerkontos</li>
              <li>Abrechnung und Zahlungsabwicklung</li>
              <li>Kundensupport und Kommunikation</li>
              <li>Sicherheit und Betrugsprävention</li>
              <li>Statistische Auswertungen (anonymisiert)</li>
              <li>Erfüllung rechtlicher Verpflichtungen</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Rechtsgrundlagen</h2>
            <p className="text-muted-foreground mb-4">
              Die Verarbeitung erfolgt auf Basis folgender Rechtsgrundlagen (DSGVO):
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Art. 6 Abs. 1 lit. a:</strong> Einwilligung (z.B. Newsletter)</li>
              <li><strong>Art. 6 Abs. 1 lit. b:</strong> Vertragserfüllung (Bereitstellung der Dienste)</li>
              <li><strong>Art. 6 Abs. 1 lit. c:</strong> Rechtliche Verpflichtung (Aufbewahrungspflichten)</li>
              <li><strong>Art. 6 Abs. 1 lit. f:</strong> Berechtigtes Interesse (Sicherheit, Analyse)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Datenweitergabe</h2>
            <p className="text-muted-foreground mb-4">
              Wir geben Ihre Daten nur in folgenden Fällen an Dritte weiter:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Zahlungsdienstleister:</strong> Stripe für die Zahlungsabwicklung</li>
              <li><strong>Hosting-Anbieter:</strong> Für den Betrieb unserer Server (EU-Standort)</li>
              <li><strong>API-Anbieter:</strong> Für Social-Media-Daten (nur öffentliche Daten)</li>
              <li><strong>Behörden:</strong> Bei rechtlicher Verpflichtung</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Eine Weitergabe zu Werbezwecken erfolgt nicht.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. Cookies und Tracking</h2>
            <p className="text-muted-foreground mb-4">
              Wir verwenden folgende Cookies:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>Notwendige Cookies:</strong> Für Login und Session-Management</li>
              <li><strong>Funktionale Cookies:</strong> Für Benutzereinstellungen (Theme, Sprache)</li>
              <li><strong>Analyse-Cookies:</strong> Für anonymisierte Nutzungsstatistiken (optional)</li>
            </ul>
            <p className="text-muted-foreground">
              Sie können Cookies in Ihren Browsereinstellungen deaktivieren. Dies kann jedoch 
              die Funktionalität der Website einschränken.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. Speicherdauer</h2>
            <p className="text-muted-foreground mb-4">
              Wir speichern Ihre Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Kontodaten:</strong> Bis zur Löschung des Accounts</li>
              <li><strong>Analysedaten:</strong> 12 Monate nach der letzten Aktivität</li>
              <li><strong>Rechnungsdaten:</strong> 10 Jahre (gesetzliche Aufbewahrungspflicht)</li>
              <li><strong>Log-Daten:</strong> 30 Tage</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">8. Ihre Rechte</h2>
            <p className="text-muted-foreground mb-4">
              Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Erfahren Sie, welche Daten wir über Sie speichern</li>
              <li><strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Korrigieren Sie unrichtige Daten</li>
              <li><strong>Löschungsrecht (Art. 17 DSGVO):</strong> Lassen Sie Ihre Daten löschen</li>
              <li><strong>Einschränkungsrecht (Art. 18 DSGVO):</strong> Schränken Sie die Verarbeitung ein</li>
              <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Erhalten Sie Ihre Daten in einem gängigen Format</li>
              <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Widersprechen Sie der Verarbeitung</li>
              <li><strong>Widerruf der Einwilligung (Art. 7 DSGVO):</strong> Widerrufen Sie erteilte Einwilligungen</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter privacy@reelspy.ai.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">9. Beschwerderecht</h2>
            <p className="text-muted-foreground">
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die 
              Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">10. Datensicherheit</h2>
            <p className="text-muted-foreground mb-4">
              Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten zu schützen:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen</li>
              <li>Verschlüsselte Speicherung sensibler Daten</li>
              <li>Regelmäßige Sicherheitsupdates</li>
              <li>Zugriffskontrolle und Protokollierung</li>
              <li>Regelmäßige Backups</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">11. Analyse von Social-Media-Inhalten</h2>
            <p className="text-muted-foreground mb-4">
              Bei der Analyse von Social-Media-Accounts verarbeiten wir ausschließlich 
              öffentlich zugängliche Daten. Wir speichern:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Den analysierten Benutzernamen</li>
              <li>Öffentliche Profilinformationen zum Zeitpunkt der Analyse</li>
              <li>Aggregierte Metriken (keine einzelnen Follower-Daten)</li>
              <li>Die generierten Analyseergebnisse</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Wir greifen nicht auf private Nachrichten, nicht-öffentliche Inhalte oder 
              persönliche Daten Dritter zu.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">12. Änderungen</h2>
            <p className="text-muted-foreground">
              Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. 
              Die aktuelle Version ist stets auf dieser Seite verfügbar. Bei wesentlichen 
              Änderungen informieren wir Sie per E-Mail.
            </p>
          </section>

          <section className="mb-12 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Contact for Privacy Inquiries</h2>
            <p className="text-muted-foreground">
              For privacy-related questions, please contact us:
            </p>
            <div className="mt-4">
              <p className="font-medium">QLIQ Marketing L.L.C.</p>
              <p className="text-muted-foreground">Dubai Branch Building</p>
              <p className="text-muted-foreground">Office 1-141-278, Mankhool</p>
              <p className="text-muted-foreground">Dubai, UAE</p>
              <p className="text-muted-foreground mt-2">
                Email: <span className="text-primary">report[at]reelspy.ai</span>
              </p>
            </div>
          </section>
        </div>
      </main>
      
      <GlobalFooter />
    </div>
  );
}
