<!-- 해당 챕터를 정리한 내용을 적어주세요 -->
# yarn: 신속하고 안정적인 패키지 관리를 위한 패키지 관리자
> 빠른 속도와 안전성을 주요 특징으로 한 자바스크립트 패키지 관리자. 대규모 프로젝트나 모노레포 환경에서 유용
## yarn 소개와 역사
### yarn의 탄생
> `yet another resource negotiator`

yarn이 등장한 당시 `npm-shrinkwrap.json`파일을 수동으로 생성해야만 버전 고정이 가능했음. 이로 인해 npm은 의존성 설치 순서에 따라 `node_modules`의 구조가 달라졌으며, 설치 순서가 같다면 알파벳순으로 정렬되어 구조거 결정되었다.

설치 환경과 상황에 따라 `node_modules`의 구조가 달라질 수 있다는 점에 많은 우려가 있었고 이후 npm ci기능과 새로운 락 파일을 통한 결정적 트리 생성을 가능하게한 npm@7등장 전까지 문제점으로 지적되었다.

그외의 문제도 많았지만 주요 문제인 의존성 문제를 해결하기 위해 페이스북은 패키지 관리자를 새로 구현하게됨

현재는 `npm install -g yarn` 명령어로 설치해 bin스크립트와 유사하게 사용하는 것이 일반적이지만 초기에는 시스템 자체에 설치하는 것을 권장했다.
이를 통해 yarn은 npm의 완전한 대체제를 목표로 했음을 알 수 있고 당시 npm의 문제점에 대한 비판을 엿볼 수 있다.

### yarn@2 (yarn berry)의 등장과 논란
1. `npm install -g yarn`에 대한 지원을 중단 => 적응 할 만한 변경
2. `Plug'n'Play(PnP)`모드가 기본값을 설정 => 불타는 감자
  - node_modules의 모든 패키지를 압축된 zip파일로 관리하는 방식
  - node.js를 읽을 수 없어서 yarn node 명령어로 실행
  - 자동완성기능을 지원하는 에디터에서도 node_modules를 읽을 수 없어 추가 설정 필요
  - node_modules를 직접 참조하는 일부 대형패키지 (플로, RN)을 사용할 수 없음
3. 1.x 버전의 유지보수 중단하고 취약점만 대응

오픈 소스로서 가능한 일을 했다는 입장과 이러한 급격한 변화라면 npm과 yarn classic(yarn@1)을 잇는 새로운 패키지 관리자로 보는 것이 맞다는 입장으로 갈리게 되었다.

혼란을 진정시키기 위해 yarn팀이 초기보다 유연한 접근을 보이고 논란은 사그라들었다. 다만 이때를 기점으로 npm@5.x로 돌아가거나 pnpm으로 갈아타는 개발자가 늘어났다. 

또한, 결국 페이스북 내부에서도 pnp를 도저히 지원할 수 없게되자 사용을 포기하게 되었다.

### yarn berry@4.x
yarn은 여전히 npm 대비 속도와 안정성에서 우수한 성능을 보여주며 꾸준히 많은 사용자에게 사랑받고 있다. yarn berry는 지속적으로 기능을 추가하며 yarn은 새로운 표준이 되었다. 

2.x에서 급격한 변화가 많은 반발을 불어일으킨 것과 달리 3.x와 4.x에서는 사용에 큰 영향이 가는 변경을 최대한 자제하고 있어 안정적으로 사용자층을 확장하고 있다.

## 특징
### yarn.lock
여러 기기에서 동일한 의존성을 설치하도록 `package.json`보다 정확한 의존성 정보를 기록한다.

1. `package.json` 표준 JSON포맷 vs `yarn.lock` YAML과 비슷해 보이지만 실제로는 자체적인 포맷
- 읽기 쉽고, diff를 확인하기 쉽고, 빠르게 파싱 가능하도록

    ~~JSON은 읽기 쉽지않으며 YAML은 빠르게 파싱이 안된다고 자체적인 포맷을 만들었지만 yarn berry에서는 YAML 표준을 따르게 됨~~

2. 레포지토리 주소
- 과거 npm의 레지스트리의 호스팅 업체가 설치 속도에 영향을 미침. 속도 문제를 해결하고 패키지 다운로드 속도를 최적화하기 위해 클라우드플레어를 통해 리버스 프락시 형태로제공

    ~~2018.04 부터 npm도 플라우드플레어를 사용해 문제를 해결했고, 이후 yarn은 리버스 프락시를 끄고 CNAME으로 대체~~


### Play n Play(PnP)
#### Play n Play 살펴보기
프로젝트를 package.json을 yarn을 통해 설치하면 node_modules가 없음
```
// index.js
const react = require('react')

console.log(react.version)
```
node index.js 명령어로 실행 시 react 패키지를 찾지 못해 에러가 발생. 
(`yarn run start`로 실행하면 정상적으로 실행)

