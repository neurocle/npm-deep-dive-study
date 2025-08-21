## 1. 오픈소스 패키지가 **CommonJS**와 **ESModule**을 동시에 지원하는 이유

- 주로 **Node.js**로 작성하는 서버 환경은 **CommonJS**를, 클라이언트 측에서는 표준 모듈 시스템인 **ESModule**을 주로 사용해왔다.
- 서버와 클라이언트 양쪽을 모두 지원해야 하는 애플리케이션이나 범용 라이브러리를 개발할 때는 두 모듈 시스템을 동시에 지원하는 것이 필수적일 수 있다.
  - 개발자와 사용자 모두가 예상치 못한 호환성 문제나 런타임 에러를 방지
  - 다양한 환경에서의 일관된 동작을 보장
  - 코드의 재사용성
  - 다양한 개발 환경 지원

## 2. **CommonJS**와 **ESModule**을 동시에 지원하는 듀얼 패키지 개발하기

### 1. `"main"`과 `"module"` 필드

- 패키지를 배포할 때 `"main"` 필드를 사용해 외부에서 패키지를 불러올 때의 진입 파일을 지정할 수 있다.
  - **Node.js**에서 `package.json`의 `"main"` 필드로 선언한 파일은 기본적으로 **CommonJS**로 해석된다.
  - 즉, `"main"` 필드만 존재하는 패키지는 `require()` 함수나 **ESModule**의 `import`로 불러올 수 있다.
    - 단, **ESModule**에서는 **CommonJS** 파일을 이름으로 내보낸 경우가 아니라면 직접 이름으로 `import`할 수 없다.
- `"main"` 필드와는 별도로 `"module"` 필드를 추가해서 **ESModule**에서 로드할 수 있는 파일 경로를 명시할 수 있다.

  - `"module"` 필드는 **npm**에서 공식적으로 지원된 적이 없으나, **Node.js**에서 **ESModule**을 지원하기 전부터 상호운용성 확보를 위해 사용되기 시작해 개발자들 사이에서 널리 사용됨에 따라 사실상 표준처럼 자리잡음.

    - ex) **Rollup**은 `package.json`에서 `"module"` 필드가 있는 경우 이를 **ESModule**로 인식해 빌드한다.

```json
{
  "name": "my-package",
  "main": "index.js",
  "module": "index.mjs"
}
```

### 2. 조건부 내보내기

- **Node.js** 13.2.0 버전부터는 `"module"` 필드 대신 `"exports"` 필드를 사용해 듀얼 패키지를 개발하는 것이 훨씬 더 효율적이다.
  - `"main"`과 마찬가지로 패키지의 진입점을 지정할 수 있지만 더 상세하게 특정 조건에 따라 내보내는 경로를 직접 설정할 수 있다.
  - `"exports"` 필드에 작성하는 경로는 `package.json` 파일 위치를 기준으로 하는 상대 경로
- `"exports"` 필드를 사용하면 **CommonJS**와 **ESModule** 각각의 진입점을 다르게 지정할 수 있다.
  - `"import"`: `import`나 `import()`로 패키지를 로드하거나 **ESModule**로 로드되는 경우에 사용되는 진입점
  - `"require"`: `require()`로 패키지를 로드할 때의 진입점
  - `"default"`: 모든 조건에 일치하는 기본값이며, 일반적으로 가장 마지막에 조건이 일치할 때 사용된다.
  - `"node"`: **Node.js** 환경을 위한 조건. **CommonJS**, **ESModule** 파일 모두 지정할 수 있지만 자주 사용되지 않는다.
  - `"node-addons"`: **Node.js** 환경에서 네이티브 C++ 애드온을 위한 진입점
- `"exports"` 필드의 키가 먼저 정의된 항목이 더 높은 우선순위를 가지므로, 가장 구체적인 조건부터 시작해 보편적인 조건 순으로 작성한다.
  - 조건 객체를 중첩해서 특정 환경에만 적용하는 것도 가능하다
    ```json
    {
      "exports": {
        "node": {
          "import": "./node.mjs",
          "require": "./node.cjs"
        },
        "import": "./index.mjs",
        "require": "./index.cjs",
        "default": "./index.mjs"
      }
    }
    ```

