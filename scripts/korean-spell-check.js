#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Common Korean typos and corrections - only obvious mistakes
const koreanTypos = {
  // 자주 틀리는 맞춤법
  되요: "돼요",
  안되: "안 돼",
  되가지고: "돼가지고",
  웬지: "왠지",
  갖고: "가지고",
  갖다: "가지다",
  갖어: "가져",
  갖았: "가졌",
  갖을: "가질",
  갖은: "가진",
  갖는: "가지는",
  설겆이: "설거지",
  깍뚜기: "깍두기",
  어떻해: "어떻게",
  어떻하: "어떻게",
  그리고나서: "그리고 나서",
  어쨋든: "어쨌든",
  어떻든: "어쨌든",
  가르키다: "가리키다",
  가르켜: "가리켜",
  가르켰: "가리켰",
  어케: "어떻게",
  암케: "어떻게",
  머임: "뭐임",
  맴: "마음",
  곰곰히: "곰곰이",
  이였다: "이었다",
  하였다: "했다",
  하였습니다: "했습니다",
  가였다: "갔다",
  와였다: "왔다",
  되였다: "됐다",
  않였다: "않았다",
  줄께: "줄게",
  줄꺼야: "줄 거야",
  할께: "할게",
  할꺼야: "할 거야",
  올께: "올게",
  올꺼야: "올 거야",
  갈께: "갈게",
  갈꺼야: "갈 거야",
  될께: "될게",
  될꺼야: "될 거야",
  먹을께: "먹을게",
  먹을꺼야: "먹을 거야",
};

// More specific patterns that need word boundaries
const contextualTypos = [
  {
    pattern: /\b되어\b/g,
    replacement: "돼",
    condition: (line) =>
      !line.includes("되어야") &&
      !line.includes("되어서") &&
      !line.includes("되어도"),
  },
];

const errors = [];
const warnings = [];

function checkKoreanTypos(content, filePath) {
  const lines = content.split("\n");

  lines.forEach((line, lineIndex) => {
    // Skip empty lines and HTML comments
    if (!line.trim() || line.trim().startsWith("<!--")) {
      return;
    }

    // Check for common typos
    Object.keys(koreanTypos).forEach((typo) => {
      if (line.includes(typo)) {
        const suggestion = koreanTypos[typo];
        errors.push(
          `❌ ${filePath}:${lineIndex + 1} - "${typo}" → "${suggestion}" 권장`
        );
      }
    });

    // Check contextual typos
    contextualTypos.forEach((rule) => {
      if (rule.condition(line) && rule.pattern.test(line)) {
        errors.push(
          `❌ ${filePath}:${lineIndex + 1} - "${
            line.match(rule.pattern)[0]
          }" → "${rule.replacement}" 권장`
        );
      }
    });

    // Check for potential repeated characters (likely typos)
    const repeatedChars = line.match(/([가-힣])\1{2,}/g);
    if (repeatedChars) {
      repeatedChars.forEach((match) => {
        warnings.push(
          `⚠️  ${filePath}:${lineIndex + 1} - 반복된 문자 확인 필요: "${match}"`
        );
      });
    }
  });
}

function scanMarkdownFiles(dir = "./materials") {
  if (!fs.existsSync(dir)) {
    console.log("materials 디렉토리가 없습니다.");
    return;
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      scanMarkdownFiles(fullPath);
    } else if (item.name.endsWith(".md")) {
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        checkKoreanTypos(content, path.relative(process.cwd(), fullPath));
      } catch (error) {
        warnings.push(`⚠️  ${fullPath}: 파일 읽기 실패 - ${error.message}`);
      }
    }
  }
}

console.log("🔍 한국어 맞춤법 검사 중...\n");

scanMarkdownFiles();

if (errors.length > 0) {
  console.log("맞춤법 오류:");
  errors.forEach((error) => console.log(error));
  console.log();
}

if (warnings.length > 0) {
  console.log("검토 필요:");
  warnings.forEach((warning) => console.log(warning));
  console.log();
}

if (errors.length === 0 && warnings.length === 0) {
  console.log("✅ 한국어 맞춤법 검사 완료! 문제가 발견되지 않았습니다.");
} else {
  console.log(
    `📊 요약: ${errors.length}개 오류, ${warnings.length}개 검토 항목`
  );
  if (errors.length > 0) {
    console.log(
      "\n❗ 맞춤법 오류가 발견되었습니다. 수정 후 다시 커밋해주세요."
    );
    process.exit(1);
  }
}
