# 최선의 폴리필과 트랜스파일은 무엇일까?

어떤 특징이 폴리필과 트랜스파일을 설정하는 데 영향을 미치는지 확인하고 바벨과 core-js의 올바른 적용법을 알아보자

## 지원 환경 명시하기

- 프로젝트가 목표로 하는 브라우저 범위와 Node.js의 버전 범위를 명확히 하면, 불필요한 폴리필과 트랜스파일을 줄여 번들 크기를 최소화할 수 있다.

## 브라우저 범위를 명시하는 방법: browserlist

- 프런트엔드 도구들이 공통된 브라우저 및 Node.js 버전 설정을 공유할 수 있게 하는 도구

  - 프로젝트 전체에서 일관된 브라우저 호환성을 유지
  - 정기적인 업데이트를 통해 최신 브라우저 정보를 반영하는 것이 프로젝트의 알맞은 트랜스파일과 폴리필을 적용하는 데 도움이 됨

- 다양한 브라우저 기능의 지원 정보를 담고 있는 caniuse-lite를 참조
- 바벨, ESLint, Autoprefixer, webpack 등의 도구가 browserlist를 활용한다.
- package.json의 browserlist 필드 혹은 .browserlistrc 파일을 통해 지원 범위를 관리할 수 있다.
- 다음과 같은 특수한 기준으로도 설정이 가능하다.
  - 시장 점유율 기준(caniuse-lite 혹은 별도 기준)으로 설정도 가능하다.
  - 최신 버전 기준
  - 특정 브라우저 버전 지정
  - 특정 Node.js 버전 지정
  - 브라우저가 지원하는 기능 기준(ex: fully supports es6)
  - 유지보수 상태(ex: 최근 24개월 동안 업데이트가 없거나 점유율이 매우 낮은 브라우저 제외)
- 기본 설정은 다음과 같다.(최신 브라우저와 시장 점유율이 높은 브라우저 포함)
  ```plain
  > 0.5%
  last 2 versions
  Firefox ESR
  not dead
  ```
- and or 연산자를 활용해 보다 정확한 기준 설정이 가능하다.
- [browserlist](https://browsersl.ist/) 웹사이트를 통해 쿼리 조건에 부합하는 브라우저 및 Node.js 버전 범위 등을 쉽게 확인할 수 있다.
  (CLI 패키지로도 사용 가능)

## core-js-compat

- browserlist로 설정한 지원 범위에 알맞은 폴리필 코드만을 추가하는 패키지
- JS 프로젝트에서 폴리필 요구사항을 분석하는 데 사용(core-js와 함께 사용)
- 바벨의 core-js 플러그인 babel-plugin-polyfill-corejs3의 의존성으로 포함돼 있어 바벨과 browserlist가 서로 긴밀하게 동작할 수 있게 지원한다.

## @babel/preset-env의 targets 필드

- targets 필드를 활용해 목표 환경 범위 내에서 바벨이 트랜스파일해야 할 플러그인만을 적용할 수 있다.
- 브라우저 혹은 Node.js 버전을 특정하거나, 복합 조건을 사용해 범위를 지정할 수 있다.
- package.json이나 .browserlistrc에 정보가 있다면 target 지정 없이도 사용 가능하다. 만약 지정된 타겟이 없다면 구형 브라우저 호환성을 위해 ES5로 트랜스파일 한다. 이를 유념해 불필요한 빌드 크기를 줄일 필요가 있다.

## @babel/plugin-transform-runtime과 browserlist 함께 사용하기

- 런타임 폴리필 적용할 때도 지원 범위 지정이 가능하다.
- 오픈소스 패키지를 만들 때 불필요한 헬퍼 함수 코드를 줄이고 전역 오염이 없는 core-js를 사용하고자 할 때 함께 사용 가능

## 폴리필의 올바른 주입 방법

- @babel/runtime-corejs3의 corejs.version 옵션은 "2"나 "3"만 허용
- 이로 인해 @babel/plugin-transform-runtime과 @babel/preset-env는 폴리필 적용에 있어 큰 차이점이 발생
- @babel/runtime-corejs3가 주 버전의 core-js만을 지원하기 때문에 부.수 버전에서 추가되거나 수정된 폴리필 코드를 사용할 수 없다.
- 이 문제를 해결하기 위해, 바벨은 폴리필 추가 시 @babel/runtime-corejs3 대신 babel-plugin-polyfill-corejs3 사용 권장한다.(동일한 역할 하지만 특정 core-js 부.수 버전 지정 가능)
- 폴리필 주입 방식을 결정하는 method와 versions 등의 옵션을 설정해 사용 가능하다.

## 지원 범위를 선정하는 기준

1. 사용자 기반

   - GA 및 Amplitude와 같은 분석 및 통계 도구 활용해 실제 유저가 어떤 브라우저와 버전을 사용하는 지 확인 후 기준을 선정할 수 있다.

2. 프로젝트 성격과 요구사항

   - B2B 서비스처럼 특정 기업에서 사용하는 경우, 정책에 맞춰 버전을 지정할 수 있다.

3. 브라우저 및 Node.js의 최신 기능 활용

   - 프로젝트가 요구하는 JS의 기능 범위에 따라 기준 결정할 수 있다.

4. 사용 중인 프레임워크 및 라이브러리

   - React 18부터는 ES5 지원이 중단 => 최소 ES6의 브라우저 환경을 기준으로 잡을 수 있다.