> [!NOTE]  
> [CommonJS와 ESM에 모두 대응하는 라이브러리 개발하기: exports field](https://toss.tech/article/commonjs-esm-exports-field)

## 3. 순수한 **ESModule** 패키지 개발하기

- 패키지 개발자의 입장에서 이중 패키지를 지원하는 것은 생각만큼 간단하지 않다.
  - **CommonJS**와 **ESModule**의 차이점
  - 각 환경별로 발생하는 예외 처리
  - 모듈 시스템의 충돌 등
- 이러한 복잡성으로 인해 최근에는 오로지 **ESModule**로만 패키지를 지원하려는 움직임도 늘어나고 있다.

### 1. 이중 패키지 위험성 (Dual Package Hazard)

```js
import { run } from "my-package";

import x1 from "my-package-esm";
import x2 from "my-package-cjs";

try {
  console.log("Running ES module plugin:");
  run(x1);
  console.log("Success");
} catch (exception) {
  console.error(exception);
}

try {
  console.log("Running CommonJS plugin:");
  run(x2); // TypeError: Please pass an X for mjs!
  console.log("Success");
} catch (exception) {
  console.error(exception);
}
```

- **CommonJS**와 **ESModule**의 모듈 내보내기 방식 차이로 **CommonJS**로 작성되어 **ESModule** 환경에서 임포트한 객체와 **CommonJS**로 가져온 객체가 서로 다른 객체로 인식됨.

#### 1. 이중 패키지 위험성을 피하면서 이중 패키지를 제공하는 방법

> - 조건
>   1. 패키지는 `require()`와 `import`를 통해 모두 사용 가능해야 한다.
>   2. 패키지는 **ESModule**을 지원하지 않는 구 버전의 **Node.js**와 브라우저 환경에서도 동작해야 한다.
>   3. 패키지의 주요 진입점은 `require()`를 통해 로드되면 **CommonJS** 파일로, `import`를 통해 로드되면 **ESModule** 파일로 인식된다.
>   4. 패키지는 이름으로 내보내기를 지원함으로써 `import pkg from 'pkg';` `pkg.name` 형식으로 사용할 수 있어야 한다.
>   5. 패키지는 브라우저 등 **ESModule**을 지원하는 다른 환경에서도 사용 가능해야 한다.
>   6. 이중 패키지 위험을 피하거나 최소화해야 한다.

1.  **ESModule** 래퍼 사용하기

    - 패키지를 **CommonJS**로 작성하거나 **ESModule** 소스를 **CommonJS**로 변환한 후, 이름으로 내보내기를 정의하는 **ESModule** 래퍼 파일을 추가하는 것

      ```cjs
      // pkg/index.cjs
      exports.name = "value";

      // pkg/wrapper.mjs
      import cjsModule from "./index.cjs";
      export const name = cjsModule.name;
      export default cjsModule;
      ```

      - 기존 **CommonJS** 패키지를 리팩터링하지 않고 **ESModule**까지 지원하고자 할 때
      - **CommonJS**와 **ESModule** 여부에 상관없이 동일한 의존성을 가져야 할 때
      - 패키지의 내부 상태를 별도로 관리하지 않고 **ESModule**을 추가적으로 지원하고자 할 때

2.  상태를 격리하기

    - **CommonJS**와 **ESModule**의 진입점을 분리해서 각각 개별적인 모듈로 정의하는 방법

      - 두 모듈이 동등한 역할을 하는 경우 유용한 접근 방식
      - 패키지의 상태가 격리되거나 패키지가 상태를 저장하지 않아야 한다.
        - **CommonJS**와 **ESModule**의 두 가지 버전이 동시에 애플리케이션에서 사용될 수 있기 때문
          1. 인스턴스화된 객체 내에 상태를 포함
          2. **CommonJS**와 **ESModule**이 동일한 상태(동일한 **CommonJS** 파일)를 참조하도록 설정

      ```json
      {
        "type": "module",
        "exports": {
          "import": "./index.mjs",
          "require": "./index.cjs"
        }
      }
      ```

      - 패키지가 **ESModule** 구문으로 작성되어 `import`와 `require` 구문을 지원하는 모든 환경에서 사용돼야 할 때
      - 상태를 저장하지 않는 패키지이거나 상태가 필요한 경우 쉽게 격리할 수 있을 때
      - 패키지가 내부 의존성을 가지지 않거나 의존성을 가져도 상태를 저장하지 않거나 상태를 공유하지 않아도 될 때

### 2. 거대한 패키지 사이즈

- 하나의 패키지에서 **CommonJS**와 **ESModule**의 두 가지 모듈 시스템을 동시에 지원하려면 동일한 코드를 두 모듈 시스템 버전으로 각각 배포해야 하므로 번들 크기가 두 배가 된다.
- 서비스에서 사용하는 프레임워크가 의존성 라이브러리들을 트리 셰이킹해서 최종 사용자에게 전달하는 코드의 크기를 줄여 준다고 해도 이중 패키지를 사용하는 프로젝트에는 여전히 라이브러리 무게로 인한 여러 가지 문제가 발생한다.
  - CI/CD 파이프라인과 서버리스 환경에서의 부담
  - 사용하지 않는 50%의 코드 때문에 설치 속도가 느려지고 불필요한 디스크 공간을 차지

### 3. ESModule로 전환하기까지의 험난한 여정

- 준비
  1. `package.json`의 `"type"` 필드를 `"module"`로 설정하고, `exports` 맵을 사용한다면 **ESModule** 빌드 결과물의 경로를 지정한다. `main` 필드를 사용하는 경우에도 **ESModule**의 경로로 수정한다.
  2. 기존 **CommonJS**로 작성된 코드가 있다면 파일 내 **CommonJS**에서만 사용할 수 있는 코드를 모두 **ESModule** 코드로 대체한다.
  3. 사용 중인 번들러가 **ESModule**로 빌드되도록 설정을 수정하고, 프레임워크가 **ESModule**을 해석할 수 있도록 설정을 조정한다.
- 타입스크립트 설정
  ```json
  {
    "compilerOptions": {
      "module": "es6", // 타입스크립트가 사용하는 모듈 형식
      "target": "es6", // 컴파일된 자바스크립트의 버전 (target과 module 설정이 서로 호환돼야 한다.)
      "moduleResolution": "node16", // 모듈 해석 방식을 정의
      "esModuleInterop": true, // CommonJS와 ESModule 간의 상호운용성을 개선
      "allowSyntheticDefaultImports": true // CommonJS 모듈에서 기본 내보내기를 허용
    }
  }
  ```
- 지원 환경 검증
  - `@arethetypeswrong/cli`
  - 빌드 매트릭스 및 E2E 테스트

## 4. **CommonJS**와 **ESModule**, 무엇이 정답일까?

### 주장 1: **CommonJS**가 자바스크립트를 해치고 있다.

- **CommonJS**의 한계점
  1. **CommonJS**의 동기적 모듈 로딩 방식은 브라우저 환경에서 비효율적이다.
  2. 모듈을 최적화하기 어려워 사용하지 않는 모듈을 제거하여 번들 크기를 최소화하기가 힘들다.
  3. 브라우저에서 기본적으로 지원되지 않기 때문에 웹팩, Rollup, Parcel 같은 번들러와 트랜스파일러가 필요하다.
- **Node.js**는 초기부터 **CommonJS**로 작성돼 왔고, 기존의 **CommonJS** 인터페이스를 **ESModule**로 완전히 전환하기에는 많은 제약이 따른다.
  - **CommonJS** 진입점을 유지하면서 **ESModule** 진입점도 추가해 두 모듈 시스템을 동시에 지원하기로 결정
    - **ESModule**과의 상호 운용성 문제는 패키지 작성자의 몫으로 남음.
    - 이중 패키지 위험성 역시 패키지 작성자가 해결해야 할 문제로 전가됨.
- 클라우드 컴퓨팅이 에지 컴퓨팅, 서버리스 컴퓨팅 등의 방향으로 발전하며 서버 환경이 변화하고 있는 상황에서 **CommonJS**는 더 이상 최선의 선택이 아닐 수 있음.

> [!NOTE]  
> [[Korean FE Article] CommonJS가 자바스크립트를 해치고 있습니다.](https://kofearticle.substack.com/p/korean-fe-article-commonjs)

### 주장 2: **CommonJS**는 사라지지 않을 것이다.

1. **CommonJS**는 **ESModule**보다 모듈을 로드하고 시작하는 속도가 더 빠르다.
   - **ESModule**이 모듈 그래프 전체를 로드하고, 각 `import` 문에서 `await`을 통해 비동기 처리를 기다려야 하기 때문
2. 점진적 로딩
3. 수많은 **CommonJS** 패키지와 프로젝트의 존재
