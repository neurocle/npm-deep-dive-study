## 1. 의존성 트리 분석의 핵심 `@npmcli/arborist`

- `arborist`: 수목 관리 전문가
- `@npmcli/arborist`는 `node_modules`와 `package.json`의 트리를 관리하기 위한 CLI 도구

```js
const Arborist = require("@npmcli/arborist");

const arborist = new Arborist({
  path: "/path/to/project", // 프로젝트의 최상위 디렉터리
  registry: "https://registry.npmjs.org", // npm 패키지를 다운로드할 레지스트리
});
```

### 1. `loadActual`

- `node_modules` 내부의 실제 트리를 확인할 수 있는 메서드
- 파일 시스템을 직접 스캔해서 `node_modules` 디렉터리 내 모든 패키지를 검색
- 패키지 간의 의존성 관계를 파악해 전체 의존성 트리를 구성
  - `package.json`에 선언된 의존성과 실제로 `node_modules`에 설치된 패키지가 일치하는지 확인
  - 두 트리 간에 차이가 발견되면 상황에 따라 `node_modules`를 다시 구축해야 할 수도 있다.
- 패키지를 설치하면 그 패키지의 하위 패키지도 함께 설치된다.
  - `node_modules`에서 하위 패키지는 부모 패키지와 동등한 수준에서 설치된다.

### 2. `AboristNode`

- 프로젝트의 의존성 트리 내 각 노드를 나타내는 객체
  - `name`: 패키지 이름
  - `version`: 패키지 버전
  - `location`: 설치 경로(`path`로 지정한 경로를 기준으로 한 상대 경로)
  - `path`: 설치 경로(절대 경로)
  - `resolved`: 패키지의 `tarball` 경로
  - `Edge`: 의존성 관계를 나타낼 때 사용하는 객체
    - `edgesIn`(`Set`): 다른 노드들이 현재 노드를 의존하는 관계
      - `Set` 자료구조를 사용한 이유는 특정 노드가 다른 노드에 의해 여러 번 의존 관계를 맺을 수 있기 때문이다.
    - `edgesOut`(`Map`): 현재 노드가 다른 패키지들에 대해 가지고 있는 의존성
      - `Map` 자료구조를 사용한 이유는 패키지의 의존성은 중복이 존재하지 않고, 키를 통해 빠르게 의존성을 찾기 위해서다.
  - `type`: 각 의존성의 선언 종류
    - `prod`: `dependencies`
    - `dev`: `devDependencies`
    - `peer`: `peerDependencies`
    - `optional`: `optionalDependencies`

### 3. `loadVirtual`

- 가상의 트리를 만드는 메서드
- `loadActual`이 `node_modules`를 직접 스캔해서 트리를 구축하는 것과는 달리, `package-lock.json`이나 `npm-shrinkwrap.json`을 기반으로 의존성 트리를 생성한다.
- 대표적으로 **npm ci**에서 사용된다.

### 4. `buildIdealTree`

- `package.json`과 `package-lock.json`을 바탕으로 가장 *이상적인 트리*가 만들어진다.
  - `package.json`에 선언된 의존성 버전을 충족하면서 중복 설치와 버전 충돌을 최소화한 구조

1. `package.json`을 기반으로 최상위 노드를 만들고 `loadVirtual`을 통해 가상 트리 로드 → `idealTree`의 초기 변수로 사용
2. 오래된 락 파일이 있는지 확인하고, 최신 버전에서도 호환될 수 있도록 업데이트
3. 사용자의 요청(패키지 수정/제거 등)을 적용
4. `package.json`을 분석해서 각 의존성(`deps`, `devDeps` 등)을 해석하고, 이 의존성을 기반으로 트리를 구축
   - 버전 충돌 시 자체적인 알고리즘에 따라 버전 충돌을 해결
5. 각 패키지의 설치된 유형에 따라 플래그 생성
   - `Extraneous`: `package.json`에 명시돼 있지 않지만 `node_modules`에는 존재하는 패키지 → 향후 제거된다.
   - `peer`: `peerDeps`
   - `dev`: `devDeps`
   - `optional`: **npm**이 설치하는 데 실패하더라도 프로젝트가 정상적으로 작동할 수 있는 패키지
