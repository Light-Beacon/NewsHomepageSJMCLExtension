import { build } from "esbuild";
import { zipSync } from "fflate";
import semver from "semver";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const manifestPath = path.join(projectRoot, "sjmcl.ext.json");
const packagePath = path.join(projectRoot, "package.json");
const distRoot = path.join(projectRoot, "dist");

const IDENTIFIER_PATTERN = /^[a-z][a-z0-9_-]*(\.[a-z][a-z0-9_-]*)+$/;
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const YELLOW = "\x1b[33m";
const IMPORT_WARNING_TARGETS = new Map([
  ["react", "react"],
  ["@chakra-ui/react", "chakra"],
]);
const JSX_PATTERN = /<\/?[A-Za-z][\w.:+-]*(?:\s[^<>]*?)?>|<>|<\/>/m;

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function supportsColor(stream) {
  return (
    Boolean(stream?.isTTY) &&
    process.env.NO_COLOR === undefined &&
    process.env.TERM !== "dumb"
  );
}

function formatWarningLabel() {
  if (!supportsColor(process.stderr)) {
    return "WARNING";
  }

  return `${BOLD}${YELLOW}WARNING${RESET}`;
}

function normalizeRelativePath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .trim();
}

function validateRelativePackagePath(value, fieldName) {
  const normalized = normalizeRelativePath(value);

  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }

  if (normalized.startsWith("/") || normalized.startsWith("../")) {
    throw new Error(`${fieldName} must stay inside the extension package.`);
  }

  if (normalized.split("/").some((segment) => segment === "" || segment === "..")) {
    throw new Error(`${fieldName} must be a normalized relative path.`);
  }

  if (!normalized.endsWith(".js")) {
    throw new Error(`${fieldName} must point to a .js file.`);
  }

  return normalized;
}

function copyIfExists(sourcePath, targetPath) {
  if (!existsSync(sourcePath)) {
    return;
  }

  cpSync(sourcePath, targetPath, { recursive: true });
}

function addDirectoryToZipTree(sourceDirectory) {
  const currentNode = {};

  for (const entry of readdirSync(sourceDirectory, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDirectory, entry.name);

    if (entry.isDirectory()) {
      currentNode[entry.name] = addDirectoryToZipTree(sourcePath);
      continue;
    }

    currentNode[entry.name] = readFileSync(sourcePath);
  }

  return currentNode;
}

function resolveSourceEntryPath() {
  const candidates = [
    path.join(projectRoot, "src", "index.ts"),
    path.join(projectRoot, "src", "index.tsx"),
  ];
  const existingCandidates = candidates.filter((candidate) => existsSync(candidate));

  if (existingCandidates.length === 0) {
    throw new Error("Expected src/index.ts or src/index.tsx.");
  }

  if (existingCandidates.length > 1) {
    console.warn(
      `${formatWarningLabel()} Both src/index.ts and src/index.tsx exist; using src/index.ts.`
    );
  }

  return existingCandidates[0];
}

