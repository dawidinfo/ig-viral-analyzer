import { Link } from "wouter";
import { Shield, Lock } from "lucide-react";

/**
 * Global Footer Component
 * Used across all pages for consistent branding and legal links
 * Company: QLIQ Marketing L.L.C. (Dubai, UAE)
 */
export function GlobalFooter() {
  // Email obfuscation to protect against spam bots
  const emailUser = "report";
  const emailDomain = "reelspy.ai";
  
  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${emailUser}@${emailDomain}`;
  };

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="container py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-lg">ReelSpy.ai</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              AI-powered Instagram analytics for creators, influencers and agencies.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/#faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/compare" className="hover:text-foreground transition-colors">Compare Accounts</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Guides</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API Docs</a></li>
              <li><Link href="/affiliate" className="hover:text-foreground transition-colors">Affiliate Program</Link></li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link></li>
              <li>
                <a 
                  href="#" 
                  onClick={handleEmailClick}
                  className="hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © 2025 ReelSpy.AI All rights reserved.
            </div>

            {/* Company Info */}
            <div className="text-xs text-muted-foreground text-center md:text-right">
              <p>QLIQ Marketing L.L.C. · Dubai, UAE · Reg. No. 2580137</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default GlobalFooter;
