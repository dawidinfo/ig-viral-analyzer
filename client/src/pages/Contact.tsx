import { GlobalFooter } from "@/components/GlobalFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Mail,
  MessageSquare,
  Send,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Bug,
  Lightbulb,
  CreditCard,
  Users,
  Shield,
} from "lucide-react";

const categories = [
  { value: "general", label: "Allgemeine Anfrage", icon: HelpCircle },
  { value: "bug", label: "Bug melden", icon: Bug },
  { value: "feature", label: "Feature-Vorschlag", icon: Lightbulb },
  { value: "billing", label: "Zahlung & Abrechnung", icon: CreditCard },
  { value: "partnership", label: "Partnerschaft & Kooperation", icon: Users },
  { value: "privacy", label: "Datenschutz & DSGVO", icon: Shield },
];

export default function Contact() {
  const [, setLocation] = useLocation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot field
  const [securityAnswer, setSecurityAnswer] = useState("");
  
  // Security question (simple math)
  const [securityQuestion] = useState(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { question: `Was ist ${a} + ${b}?`, answer: (a + b).toString() };
  });

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Nachricht gesendet!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Fehler beim Senden");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (website) {
      toast.error("Spam erkannt");
      return;
    }
    
    // Security question check
    if (securityAnswer !== securityQuestion.answer) {
      toast.error("Sicherheitsfrage falsch beantwortet");
      return;
    }
    
    // Validation
    if (!name || !email || !category || !subject || !message) {
      toast.error("Bitte fülle alle Pflichtfelder aus");
      return;
    }
    
    if (message.length < 20) {
      toast.error("Nachricht muss mindestens 20 Zeichen lang sein");
      return;
    }

    contactMutation.mutate({
      name,
      email,
      category,
      subject,
      message,
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background bg-grid">
        <div className="fixed inset-0 bg-gradient-radial pointer-events-none" />
        
        <div className="container max-w-2xl py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="glass-card">
              <CardContent className="pt-12 pb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Nachricht gesendet!</h1>
                <p className="text-muted-foreground mb-8">
                  Vielen Dank für deine Nachricht. Wir melden uns innerhalb von 24-48 Stunden bei dir.
                </p>
                <Button onClick={() => setLocation("/")} className="btn-gradient text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück zur Startseite
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="fixed inset-0 bg-gradient-radial pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
            <img src="/logo.svg" alt="ReelSpy.ai" className="h-8 w-auto" />
          </div>
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
        </div>
      </header>

      <main className="container max-w-3xl py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Kontakt</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Wie können wir <span className="text-gradient">helfen</span>?
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Hast du Fragen, Feedback oder möchtest mit uns zusammenarbeiten? 
              Fülle das Formular aus und wir melden uns schnellstmöglich.
            </p>
          </div>

          {/* Contact Form */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Kontaktformular
              </CardTitle>
              <CardDescription>
                Alle Felder mit * sind Pflichtfelder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Dein Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="deine@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Kategorie *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Wähle eine Kategorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Betreff *</Label>
                  <Input
                    id="subject"
                    placeholder="Worum geht es?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Nachricht * (min. 20 Zeichen)</Label>
                  <Textarea
                    id="message"
                    placeholder="Beschreibe dein Anliegen ausführlich..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    required
                    minLength={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    {message.length}/20 Zeichen (Minimum)
                  </p>
                </div>

                {/* Honeypot (hidden) */}
                <div className="hidden" aria-hidden="true">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                {/* Security Question */}
                <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <Label htmlFor="security" className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Sicherheitsfrage *
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {securityQuestion.question}
                  </p>
                  <Input
                    id="security"
                    placeholder="Deine Antwort"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    required
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full btn-gradient text-white"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? (
                    "Wird gesendet..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Nachricht senden
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Alternativ erreichst du uns direkt unter{" "}
              <a href="mailto:report@reelspy.ai" className="text-primary hover:underline">
                report@reelspy.ai
              </a>
            </p>
          </div>
        </motion.div>
      </main>

      <GlobalFooter />
    </div>
  );
}
