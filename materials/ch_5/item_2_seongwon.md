- 모든 ES6의 명세를 트랜스파일만으로는 구형 브라우저에서 실행 가능한 코드로 완벽하게 대체할 수 없음.
  - `Promise`를 변환하기 위해서는 `Promise`의 모든 인터페이스와 메서드 구현을 포함한 동일한 객체를 전역에 새롭게 정의해야함.
- 폴리필(`Polyfill`): 트랜스파일만으로는 해결되지 않는 기능들을 지원하기 위해 동일한 이름으로 전역에 생성되는 메서드나 객체
  - 대표적인 자바스크립트 라이브러리 → `core-js`
  - 바벨은 이 `core-js`를 프리셋과 플러그인에서 폴리필 기능으로 포함해서 설정할 수 있게 돕는다.

## 1. `core-js`란 무엇인가?

- 자바스크립트 폴리필 라이브러리
- 최신 ECMAScript 표준과 아직 표준으로 채택되지 않은 제안(proposal) 기능까지 지원한다.
- 모듈화가 잘 되어있어 필요한 기능만 선택적으로 로드할 수 있다.
- 일부 기능은 폴리필로 구현할 수 없다. (런타임 자바스크립트 엔진 수준의 깊은 통합과 최적화 필요)
  - `Reflect.construct`
  - 꼬리 호출 최적화
  - 일부 심볼 기능
  - 클래스 비공개(private) 필드와 메서드 등

## 2. 바벨과 `core-js`

- `core-js`는 직접 설치해서 사용할 수도 있지만, 일반적으로는 바벨의 트랜스파일 기능과 함께 사용
  - 개발자가 직접 어떤 폴리필이 필요한지 결정하지 않아도 돼 `core-js`를 단독으로 사용하는 것보다 더 권장되는 방법

### 1. `@babel/preset-env`에 `core-js` 설정하기

- `@babel/preset-env` 프리셋의 옵션으로 `corejs` 필드를 추가해서 `core-js` 폴리필 사용을 정의

  ```js
  module.exports = {
    presets: [
      [
        '@babel/preset-env'
        {
          corejs: { version: '3.39.0', proposals: false },
          useBuiltIns: 'usage',
          targets: { browsers: ['ie >= 11'] }
        }
      ]
    ]
  }
  ```

  - `corejs`: 사용할 `core-js`의 버전과 기타 폴리필 최적화 설정을 할 수 있는 필드
  - `targets.browsers`: 브라우저 환경을 지정해서 필요한 폴리필만 포함하게 할 수 있는 필드
  - `useBuiltIns`: 바벨이 폴리필을 어떻게 처리할 것인지 동작 모드를 설정할 수 있는 옵션
    - `usage`: 코드에서 실제로 사용된 ECMAScript 기능에 대해서만 필요한 폴리필을 자동으로 추가하는 모드
    - `entry`: 엔트리 파일에서 한 번에 폴리필을 추가하는 모드, 개발자는 프로젝트의 엔트리 포인트가 되는 파일에 명시적으로 폴리필을 추가해야 한다.
      - 불필요한 폴리필까지 포함될 수 있어 번들 크기가 더 커질 수 있다.
      - 라이브러리가 지원해야 하는 호환성이 불분명하거나 특정 환경에서 완전한 호환성을 보장해야 하는 경우 유용할 수 있다.

- 폴리필이 불필요한 모듈은 `core-js`를 포함하지 않은 채 트랜스파일되며, 폴리필을 필요로 하는 경우 바벨이 `core-js`를 `require()` 함수로 가져와서 폴리필을 자동으로 추가한다.

### 2. 런타임에 `core-js` 폴리필을 로드하기

- `core-js` 패키지를 직접 임포트하거나 프리셋에서 설정하는 방식은 좋지 않을 수 있음.
  1. 큰 번들 크기
  2. 전역 네임스페이스 오염
- 전역 오염이 없는 `core-js`를 사용하며 헬퍼 함수를 모듈로써 사용할 수 있도록 바벨에서는 `@babel/plugin-transform-runtime`을 제공
  - `@babel/runtime`을 의존성으로 포함
    - 바벨이 트랜스파일한 코드에서 공통적으로 필요한 헬퍼 함수들을 제공해 코드 중복을 줄임.
  - 필요한 `core-js` 폴리필을 포함하는 모듈을 동적으로 로드하는 데 사용할 수 있는 `regeneratorRuntime`을 포함
- 바벨이 최신 자바스크립트 기능을 트랜스파일할 때 필요한 헬퍼 함수와 폴리필을 동적으로 처리하기 때문에 번들 사이즈를 더욱 줄일 수 있다.
- `@babel/preset-env`의 `corejs`와 `useBuiltIns` 옵션을 제거해야 한다.

  ```js
  module.exports = {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            browsers: ["ie >= 11"],
          },
        },
      ],
    ],
    plugins: [
      [
        "@babel/plugin-transform-runtime",
        {
          corejs: { version: 3, proposals: false },
          absoluteRuntime: false,
          useESModules: false,
          helpers: true,
          regenerator: true,
        },
      ],
    ],
  };
  ```

  - `corejs`: `@babel/plugin-transform-runtime`이 의존성으로 포함하는 `@babel/runtime`을 사용한 `core-js` 설정을 할 수 있는 옵션
    - ` version`은 2 또는 3으로 고정된다.
  - `absoluteRuntime`: 바벨이 생성하는 트랜스파일된 코드에서 런타임 헬퍼 함수와 폴리필이 절대 경로로 참조되도록 하는 옵션
    - 사용자의 프로젝트 외부에 있는 `node_modules`나 `npm link`로 연결된 모듈 또는 CLI 라이브러리인 경우, 이 옵션으로 폴리필의 절대 경로 설정을 통해 빌드 시스템에서 발생할 수 있는 모듈의 경로 해석 문제를 해결하고 헬퍼 함수들이 정확한 경로에서 로드되게 한다.
  - `useESModules`: `true`로 설정하면 CommonJS를 사용하는 `@babel/plugin-transform-modules-commonjs` 플러그인을 사용하지 않아 번들 크기를 더 줄일 수 있다.
  - `helpers`: 기본적으로 헬퍼 함수는 `@babel/runtime`에서 임포트해서 사용하지만, `corejs` 필드를 3으로 지정하면 내부적으로 `@babel/runtime-corejs3`을 사용해 필요한 폴리필을 제공한다.
  - `regenerator`: 필요한 경우에만 `regenerator-runtime/runtime`을 모듈 범위에서만 사용하도록 처리해 전역 공간의 오염을 방지하는 옵션
    - `babel@7` 이전 버전에서는 비동기 함수를 트랜스파일 하기 위해서는 `regenerator-runtime/runtime`을 전역에 import해야 했음.
    - `@babel/plugin-transform-runtime`은 `regenerator` 옵션으로 `regenerator-runtime`을 자동으로 포함함.

## 정리

|    특징     | `@babel/preset-env` + `core-js` | `@babel/runtime-corejs3` + `@babel/plugin-transform-runtime` |
| :---------: | :-----------------------------: | :----------------------------------------------------------: |
|  전역 오염  |      전역 객체를 오염시킴       |                        전역 오염 없음                        |
|  번들 크기  |          더 클 수 있음          |                   더 작을 수 있음(최적화)                    |
| 설정 난이도 |              간단               |                         약간 더 복잡                         |
|   의존성    |        `core-js`만 필요         |      `@babel/runtime-corejs3`가 런타임 의존성으로 필요       |
