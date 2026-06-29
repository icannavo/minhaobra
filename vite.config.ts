import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// =============================================================================
// Manus Debug Collector
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1024 * 1024;
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);

type LogSource =
  | "browserConsole"
  | "networkRequests"
  | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath)) return;

    if (fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf8").split("\n");
    const kept: string[] = [];
    let bytes = 0;

    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(
        `${lines[i]}\n`,
        "utf8",
      );

      if (bytes + lineBytes > TRIM_TARGET_BYTES) {
        break;
      }

      kept.unshift(lines[i]);
      bytes += lineBytes;
    }

    fs.writeFileSync(
      logPath,
      kept.join("\n"),
      "utf8",
    );
  } catch {
    // ignore
  }
}

function writeToLogFile(
  source: LogSource,
  entries: unknown[],
) {
  if (!entries.length) return;

  ensureLogDir();

  const logPath = path.join(
    LOG_DIR,
    `${source}.log`,
  );

  const lines = entries.map(
    (entry) =>
      `[${new Date().toISOString()}] ${JSON.stringify(
        entry,
      )}`,
  );

  fs.appendFileSync(
    logPath,
    `${lines.join("\n")}\n`,
    "utf8",
  );

  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html: string) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }

      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head" as const,
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        "/__manus__/logs",
        (req, res, next) => {
          if (req.method !== "POST") {
            return next();
          }

          const processPayload = (
            payload: any,
          ) => {
            if (payload.consoleLogs?.length) {
              writeToLogFile(
                "browserConsole",
                payload.consoleLogs,
              );
            }

            if (
              payload.networkRequests?.length
            ) {
              writeToLogFile(
                "networkRequests",
                payload.networkRequests,
              );
            }

            if (
              payload.sessionEvents?.length
            ) {
              writeToLogFile(
                "sessionReplay",
                payload.sessionEvents,
              );
            }

            res.writeHead(200, {
              "Content-Type":
                "application/json",
            });

            res.end(
              JSON.stringify({
                success: true,
              }),
            );
          };

          const body = (req as any).body;

          if (body) {
            try {
              processPayload(body);
            } catch (e) {
              res.writeHead(400);
              res.end(
                JSON.stringify({
                  success: false,
                  error: String(e),
                }),
              );
            }

            return;
          }

          let raw = "";

          req.on("data", (chunk) => {
            raw += chunk.toString();
          });

          req.on("end", () => {
            try {
              processPayload(
                JSON.parse(raw),
              );
            } catch (e) {
              res.writeHead(400);
              res.end(
                JSON.stringify({
                  success: false,
                  error: String(e),
                }),
              );
            }
          });
        },
      );
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePluginManusRuntime(),
    vitePluginManusDebugCollector(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(
        import.meta.dirname,
        "client",
        "src",
      ),
      "@shared": path.resolve(
        import.meta.dirname,
        "shared",
      ),
      "@assets": path.resolve(
        import.meta.dirname,
        "attached_assets",
      ),
    },
  },

  envDir: path.resolve(
    import.meta.dirname,
  ),

  root: path.resolve(
    import.meta.dirname,
    "client",
  ),

  publicDir: path.resolve(
    import.meta.dirname,
    "client",
    "public",
  ),

  build: {
    outDir: path.resolve(
      import.meta.dirname,
      "public",
    ),
    emptyOutDir: true,
  },

  server: {
    host: true,

    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],

    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});