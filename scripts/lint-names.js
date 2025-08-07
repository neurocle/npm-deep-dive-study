#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const errors = [];
const warnings = [];

function validateFileName(filePath, fileName, dirPath) {
  const relativePath = path.relative(process.cwd(), filePath);

  // Check if it's in materials directory
  if (dirPath.includes("/materials/ch_")) {
    const chapterMatch = dirPath.match(/ch_(\d+)/);
    if (chapterMatch && fileName.endsWith(".md")) {
      // Should be item_X_이름.md format
      const itemPattern = /^item_\d+_.*\.md$/;
      if (!itemPattern.test(fileName)) {
        errors.push(
          `❌ ${relativePath}: Item files should follow pattern "item_X_이름.md"`
        );
      }
    }
  }

  // Check images directory
  if (dirPath.includes("/images/") && !fileName.startsWith("ch_")) {
    warnings.push(
      `⚠️  ${relativePath}: Image files should be named with chapter prefix (e.g., ch_2_1_item_1)`
    );
  }
}

function validateDirectoryStructure(dirPath) {
  const relativePath = path.relative(process.cwd(), dirPath);

  // Check materials subdirectories - should only contain ch_X directories
  if (
    dirPath.includes("materials/") &&
    dirPath !== "materials" &&
    !dirPath.endsWith("/materials")
  ) {
    const pathParts = dirPath.split("/");
    const materialsIndex = pathParts.indexOf("materials");
    if (materialsIndex >= 0 && materialsIndex < pathParts.length - 1) {
      const subDir = pathParts[materialsIndex + 1];
      if (!subDir.match(/^ch_\d+$/)) {
        errors.push(
          `❌ ${relativePath}: Materials subdirectories should follow "ch_X" pattern, found "${subDir}"`
        );
      }
    }
  }
}

function scanDirectory(dir = ".") {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    // Skip node_modules and hidden directories
    if (item.name.startsWith(".") || item.name === "node_modules") {
      continue;
    }

    if (item.isDirectory()) {
      validateDirectoryStructure(fullPath);
      scanDirectory(fullPath);
    } else {
      validateFileName(fullPath, item.name, dir);
    }
  }
}

console.log("🔍 Linting file and folder names...\n");

scanDirectory();

if (errors.length > 0) {
  console.log("ERRORS:");
  errors.forEach((error) => console.log(error));
  console.log();
}

if (warnings.length > 0) {
  console.log("WARNINGS:");
  warnings.forEach((warning) => console.log(warning));
  console.log();
}

if (errors.length === 0 && warnings.length === 0) {
  console.log("✅ All file and folder names follow the naming conventions!");
} else {
  console.log(
    `📊 Summary: ${errors.length} errors, ${warnings.length} warnings`
  );
  if (errors.length > 0) {
    process.exit(1);
  }
}
