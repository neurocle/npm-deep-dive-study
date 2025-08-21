# 5.1 트랜스파일을 도와주는 도구, 바벨

## JS 언어의 발전과 호환성

- JavaScript 언어의 표준은 ECMAScript가 주도한다.
- 하위 위원회인 TC39(Technical Committee 39)는 JS의 표준을 개발하고 유지하는 역할을 한다.
- JS의 표준이 새롭게 등장할 때마다 언어의 발전이라는 긍정적인 측면이 있지만, 브라우저 제작사 입장에서는 최신 JS가 동작하게 하는 것이 어려운 과제이다.
- 브라우저가 최신 JS의 기능이 호환하지 않는 경우, 웹페이지의 문제를 야기하기 때문에 개발자는 호환성을 점검하여 복잡한 설정을 추가해야 한다.
  ⇒ 코드가 실행되는 환경(브라우저)을 개발자가 통제할 수 없기 때문
- 이러한 호환성 문제는 트랜스파일과 폴리필을 통해 해결 가능하다.

## 바벨(트랜스파일러)의 필요성

> 바벨(Babel): 최신 JS 코드를 구형 브라우저와 호환되는 코드로 변환하는 데 사용되는 대표적인 트랜스파일러

### 트랜스파일러의 필요성

- ES5(09년) 출시 이후 ES6(15년)이 발표되면서 클래스, 모듈, 화살표 함수, 구조 분해 할당, Promise, let/const 등 많은 신규 기능과 문법이 도입됐다.
- 이런 변화가 JS 기반의 개발을 더욱 강력하고 편리하게 만들어줬지만 ES6를 구형 브라우저에서 지원하지 않는 문제가 있었고, 이를 해결하기 위해 최신 코드를 구형 브라우저에서도 실행 가능한 코드로 변환할 필요가 있었다.
  ⇒ 트랜스파일러 필요성 대두

### 바벨의 등장

- 바벨 등장 전 Traceur, es60shim 등의 트랜스파일러 존재
- 14년 세바스찬 맥켄지가 ES6 코드를 ES5로 트랜스파일 해주는 6to5 출시
- 이후 단순히 ES5로 코드를 변환하는 걸 넘어 다양한 JS 버전과 실험적인 기능을 지원하는 다목적 트랜스파일러로 발전하면서 이름을 바벨로 변경
  (”은하수를 여행하는 히치하이커를 위한 안내서”에 나오는 언어 번역 물고기인 “바벨 피시”에서 따온 이름)

### 바벨의 특징

- 플러그인 시스템
  - 필요한 기능만 선택적으로 트랜스파일할 수 있게 동작
  - 각 모듈은 독립성을 유지하며 유지보수될 수 있고, 전체 시스템의 안정성과 유지보수성을 향상 시킴
  - 개발자가 바벨 시스템에 기여할 수 있는 길을 열어주는 역할도 함
- 광범위한 JS 문법 지원
  - 최신 ECMAScript 뿐만 아니라, ESNext, 리액트의 JSX 문법, TS 등 다양한 언어 확장 기능도 지원
- 플러그인 프리셋
  - 플러그인 시스템은 개발자가 자신의 프로젝트에 필요한 설정을 일일이 해야한다는 단점 존재
  - 이를 해결하기 위해 플러그인 묶음인 프리셋 제공
- 활발한 커뮤니티 지원

## 바벨의 동작 방식

### 추상 구문 트리(Abstract Syntax Tree)

- 소스코드의 구조를 트리 형태로 표현한 자료 구조
- 컴파일러와 인터프리터로 소스코드를 분석하고 변환
- 코드의 구문적 요소를 계층으로 나타내어 각 노드가 코드의 특정 구문 요소를 표현
  - 노드: 트리의 각 요소. 주로 변수나 함수 선언문 등 코드의 구문 요소를 의미하는 기본 단위.
  - 자식 노드: 특정 노드의 하위 요소. 함수명, 파라미터 등 해당 구문 요소의 세부 항목을 포함.
  - 최상위 노드: 트리의 최상위 노드. 일반적으로 전체 프로그램이나 코드 블록을 의미.
