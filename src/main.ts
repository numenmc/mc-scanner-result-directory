import { cp, mkdir, readdir, readFile, writeFile } from "fs/promises";
import { CONFIG } from "./config";
import nunjucks from "nunjucks";
import { ProcessedServer } from "./database_types";

console.log("Copying files");
await cp("public/static", CONFIG.outDir, { recursive: true });
await cp(`${CONFIG.dataDir}/servers.json`, `${CONFIG.outDir}/api.json`);

console.log("Reading servers data");
const serversData = await readFile(`${CONFIG.dataDir}/servers.json`, "utf-8");
const servers = JSON.parse(serversData) as ProcessedServer[];
console.log("Servers data read");

nunjucks.configure({
  autoescape: true
});

console.log("Generating index.html redirect");
const index = `<!DOCTYPE html><html><head><script>window.location.href = "https://scanner.numenmc.me/1";</script></head><body>Redirecting to <a href="/1">/1</a></body></html>`;
await writeFile(`${CONFIG.outDir}/index.html`, index);

console.log("Generating paginated server list pages");
const pages: ProcessedServer[][] = [];

for (let i = 0; i < servers.length; i += CONFIG.serversPerPage) {
  pages.push(servers.slice(i, i + CONFIG.serversPerPage));
}

for (let i = 0; i < pages.length; i++) {
  const pageServers = pages[i];
  const pageHtmlTemplate = await readFile("public/templates/page.html", "utf-8");

  const renderedPage = nunjucks.renderString(pageHtmlTemplate, {
    servers: pageServers.map((s) => ({
        ...s,
        motd: s.motd || "A Minecraft Server"
    })),
    page: i + 1,
    totalPages: pages.length,
    spp: CONFIG.serversPerPage
  });

  await writeFile(`${CONFIG.outDir}/${i + 1}.html`, renderedPage);
}

console.log("All pages generated");