**node_modules이 없는 상황에서 react패키지를 정확히 실행할 수 있는 이유**

yarn start는 `node -r ./.pnp.cjs index.js`와 동일한 명령어. `-r` 키워드는 require의 줄임말로, 특정 프로그램이 실행 전 모듈을 사전에 로드하도록 지시하는 역할. 
즉, yarn으로 실행하면 생성된 `./.pnp.cjs`를 먼저 로드하는 것

#### .pnp.cjs
`.yarn.lock`와 유사하게 패키지의 의존성 구조를 담고 추가로 해당 패키지의 위치까지 명확히 작성되어있음.
yarn의 PnP는 require 함수 자체를 변조하지 않고, require가 모듈을 찾을 때 사용하는 module을 수정한다.
```
const nodeModule = require('module')

// module에 findPnpApi속성이 있는지 검사
console.log(Object.getOwnPropertyNames(nodeModules).includes('findPnpApi'))
```
```
$ node index.js
false
```
```
$ node -r ./.pnp.cjs index.js
true
```
applyPatch함수를 통해 원래 Module의 작업을 오버라이드해 다양한 작업을 수행한다.
=> node_modules 폴더를 탐색하는 대신, 자신이 관리하는 패키지 경로에서만 검색하게 한다.

pnp모드로 탐색을 단일 경로로 한정하면 모듈을 찾는 속도도 향상시키고 의존성을 명시하지 않은 패키지는 사용할 수 없게된다.

또한 yarn은 글로벌 캐시 폴더를 활용하여 한번 다운받은 패키지는 다른 폴더에서도 빠르게 다운받을 수 있게 되었다.
`.yarn/berry/cache`폴더에서 확인가능하며, 이전에 다운된 패키지가 전부 .zip으로 압축된 파일 형태로 존재한다.

yarn은 다운로드의 비효율성과 인터넷 상태에 따른 불분명함을 해결하기 위해 로컬의 글로벌 폴더에 패키지를 저장해두는 방식을 채택했다.
=> 디스크 공간 절약 가능

단점)
- .pnp.cjs 파일이 필수적이기에 버전 관리시스템에 포함해야함
- yarn을 통해 설치해야함
- IDE 사용 시 별도의 설정 필요
- node_modules를 직접 참조하는 방식에서는 사용이 불편

#### PnP 모드를 끄는 법
`.yarnrc.yml` 파일에 아래 설정 추가
`nodeLinker: node_modules`

### 오프라인 설치
`.yarnrc.yml` 파일에 아래 내용 추가하여 저장한 뒤 yarn 명령어로 설치
`enableGlobalCache: false`

.yarn 폴더 전체를 버전 관리 시스템에 포함하면 소스코드를 가져오는 것으로 필요한 의조성을 설치할 수 있게된다.

장점)
- 폐쇄적인 환경에서의 사용가능
- 향상된 가독성

단점)
- git이 모든 부담을 가지게됨

### 플러그인 시스템
기본적인 동작외에도 사용자가 원하는 작업을 수행할 수 있는 API를 추가할 수 있도록 함.
기존의 한계를 넘어 유연한 패키지 관리 경험을 제공

### yarn이 생성하는 파일과 디렉터리
- .yarn/cache: 오프라인 설치를 활성화했을 때 생성되는 폴더
- .yarn/install-state.gz: 최적화를 위한 파일. 현재 프로젝트의 정확한 상태를 저장한 다음, 이를 바탕으로 명령어를 빠르게 실행하기 위해 생성
- .yarn/patches: yarn patch의 정보를 저장하는 파일
  > yarn patch는 node_modules에 있는 패키지를 직접 수정할 수 있는 패치를 제공. 저장소를 사용하는 모든 사용자가 변경된 패키지를 사용할 수 있게 함.
- .yarn/plugins: plugins의 목록이 들어있는 폴더
- .yarn/release: yarn 특정 버전을 설정하는 경우 yarn 파일이 담김. 저장소에 커밋하면 모든 사용자가 공유
- .yarn/sdks: yarn과 IDE가 원활하게 동작하기 위한 SDK를 모아두는 곳. 
- .yarn/unplugged: pnp 시스템 내에서 동작하지 않아 제외된 패키지 목ㄹ록을 확인할 수있다.
- yarn.lock: 실제 의존성 기록
- .yarnrc.yaml: yarn관련 설정

## 결론
- 새로운 표준 자바스크립트 패키지 관리자가 되었으며 다양한 기능과 유연한 확장성을 가지고 있다.
- yarn의 기능이 프로젝트에 도움이 된다면 고려해보자
