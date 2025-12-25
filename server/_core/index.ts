import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook } from "../stripe/webhook";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Stripe webhook needs raw body - MUST be before express.json()
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Instagram profile picture proxy to avoid CORS issues
  app.get("/api/proxy/instagram-image", async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send("Missing url parameter");
    }
    
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Referer': 'https://www.instagram.com/',
        },
      });
      
      if (!response.ok) {
        return res.status(response.status).send("Failed to fetch image");
      }
      
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("[Proxy] Error fetching image:", error);
      res.status(500).send("Error fetching image");
    }
  });

  // Email tracking pixel - 1x1 transparent GIF
  // URL format: /api/email/track.gif?u=userId&e=emailType&t=timestamp
  app.get("/api/email/track.gif", async (req, res) => {
    const userId = parseInt(req.query.u as string);
    const emailType = req.query.e as string;
    
    // Return 1x1 transparent GIF immediately
    const transparentGif = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.send(transparentGif);
    
    // Track the open asynchronously
    if (userId && emailType) {
      try {
        const { trackEmailOpen } = await import("../services/dripCampaignService");
        await trackEmailOpen(userId, emailType);
        console.log(`[EmailTracking] Opened: user=${userId}, type=${emailType}`);
      } catch (error) {
        console.error("[EmailTracking] Error tracking open:", error);
      }
    }
  });

  // Email click tracking redirect
  // URL format: /api/email/click?u=userId&e=emailType&r=redirectUrl
  app.get("/api/email/click", async (req, res) => {
    const userId = parseInt(req.query.u as string);
    const emailType = req.query.e as string;
    const redirectUrl = req.query.r as string || "https://reelspy.ai";
    
    // Track the click asynchronously
    if (userId && emailType) {
      try {
        const { trackEmailClick } = await import("../services/dripCampaignService");
        await trackEmailClick(userId, emailType);
        console.log(`[EmailTracking] Clicked: user=${userId}, type=${emailType}`);
      } catch (error) {
        console.error("[EmailTracking] Error tracking click:", error);
      }
    }
    
    // Redirect to the target URL
    res.redirect(302, redirectUrl);
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
