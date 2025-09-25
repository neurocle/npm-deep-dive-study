## 코드 스플리팅

- 하나의 큰 자바스크립트 파일을 여러 개의 작은 파일로 나누고, 필요한 시점에 필요한 코드만 로드할 수 있도록 하는 최적화 기술
- 초기 로딩 속도 개선 및 불필요한 리소스 낭비를 줄일 수 있음.

### 함수 동적 로드

- `import()`는 Promise를 반환하기 때문에, `await` 키워드를 사용해 비동기적으로 처리할 수 있음.

```js
async function loadModule() {
  const { myFunction } = await import("./module.js");
  myFunction();
}
```

### 리액트 컴포넌트 동적 로드

- `React.lazy`와 `Suspense`를 활용

```js
import React, { Suspense } from "react";

const LazyComponent = React.lazy(() => import("./LazyComponent"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Neuro-T에 코드 스플리팅 적용하기

1. Routing에 직접 관여하는 Page 컴포넌트들에 대해서만 `React.lazy`와 `Suspense`를 적용

   - Before
     ![Before](/images/etc_1_item_1.png)

   - After
     ![After](/images/etc_1_item_2.png)

2. SplitChunksPlugin 사용하기
   - After
     ![After](/images/etc_1_item_3.png)

### 빌드 도구 설정하기

#### Webpack

1. `dependOn` 옵션
   - 여러 진입점에서 공통으로 사용하는 모듈을 별도로 분리해 한 번만 번들링할 수 있음.
     - 코드 중복을 줄이고 브라우저 캐시를 효율적으로 활용할 수 있음.
     - 빌드 속도와 로딩 성능을 개선할 수 있음.
2. `SplitChunksPlugin` 사용
   - 웹팩에서 코드 스플리팅을 자동화할 수 있음.
     1. 새 청크를 공유할 수 있는 모듈이 `node_modules` 폴더에 있는 경우
     2. 새 청크가 20kb보다 클 경우
     3. 요청 시 청크를 로드할 때 최대 병렬 요청 수가 30개 이하일 경우
     4. 초기 페이지 로드 시 최대 병렬 요청 수가 30개 이하일 경우
   - 중복되는 모듈을 하나의 청크로 분리하거나, 특정 크기 이상의 파일을 자동으로 나눠 번들 크기 최적화

#### Vite

- 기본적으로 Rollup을 내부적으로 사용하기 때문에 코드 스플리팅이 자동으로 적용됨.
- 외부 라이브러리를 별도로 분리하거나 청크 전략을 직접 정의하고 싶다면 `build.rollupOptions.output.manualChunks` 옵션을 설정할 수 있음.

  - 변경 가능성이 적은 외부 라이브러리를 vnedor.js로 분리하면 브라우저 캐시를 효율적으로 사용할 수 있어 초기 로딩 속도가 개선됨.

    ```js
    import { defineConfig } from "vite";

    export default defineConfig({
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes("node_modules")) {
                return "vendor";
              }
            },
          },
        },
      },
    });
    ```

## 트리셰이킹

- 프로젝트에서 사용되지 않는 코드를 제거하는 최적화 기법

### 트리셰이킹이 동작하는 환경

- 트리셰이킹은 정적 분석 기반으로 작동
  - 코드가 실행되기 전에 구조를 분석해 사용되지 않는 코드를 정확히 찾아낼 수 있는 기법
  - 빌드 타임에 적용
- 트리셰이킹이 잘 동작하려면, 번들러가 모듈 간의 관계를 명확히 분석할 수 있도록 모듈이 구성되어야 함.
  - ESM: 정적 구조를 갖고 빌드 타임에 분석이 가능해 트리셰이킹이 효과적으로 적용됨.
    - `import`와 `export` 구문으로 모듈 간의 관계를 분석해 AST 기반의 의존성 그래프를 만듦.
  - CJS: 코드가 실행될 때 즉시 해당 모듈을 불러야 하고 비동기 로딩은 지원하지 않아 동작을 정확히 예측하기 어려움.

### ESM 기반의 라이브러리를 사용해야 하는 이유

- 라이브러리에서 필요한 기능만 가져오더라도 모듈 시스템이나 번들 설정이 제대로 되어있지 않으면 전체 라이브러리가 포함돼 번들 크기가 커질 수 있음.
- `lodash`는 CJS 방식으로 작성돼 트리셰이킹이 잘 적용되지 않음. → `es-toolkit`

### 부수 효과가 없는 코드 제거

- 부수 효과가 없는 코드는 번들링된 코드가 실행될 때 동작에 영향을 주지 않음.
- 번들러가 안전하다고 판단되면, 최종 번들에서 제거됨.

### 트리셰이킹 최적화를 위한 추가 설정

- 실제로 작성하는 코드에는 부수 효과가 포함될 때가 많음.
- 번들러가 이를 처리할 수 있도록 개발자가 직접 정보를 제공하거나, 번들러가 자동으로 최적화를 수행할 수 있음.

1. 주석 설정

   - `/* @__PURE__ */` 주석은 코드가 실행되더라도 사이드 이펙트가 없음을 번들러에게 명시적으로 알림.
     - 외부 상태에 영향을 주지 않는다고 단언

2. `sideEffects` 필드 활용

   - `package.json` 파일의 `sideEffects` 필드는 특정 파일이나 코드가 번들링 과정에서 제거되지 않도록 번들러에 알려주는 역할을 함.
   - 모든 파일(`true`/`false`) 또는 특정 파일이나 디렉토리(`[]`)를 제거하지 않도록 설정할 수 있음.

3. 특정 파일이나 디렉토리를 제거하지 않도록 설정하기

## 번들러 설정

- 트리셰이킹으로 사용하지 않는 코드를 제거하더라도, 빌드 결과물에는 불필요한 공백이나 주석, 최적화되지 않은 표현 등이 남아있을 수 있음.
- `minify`를 통해 코드 크기를 추가로 줄여야 최종 번들의 성능을 극대화할 수 있음.

### Webpack

```js
// webpack.config.js
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
```

### Vite

```js
// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: "esbuild",
  },
});
```

## 참고 자료

- [Bundling Fundamentals](https://frontend-fundamentals.com/bundling/)
- [Webpack | SplitChunksPlugin](https://webpack.kr/plugins/split-chunks-plugin/)