- 함수의 추상 구문 트리 JSON 객체
  ```jsx
  const log = (value) => {
    console.log(value);
  };
  ```
  ```json
  {
    "type": "Program",
    "start": 0,
    "end": 48,
    "body": [
      {
        "type": "VariableDeclaration",
        "start": 0,
        "end": 48,
        "declarations": [
          {
            "type": "VariableDeclarator",
            "start": 6,
            "end": 48,
            "id": {
              "type": "Identifier",
              "start": 6,
              "end": 9,
              "name": "log"
            },
            "init": {
              "type": "ArrowFunctionExpression",
              "start": 12,
              "end": 48,
              "id": null,
              "expression": false,
              "generator": false,
              "async": false,
              "params": [
                {
                  "type": "Identifier",
                  "start": 13,
                  "end": 18,
                  "name": "value"
                }
              ],
              "body": {
                "type": "BlockStatement",
                "start": 23,
                "end": 48,
                "body": [
                  {
                    "type": "ExpressionStatement",
                    "start": 27,
                    "end": 46,
                    "expression": {
                      "type": "CallExpression",
                      "start": 27,
                      "end": 45,
                      "callee": {
                        "type": "MemberExpression",
                        "start": 27,
                        "end": 38,
                        "object": {
                          "type": "Identifier",
                          "start": 27,
                          "end": 34,
                          "name": "console"
                        },
                        "property": {
                          "type": "Identifier",
                          "start": 35,
                          "end": 38,
                          "name": "log"
                        },
                        "computed": false,
                        "optional": false
                      },
                      "arguments": [
                        {
                          "type": "Identifier",
                          "start": 39,
                          "end": 44,
                          "name": "value"
                        }
                      ],
                      "optional": false
                    }
                  }
                ]
              }
            }
          }
        ],
        "kind": "const"
      }
    ],
    "sourceType": "module"
  }
  ```
- 추상 구문 트리 구조를 사용해 코드 전체의 구문을 쉽게 분석하고 다양한 변환과 최적화를 진행할 수 있다.
  (ESModule, ESLint, Babel이 모두 이 구조를 기반으로 동작)
- 추상 구문 트리 파서
  - Acorn: 가볍고 빠른 파서. ECMAScript만 지원해서 브라우저 환경에서 사용하기 적합. 플러그인 기반 동작이라 확장성이 좋음. babel 파서의 기반.
  - Esprima: 고성능 파서. 확장성이 제한적이나 속도와 정확성 면에서 높게 평가됨.
  - ESpree: Acorn, Esprima 영향을 받은 파서. 확장이 높음. ESLint의 기본 파서.
  - @babel/parser: Acorn 파서 기반. 매우 높은 확장성, 다양한 기능 지원.

### 바벨이 코드를 변환하는 과정

> @babel/core 패키지에 바벨의 모든 핵심 기능 포함

1. 파싱
   - @babel/parser로 소스코드를 읽어 추상 구문 트리로 변환.
   - JSX, Flow, TS + TC39 단계의 stage-0 단계 PR 승인을 거친 실험적인 기능도 지원
   - JS 추상 구문 트리의 표준화 사양인 ESTree와는 약간의 차이점이 있음
2. 변환
   - 설정된 플러그인은 추상 구문 트리를 탐색하며 변환이 필요한 노드를 찾아 변경
   - 여러 플러그인은 순차적으로 실행되어 추상 구문 트리를 점진적으로 변환
     (플러그인 간 순서는 중요하지 않나?)
   - @babel/traverse 패키지 활용 - 추상 구문 트리 노드를 깊이 우선 방식으로 탐색하면서 조작할 수 있는 기능 제공
3. 출력
   - 변환 단계에서 수정된 추상 구문 트리를 다시 코드로 변환해서 최종적으로 출력
   - @babel/generator 패키지 활용

## 바벨 사용해보기

### 바벨 구성 파일