6. 의존성을 불러오는 데 실패한 작업이 존재한다면 에러를 발생
7. 완성된 `idealTree`를 현재 환경과 비교해서 호환되는지 확인하고, 호환되지 않는 패키지가 있다면 에러 or 경고 메시지 출력

### 5. `reify`

- `buildIdealTree`에서 생성한 이상적 트리를 실제로 `node_modules`에 설치하고 `package-lock.json`에 반영하는 과정

1. `reify`가 실행되는 위치에 `node_modules`가 존재하는지 확인 (없는 경우 생성)
2. `actual` 트리와 `ideal` 트리 생성하고 상호 비교
3. 두 트리 간의 차이를 바탕으로 필요한 변경 사항을 확인하고, 필요 시 패키지를 `node_modules`에서 단계별로 설치하거나 제거
4. 이상적인 트리의 내용을 현재 트리에 복사해서 동기화 → 두 트리 간의 무결성 유지
5. 의존성에 대한 보안 취약점을 검사하고 발견된 정보를 제공 (`audit`)

### 6. `audit`

- **npm** 패키지의 취약점을 살펴보기 위해 사용하는 명령어
- 취약점 상세 URL, 취약점명, 영향받는 버전 등의 정보를 포함한다.

1. 취약점을 분석해야 하는 패키지 목록을 가져온다.
2. 취약점 분석을 위한 정보를 가져온다.
3. 취약점을 분석하고 보고한다.

## 2. 패키지 설치를 위한 패키지. `pacote`

- 실제 패키지를 **npm**에서 가져오는 역할 수행

### 1. `manifest`

- 패키지의 이름과 버전을 인자로 받아 해당 패키지의 `manifest` 정보를 가져온다.
  - `name`, `version`, `dependencies`, `dist`, `engines` 등의 정보를 포함
  - `react@19.1.1`과 같은 형태로 전달
- `pacote.manifest`는 `buildIdealTree`를 수행할 때에도 사용되는 메서드다.

### 2. `tarball`

- `tarball` 데이터를 메모리에 불러오는 작업을 수행
- `.tgz` 확장자의 `Buffer` 형태로 반환되며, 이 데이터를 바탕으로 패키지를 설치하거나 관리하는 데 사용

### 3. `extract`

- `tarball`을 불러오고 파일을 압축 해제에서 파일 시스템에 저장

## 3. `node_modules` 살펴보기

### 1. 평탄화된 `node_modules`

- **npm**이 생성하는 `node_modules`의 특징으로, 모든 `node_modules` 내부의 폴더를 평탄화해서 같은 레벨의 폴더에 일괄적으로 설치한다.

1. 동일한 패키지의 중복 설치 문제
2. 깊으면 깊어질수록 덩달아 길어지는 경로

- 이러한 방식의 구조 최적화는 패키지 설치 속도를 높이고 디스크 공간을 절약할 수 있으며, 코드의 일관성을 유지하는 데 도움을 준다.

> [!TIP]  
> 평탄화 알고리즘은 **유의적 버전이 해결할 수 있는 선**에서만 동작한다.
> ![평탄화 알고리즘](/images/ch_2_4_item_1.png)

> [!CAUTION]  
> 평탄화 알고리즘은 **유령 의존성(phantom dependency)** 문제를 야기한다.
>
> ```json
> {
>   "dependencies": {
>     "A": "^1.0.0",
>     "C": "^1.0.0",
>     "D": "^1.0.0"
>   }
> }
> ```
>
> ```ts
> const B = require("B"); // No Error.
> ```

### 2. npm이 중복 설치를 피하는 방법

- `package.json`의 의존성 해결이 유의적 버전의 문법 규칙 안에서 해결 가능할 때만 이뤄진다.

1. 폴더 구조상 동일한 하위에 똑같은 이름의 다른 버전의 서로 다른 두 개의 패키지를 설치할 수 없기 때문이다.
2. 특정 버전을 지우고 평탄화를 진행하게 되면, 특정 버전을 사용하고 있던 패키지에서 유의적 버전의 규칙에 따라 코드의 정합성이 깨질 가능성이 매우 높아진다.
