# npm의 주요 명령어

패키지 설치와 버전 관리, 스크립트 실행 등 프로젝트 운영에 필수적인 npm 명령어를 살펴본다.

## `npm run`

- `npm run` 뒤에 오는 명령어를 package.json에서 찾아서 실행하는 역할
  > `npm run commit`
- script에 특별한 인수를 전달하고 싶으면 `--` 사용
  > `npm run commit -- --date="now"`
- `npm run`을 실행하면, node_modules가 PATH에 추가된다. 따라서 `npm run commit` 명령어는 다음과 같이 실행된다고 볼 수 있다.
  > `node_modules/.bin/cz`

## `npm install`과 `npm ci`

- 두 명령어 모두 package.json에 선언된 의존성을 설치하는 명령어

### `npm install`

- `package-lock.json`의 존재 유무와 관계 없이 실행 가능
  - 존재하지 않는 경우: `package.json`에 선언돼 있는 버전 공식에 맞춰 설치 후, `package-lock.json` 생성
  - 존재하는 경우: `package-lock.json`에 따라 설치. `package-lock.json`에 없거나 `package.json` 내용과 맞지 않은 패키지를 설치할 때 `package-lock.json`를 업데이트

### `npm ci`

- `package-lock.json`이 존재하는 경우만 실행 가능
- `package-lock.json`에 명기된 의존성을 정확하게 설치하는 것이 목적이기 때문에 `package-lock.json`가 없거나 `package.json` 내용과 맞지 않으면 에러 발생

## `npm update`

- `package.json`에 명시된 버전을 기준으로 의존성을 업데이트하는 명령어
- 업데이트 내용을 `package.json`에도 반영하고 싶다면 `npm update --save`를 실행

## `npm dedupe`

- 현재 패키지 트리를 기반으로 의존성을 단순화하는 명령어
- 서로 다른 버전의 `c` 패키지를 의존하고 있는 `a`, `b`패키지가 존재하는 경우, `npm dedupe` 명령어를 통해 모든 조건에 충족하는 하나의 `c` 패키지만을 남겨 node_modules에 있는 불필요한 중복을 정리할 수 있다.
- `npm dedeupe --dry-run` 혹은 `npm find-dedupes` 통해 변경 사항을 미리 검토할 수 있다.

## `npm ls`

- `npm ls` => node_modules의 구조 및 버전 확인 가능
- `npm ls <패키지명>` => `package.json` 내 `<패키지>`에 의존하고 있는 모든 패키지를 트리 구조로 확인 가능
- 실제 설치된 의존성, 의존성 간 관계, peerDependencies 이슈 파악 등에 유용

## `npm explain`

- `npm explain <패키지명>` => 대상 의존성이 왜 설치됐는지 근거 파악 가능

## `npm audit`

- npm에서 제공하는 보얀 취약점을 검사
- `npm audit fix` 통해 유의적 버전을 해치지 않는 선에서 취약점 해결도 가능

## `npm publish`

- 현재 패키지를 레지스트리에 업로드
- 기본 배포 파일 규칙, `.npmignore`, `files` 등의 세팅에 따라 파일이 선택적으로 업로드 됨
- 한 번 업로드된 파일을 돌리는 것은 매우 어렵기 때문에, 준비가 완료된 경우에만 신중하게 사용해야 한다.

## `npm deprecate`

- 특정 버전 혹은 패키지 전체를 지원 중단 처리(패키지 권한이 필요)
- `npm depreacte <패키지명> "<지원 중단 사유 및 대안>" => 패키지 사용자가 확인 가능

## `npm outdated`

- 설치된 패키지 중 최신 버전이 아닌 패키지 확인

## `npm view`

- 패키지 정보 확인(name, version, dependencies 등)
- 패키지 설치 여부, dependencies 등록 여부와 무관하게 실행 가능
- `npm info`, `npm show`, `npm v`와 같은 명령어
