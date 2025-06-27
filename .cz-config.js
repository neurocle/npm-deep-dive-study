module.exports = {
  types: [
    { value: "📚", name: "📚 study: 스터디 정리" },
    { value: "📖", name: "📖 readme: 리드미 수정" },
    { value: "🖼️", name: "🖼️  asset: 이미지 추가" },
    { value: "🔧", name: "🔧 config: 설정 변경" },
    { value: "📦", name: "📦 package: 패키지 변경" },
  ],
  scopes: [],
  allowCustomScopes: false,
  subjectLimit: 72,

  // 이 항목에 나열된 질문은 전부 건너뜁니다
  skipQuestions: ["scope", "body", "footer"],

  // 남길 질문만 정의
  messages: {
    type: "커밋 유형을 선택하세요:",
    subject: "커밋 메시지를 작성하세요 ex) 1.2장 정리: ",
  },
};
