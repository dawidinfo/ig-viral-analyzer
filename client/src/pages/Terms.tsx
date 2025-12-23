import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalFooter } from "@/components/GlobalFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function Terms() {
  const { t } = useLanguage();
  
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
              <h1 className="text-xl font-bold">Terms of Service</h1>
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
            <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing or using ReelSpy.ai ("Service"), operated by QLIQ Marketing L.L.C., 
              a company registered in Dubai, UAE (Reg. No. 2580137), you agree to be bound by 
              these Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Leistungsbeschreibung</h2>
            <p className="text-muted-foreground mb-4">
              ReelSpy.ai bietet eine KI-gestützte Analyseplattform für Social-Media-Inhalte, 
              insbesondere Instagram Reels, TikTok-Videos und YouTube-Inhalte. Die Plattform analysiert:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Engagement-Metriken und Viralitäts-Potenzial</li>
              <li>Content-Strukturen nach dem HAPSS-Framework</li>
              <li>Posting-Zeiten und Wachstumsmuster</li>
              <li>Hashtag-Performance und Reichweite</li>
              <li>Copywriting-Qualität nach etablierten Frameworks</li>
            </ul>
            <p className="text-muted-foreground">
              Die Analyse basiert auf über 3.000 KI-Parametern und 47 Viralitäts-Faktoren.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Vertragsschluss und Credit-System</h2>
            <p className="text-muted-foreground mb-4">
              3.1 Der Vertrag kommt durch Registrierung und Akzeptanz dieser AGB zustande.
            </p>
            <p className="text-muted-foreground mb-4">
              3.2 Die Nutzung erfolgt über ein Credit-System:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>Free:</strong> 10 Credits (3 Basis-Analysen)</li>
              <li><strong>Starter (€9/Monat):</strong> 25 Credits</li>
              <li><strong>Pro (€29/Monat):</strong> 100 Credits</li>
              <li><strong>Business (€79/Monat):</strong> 350 Credits</li>
              <li><strong>Enterprise (€199/Monat):</strong> 1.000 Credits + individuelle Vereinbarungen</li>
            </ul>
            <p className="text-muted-foreground">
              3.3 Credits verfallen am Ende des Abrechnungszeitraums und sind nicht übertragbar.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Verbotene Nutzung</h2>
            <p className="text-muted-foreground mb-4">
              Die Nutzung der Plattform für folgende Zwecke ist ausdrücklich untersagt:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Analyse von Inhalten mit pornografischem, sexuellem oder erotischem Charakter</li>
              <li>Analyse von Escort-, Adult- oder NSFW-Accounts</li>
              <li>Analyse von Inhalten, die Gewalt, Hass oder Diskriminierung fördern</li>
              <li>Analyse von Inhalten, die gegen geltendes Recht verstoßen</li>
              <li>Automatisierte Massenabfragen oder Scraping</li>
              <li>Weiterverkauf oder kommerzielle Weitergabe der Analyseergebnisse ohne Genehmigung</li>
              <li>Umgehung von Sicherheitsmaßnahmen oder Rate-Limits</li>
            </ul>
            <p className="text-muted-foreground">
              Verstöße führen zur sofortigen Sperrung des Accounts ohne Erstattung.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Zahlungsbedingungen</h2>
            <p className="text-muted-foreground mb-4">
              5.1 Die Zahlung erfolgt im Voraus über die angebotenen Zahlungsmethoden (Kreditkarte, PayPal).
            </p>
            <p className="text-muted-foreground mb-4">
              5.2 Abonnements verlängern sich automatisch, sofern nicht vor Ablauf gekündigt wird.
            </p>
            <p className="text-muted-foreground">
              5.3 Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. Widerrufsrecht</h2>
            <p className="text-muted-foreground mb-4">
              6.1 Verbraucher haben ein 14-tägiges Widerrufsrecht ab Vertragsschluss.
            </p>
            <p className="text-muted-foreground mb-4">
              6.2 Das Widerrufsrecht erlischt vorzeitig, wenn der Kunde vor Ablauf der Widerrufsfrist 
              mit der Nutzung der Credits begonnen hat und dem ausdrücklich zugestimmt hat.
            </p>
            <p className="text-muted-foreground">
              6.3 Der Widerruf ist schriftlich an support@reelspy.ai zu richten.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. Haftungsbeschränkung</h2>
            <p className="text-muted-foreground mb-4">
              7.1 Die Analyseergebnisse dienen ausschließlich zu Informationszwecken und stellen 
              keine Garantie für den Erfolg von Content-Strategien dar.
            </p>
            <p className="text-muted-foreground mb-4">
              7.2 Der Anbieter haftet nicht für Schäden, die durch die Umsetzung von Empfehlungen entstehen.
            </p>
            <p className="text-muted-foreground">
              7.3 Die Haftung ist auf Vorsatz und grobe Fahrlässigkeit beschränkt, soweit gesetzlich zulässig.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">8. Datenschutz</h2>
            <p className="text-muted-foreground">
              Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">9. Kündigung</h2>
            <p className="text-muted-foreground mb-4">
              9.1 Kostenlose Accounts können jederzeit gelöscht werden.
            </p>
            <p className="text-muted-foreground mb-4">
              9.2 Bezahlte Abonnements können zum Ende des Abrechnungszeitraums gekündigt werden.
            </p>
            <p className="text-muted-foreground">
              9.3 Bei Verstößen gegen diese AGB behält sich der Anbieter das Recht zur fristlosen 
              Kündigung vor.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">10. Änderungen der AGB</h2>
            <p className="text-muted-foreground">
              Der Anbieter behält sich vor, diese AGB mit angemessener Ankündigungsfrist zu ändern. 
              Änderungen werden per E-Mail mitgeteilt. Bei Widerspruch innerhalb von 14 Tagen kann 
              der Vertrag zum Änderungszeitpunkt gekündigt werden.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">11. Governing Law</h2>
            <p className="text-muted-foreground mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the 
              United Arab Emirates, without regard to conflict of law principles.
            </p>
            <p className="text-muted-foreground mb-4">
              Any disputes arising from these Terms shall be resolved in the courts of Dubai, UAE.
            </p>
            <p className="text-muted-foreground">
              If any provision of these Terms is found to be unenforceable, the remaining provisions 
              will continue in full force and effect.
            </p>
          </section>

          <section className="mb-12 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, please contact us:
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
