import { Resend } from "resend";
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "qliq.marketing@proton.me";
const FROM_EMAIL = "ReelSpy.ai <noreply@reelspy.ai>";

// Day 1: Welcome & First Analysis
function createDripDay1Template(name) {
  const userName = name || "Content Creator";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Starte jetzt deine erste Analyse!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); padding: 40px; text-align: center;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 40px; margin-bottom: 20px;" />
              <div style="font-size: 48px; margin-bottom: 15px;">🎯</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">Bereit für deine erste Analyse?</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hey ${userName}! 👋
              </p>
              
              <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Du hast dich gestern bei ReelSpy.ai angemeldet – super! 🎉<br><br>
                Hast du schon deine <strong style="color: #8B5CF6;">erste KI-Analyse</strong> gestartet?
              </p>
              
              <!-- Quick Start Box -->
              <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">⚡ Quick-Start in 30 Sekunden:</p>
                <ol style="color: #a3a3a3; font-size: 14px; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Gib einen Instagram-Username ein (z.B. @cristiano)</li>
                  <li style="margin-bottom: 8px;">Klicke auf "KI-Analyse starten"</li>
                  <li style="margin-bottom: 0;">Erhalte sofort deinen Viral Score + Insights</li>
                </ol>
              </div>
              
              <!-- Pro Tip -->
              <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px; margin: 24px 0;">
                <p style="color: #10B981; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">💡 Pro-Tipp:</p>
                <p style="color: #a3a3a3; font-size: 14px; margin: 0;">
                  Analysiere zuerst einen erfolgreichen Account in deiner Nische. So siehst du sofort, was bei deiner Zielgruppe funktioniert!
                </p>
              </div>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://reelspy.ai" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);">
                      🚀 Jetzt erste Analyse starten
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666; font-size: 13px; text-align: center; margin: 20px 0 0 0;">
                Du hast noch <strong style="color: #8B5CF6;">3 kostenlose Analysen</strong> übrig!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #111; padding: 24px; text-align: center; border-top: 1px solid #333;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 20px; margin-bottom: 12px;" />
              <p style="color: #666; font-size: 12px; margin: 0;">
                © 2025 ReelSpy.ai • QLIQ Marketing L.L.C.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Day 3: Tips
function createDripDay3Template(name) {
  const userName = name || "Content Creator";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3 Geheimnisse viraler Reels</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%); padding: 40px; text-align: center;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 40px; margin-bottom: 20px;" />
              <div style="font-size: 48px; margin-bottom: 15px;">🔥</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">3 Geheimnisse viraler Reels</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">Was Top-Creator anders machen</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hey ${userName}! 👋
              </p>
              
              <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Nach der Analyse von <strong style="color: #8B5CF6;">50.000+ viralen Reels</strong> haben wir diese 3 Muster entdeckt:
              </p>
              
              <!-- Secret 1 -->
              <div style="background: rgba(139, 92, 246, 0.1); border-left: 4px solid #8B5CF6; border-radius: 0 12px 12px 0; padding: 20px; margin: 20px 0;">
                <p style="color: #8B5CF6; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">🎯 GEHEIMNIS #1</p>
                <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Der 3-Sekunden-Hook</p>
                <p style="color: #a3a3a3; font-size: 14px; margin: 0;">
                  87% der viralen Reels haben einen Hook, der in den ersten 3 Sekunden eine Frage aufwirft oder ein Problem anspricht.
                </p>
              </div>
              
              <!-- Secret 2 -->
              <div style="background: rgba(236, 72, 153, 0.1); border-left: 4px solid #EC4899; border-radius: 0 12px 12px 0; padding: 20px; margin: 20px 0;">
                <p style="color: #EC4899; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">📈 GEHEIMNIS #2</p>
                <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Das HAPSS-Framework</p>
                <p style="color: #a3a3a3; font-size: 14px; margin: 0;">
                  <strong>H</strong>ook → <strong>A</strong>ttention → <strong>P</strong>roblem → <strong>S</strong>olution → <strong>S</strong>tory<br>
                  Diese Struktur nutzen 92% der Top-Performer.
                </p>
              </div>
              
              <!-- Secret 3 -->
              <div style="background: rgba(6, 182, 212, 0.1); border-left: 4px solid #06B6D4; border-radius: 0 12px 12px 0; padding: 20px; margin: 20px 0;">
                <p style="color: #06B6D4; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">⏰ GEHEIMNIS #3</p>
                <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Posting-Zeit ist alles</p>
                <p style="color: #a3a3a3; font-size: 14px; margin: 0;">
                  Die beste Zeit zum Posten variiert je nach Nische. Unsere Heatmap zeigt dir genau, wann deine Zielgruppe am aktivsten ist.
                </p>
              </div>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://reelspy.ai" style="display: inline-block; background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                      🔍 Diese Muster in deiner Nische finden
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #111; padding: 24px; text-align: center; border-top: 1px solid #333;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 20px; margin-bottom: 12px;" />
              <p style="color: #666; font-size: 12px; margin: 0;">© 2025 ReelSpy.ai • QLIQ Marketing L.L.C.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Day 7: Content Plan