- 바벨의 변환 작업을 정의하는 모든 옵션
- babel.config* 혹은 .babelrc.* 와 같은 확장자를 사용해 JS 혹은 JSON 파일로 생성
- 주요 옵션
  - presets: 바벨 프리셋 설정, 배열 형태로 여러 개 지정 가능
  - plugins: 플러그인 단위로 추가 가능
  - env: 환경(개발, 배포) 별 설정 분기
  - ignore, only: 특정 파일이나 디렉터리를 트랜스파일에서 제외 혹은 명시적 규정
  - exclude, include: 특정 플러그인이나 프리셋에 한해, 특정 파일이나 디렉터리를 트랜스파일에서 제외 혹은 명시적 규정
  - sourceMaps: 원본과 트랜스파일 코드의 매핑 정보 제공하는 소스맵 생성 여부 설정.
  - compact: 트랜스파일 코드의 개행과 공백을 제거하는 크기 최적화 여부 설정
  - minified: 트랜스파일 코드의 축소 여부 설정(compact + 세미콜론, 괄호 등 제거)
  - retainLines: 소스코드의 줄 수를 가능한 유지(가독성 담보)
  - extends: 다른 바벨 구성 파일을 확장
  - overrides: 특정 파일, 디렉터리에 대해 별도 바벨 구성

### 단독으로 사용하기

- 바벨 자체를 실행 가능한 명령어로 만들어주는 @babel/cli 사용하면 편리
  ```bash
  $ npm install --save-dev @babel/cli @babel/core
  ```
- 별도의 프리셋 지정하지 않으면 현재 프로젝트의 Node.js 환경을 대상으로 변환
- 명시적으로 특정 환경에서 호환되는 코드로 변환하려면 플러그인 혹은 프리셋 설정이 필요
  ```json
  {
    "presets": [
      [
        "@babel/preset-env",
        {
          "targets": {
            "esmodules": false,
            "ie": "11" // 인터넷 익스플로러 11 브라우저 목표 => ES5 명세로 변환
          }
        }
      ]
    ]
  }
  ```
- targets 필드
  - 코드가 실행될 환경을 지정
  - 현재 프로젝트가 목표로 하는 브라우저 환경 혹은 Node.js 버전을 명시해 필요한 변환과 폴리필을 최소화해 결과적으로 번들 크기를 줄이고 성능을 최적화할 수 있게 한다.
- 변환 명령어 실행

  ```bash
  $ npx babel src -d dist
  ```

  ```jsx
  const sum = (a, b) => a + b

  ======>

  var sum = function sum(a, b) {
    return a + b
  }
  ```

- 모든 명세가 변환 가능한 건 아니다(ex: Promise). 때문에 이를 해결하기 위해 전역에 생성하는 메서드나 객체가 필요한데 이를 폴리필이라고 한다. 5.2장에서 자세히 알아보자.

### 번들러와 함께 사용하기

- 바벨을 단독으로 사용하면 아래와 같은 제약이 있다. 이를 해결하기 위해 웹팩이나 롤업과 같은 모듈 번들러와 함께 사용한다.
  1. 모듈 시스템 변환 문제
     - 브라우저는 Node.js에서 사용하는 require 함수나 module.exports를 지원하지 않는다.
     - 이를 해결하기 위해 targets.esmodules 필드를 true로 하면 ES5에서 지원하지 않는 import/export 키워드를 변환하지 못해 문제가 된다.
  2. 최적화 문제
     - 바벨은 단독으로 코드 스플리팅을 지원하지 않는다. 모든 코드를 하나의 파일로 번들링 하게 되면 초기 로드 시간이 길어질 수 있다.
     - 사용하지 않는 코드를 알아서 제거해주지도 않는다.
     - 바벨은 JS만 변환하기 때문에 다른 유형의 파일은 관리할 수 없다.
- 웹팩에서 바벨을 적용하려면 babel-loader를 웹팩의 loader로 추가해 모듈을 처리할 수 있다.

  ```jsx
  // webpack.config.js 중 module 부분

  {
    "module": {
      "rule": [
        {
          "test": /\.js$/i,
          "exclude": /node_modules/,
          "use": {
            "loader": "babel-loader",
            "options": {
              "presets": [
                [
                  "babel/preset-env",
                  {
                    "targets": {
                      "ie": "11",
                    },
                    "modules": "auto", // 바벨이 모듈 번들러가 모듈 처리를 담당한다고 인식해 모듈 트랜스파일 작업은 건너뛴다.
                  },
                ],
              ],
            },
          },
        },
      ],
    }
  }
  ```