function collectSourceFiles(rootDirectory) {
  const files = [];

  for (const entry of readdirSync(rootDirectory, { withFileTypes: true })) {
    const entryPath = path.join(rootDirectory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(entryPath));
      continue;
    }

    if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function getImportCounts(content) {
  const importMatches = content.matchAll(
    /^\s*import(?:["'\s\S]*?\sfrom\s*)?["']([^"']+)["'];?/gm
  );
  const importCounts = new Map();

  for (const match of importMatches) {
    const packageName = match[1];
    if (!IMPORT_WARNING_TARGETS.has(packageName)) {
      continue;
    }

    importCounts.set(packageName, (importCounts.get(packageName) || 0) + 1);
  }

  return importCounts;
}

function warnPackageImports(sourcePath, importCounts) {
  const relativePath = normalizeRelativePath(path.relative(projectRoot, sourcePath));

  for (const [packageName, count] of importCounts) {
    const label = IMPORT_WARNING_TARGETS.get(packageName);
    const replacement = packageName === "react" ? "api.React" : "api.ChakraUI";

    console.warn(
      `${formatWarningLabel()} Avoid importing ${label} from "${packageName}" in ${relativePath}; use ${replacement} from the extension api instead.`
    );

    if (count < 2) {
      continue;
    }

    console.warn(
      `${formatWarningLabel()} Duplicate ${label} imports in ${relativePath} (${count} imports from "${packageName}").`
    );
  }
}

function warnJsxTransform(sourcePath, content) {
  if (!/\.[jt]sx$/.test(sourcePath)) {
    return;
  }

  if (!JSX_PATTERN.test(content)) {
    return;
  }

  const relativePath = normalizeRelativePath(path.relative(projectRoot, sourcePath));
  console.warn(
    `${formatWarningLabel()} JSX/TSX component trees in ${relativePath} will be transformed to React.createElement(...).`
  );
}

function scanSourceWarnings() {
  const sourceRoot = path.join(projectRoot, "src");
  if (!existsSync(sourceRoot)) {
    return;
  }

  for (const sourcePath of collectSourceFiles(sourceRoot)) {
    const content = readFileSync(sourcePath, "utf8");
    const importCounts = getImportCounts(content);

    warnPackageImports(sourcePath, importCounts);
    warnJsxTransform(sourcePath, content);
  }
}

async function main() {
  const manifest = readJson(manifestPath);
  const packageJson = readJson(packagePath);
  const sourceEntryPath = resolveSourceEntryPath();

  if (!IDENTIFIER_PATTERN.test(manifest.identifier || "")) {
    throw new Error("sjmcl.ext.json must contain a valid identifier.");
  }

  const frontendEntry = validateRelativePackagePath(
    manifest.frontend?.entry,
    "frontend.entry"
  );

  const version = manifest.version || packageJson.version;
  if (!semver.valid(version)) {
    throw new Error("A valid extension version is required in sjmcl.ext.json or package.json.");
  }

  const outputDirectory = path.join(distRoot, manifest.identifier);
  const outputEntry = path.join(outputDirectory, frontendEntry);
  const archivePath = path.join(
    distRoot,
    `${manifest.identifier}-${version}.sjmclx`
  );

  rmSync(distRoot, { recursive: true, force: true });
  mkdirSync(path.dirname(outputEntry), { recursive: true });
  scanSourceWarnings();

  const buildResult = await build({
    entryPoints: [sourceEntryPath],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2015"],
    write: false,
    charset: "utf8",
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    logLevel: "info",
  });

  const outputFile = buildResult.outputFiles?.[0];

  if (!outputFile) {
    throw new Error("esbuild did not produce a bundled frontend script.");
  }

  const bundledScript = outputFile.text.replace(
    /^(?:\uFEFF)?(?:"use strict"|'use strict');\s*/,
    ""
  );

  writeFileSync(outputEntry, bundledScript);

  writeFileSync(
    path.join(outputDirectory, "sjmcl.ext.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  copyIfExists(
    path.join(projectRoot, "icon.png"),
    path.join(outputDirectory, "icon.png")
  );
  copyIfExists(
    path.join(projectRoot, "assets"),
    path.join(outputDirectory, "assets")
  );
  copyIfExists(
    path.join(projectRoot, "data"),
    path.join(outputDirectory, "data")
  );

  const zipTree = {
    [manifest.identifier]: addDirectoryToZipTree(outputDirectory),
  };
  const archiveBuffer = zipSync(zipTree, { level: 9 });
  writeFileSync(archivePath, Buffer.from(archiveBuffer));

  console.log("");
  console.log(`Built ${outputDirectory}`);
  console.log(`Packed ${archivePath}`);

  if (packageJson.version !== version) {
    console.log(
      `Note: package.json version (${packageJson.version}) differs from sjmcl.ext.json version (${version}).`
    );
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Build failed: ${message}`);
  process.exitCode = 1;
});