function createDripDay7Template(name) {
  const userName = name || "Content Creator";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dein 30-Tage Content-Plan wartet!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10B981 0%, #06B6D4 100%); padding: 40px; text-align: center;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 40px; margin-bottom: 20px;" />
              <div style="font-size: 48px; margin-bottom: 15px;">📅</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Nie wieder Content-Ideen suchen!</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">KI-generierter 30-Tage Content-Plan</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hey ${userName}! 👋
              </p>
              
              <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Kennst du das? Du sitzt vor dem Handy und weißt nicht, was du posten sollst... 😅<br><br>
                <strong style="color: #10B981;">Das muss nicht sein!</strong>
              </p>
              
              <!-- Feature Box -->
              <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
                <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
                  🤖 KI Content-Plan Generator
                </p>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10B981; margin-right: 8px;">✓</span>
                      <span style="color: #e5e5e5; font-size: 14px;">30 einzigartige Reel-Ideen für deine Nische</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10B981; margin-right: 8px;">✓</span>
                      <span style="color: #e5e5e5; font-size: 14px;">Fertige Hooks nach HAPSS-Framework</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10B981; margin-right: 8px;">✓</span>
                      <span style="color: #e5e5e5; font-size: 14px;">Optimale Posting-Zeiten für jeden Tag</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10B981; margin-right: 8px;">✓</span>
                      <span style="color: #e5e5e5; font-size: 14px;">PDF-Export zum Ausdrucken</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://reelspy.ai/pricing" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #06B6D4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                      📅 Content-Plan Generator freischalten
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #111; padding: 24px; text-align: center; border-top: 1px solid #333;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 20px; margin-bottom: 12px;" />
              <p style="color: #666; font-size: 12px; margin: 0;">© 2025 ReelSpy.ai • QLIQ Marketing L.L.C.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Day 14: Upgrade Offer
function createDripDay14Template(name) {
  const userName = name || "Content Creator";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exklusives Angebot: 20% Rabatt!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #F59E0B 0%, #EC4899 100%); padding: 40px; text-align: center;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 40px; margin-bottom: 20px;" />
              <div style="font-size: 48px; margin-bottom: 15px;">🎁</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Exklusiv für dich: 20% Rabatt!</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">Nur noch 48 Stunden gültig</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hey ${userName}! 👋
              </p>
              
              <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Du bist jetzt seit 2 Wochen bei ReelSpy.ai dabei. 🎉<br><br>
                Als Dankeschön haben wir ein <strong style="color: #F59E0B;">exklusives Angebot</strong> für dich:
              </p>
              
              <!-- Promo Code Box -->
              <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%); border: 2px dashed #F59E0B; border-radius: 16px; padding: 32px; margin: 24px 0; text-align: center;">
                <p style="color: #a3a3a3; font-size: 14px; margin: 0 0 12px 0;">Dein persönlicher Rabatt-Code:</p>
                <div style="background: #0a0a0a; border-radius: 8px; padding: 16px; margin: 0 0 16px 0;">
                  <p style="color: #F59E0B; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: 4px; font-family: monospace;">REELSPY20</p>
                </div>
                <p style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 0;">20% auf alle Pro-Pläne!</p>
                <p style="color: #EF4444; font-size: 13px; margin: 12px 0 0 0;">⏰ Nur noch 48 Stunden gültig</p>
              </div>
              
              <!-- What you get -->
              <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 24px 0 16px 0;">Was du mit Pro bekommst:</p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #333;">
                    <span style="color: #10B981; margin-right: 10px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;"><strong>Unbegrenzte</strong> KI-Analysen</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #333;">
                    <span style="color: #10B981; margin-right: 10px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;">30-Tage Content-Plan Generator</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #333;">
                    <span style="color: #10B981; margin-right: 10px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;">HAPSS + AIDA Framework-Analyse</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #10B981; margin-right: 10px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;">PDF-Export aller Analysen</span>
                  </td>
                </tr>
              </table>
              
              <!-- Price comparison -->
              <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="color: #a3a3a3; font-size: 14px; margin: 0 0 8px 0;">Pro-Plan mit deinem Rabatt:</p>
                <p style="margin: 0;">
                  <span style="color: #666; font-size: 18px; text-decoration: line-through;">€29/Monat</span>
                  <span style="color: #10B981; font-size: 28px; font-weight: 700; margin-left: 12px;">€23,20/Monat</span>
                </p>
                <p style="color: #F59E0B; font-size: 13px; margin: 8px 0 0 0;">Du sparst €69,60 im Jahr!</p>
              </div>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://reelspy.ai/pricing" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #EC4899 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 10px; font-weight: 600; font-size: 18px;">
                      🚀 Jetzt 20% sparen
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666; font-size: 12px; text-align: center; margin: 16px 0 0 0;">
                Code <strong>REELSPY20</strong> beim Checkout eingeben
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #111; padding: 24px; text-align: center; border-top: 1px solid #333;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 20px; margin-bottom: 12px;" />
              <p style="color: #666; font-size: 12px; margin: 0;">© 2025 ReelSpy.ai • QLIQ Marketing L.L.C.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

async function sendEmail(subject, html) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Error:", error);
      return false;
    }

    console.log("Sent:", subject, "- ID:", data?.id);
    return true;
  } catch (error) {
    console.error("Failed:", error.message);
    return false;
  }
}

async function main() {
  console.log("Sending Drip Campaign Preview to", ADMIN_EMAIL);
  console.log("---");
  
  const emails = [
    { subject: "🎯 [PREVIEW] Tag 1: Bereit für deine erste KI-Analyse?", template: createDripDay1Template },
    { subject: "🔥 [PREVIEW] Tag 3: 3 Geheimnisse viraler Reels", template: createDripDay3Template },
    { subject: "📅 [PREVIEW] Tag 7: Nie wieder Content-Ideen suchen!", template: createDripDay7Template },
    { subject: "🎁 [PREVIEW] Tag 14: Exklusiv für dich: 20% Rabatt!", template: createDripDay14Template },
  ];
  
  for (const email of emails) {
    await sendEmail(email.subject, email.template("Admin"));
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log("---");
  console.log("Done! Check your inbox at", ADMIN_EMAIL);
}

main();
