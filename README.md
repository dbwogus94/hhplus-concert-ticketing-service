# 콘서트 예약 서비스

## 설계 및 참고 문서
- [마일 스톤](https://github.com/users/dbwogus94/projects/3)
- [요구사항](docs/1-요구사항.md)
- [시퀀스 다이어그램](docs/2-시퀀스다이어그램.md)
- [API 정의서](docs/3-API-정의서.md)
- [ERD 설계서](docs/4-ERD-정의서.md)
- [Swagger 이미지](docs/swagger.png)


## 서버 환경
- Programming Language: `Typescript ^5.0.0`
- Runtime: `Node.js ^20.15.0`
- Framework: `Nestjs ^10.0.0`
- ORM: `Typeorm ^0.3.x`
- DataBase: `Mysql 8`
- Test: `Jest ^29.5.0`


## 패키지 구조
*상세한 패키지 구조는 아직 고민하고 있습니다.
```
src
└── domain
    ├── concert           # 콘서트 서비스 모듈
    |   ├── performance
    │   └── seat           
    ├── reservation       # 예약 서비스 모듈
    │   └── payment
    ├── queue             # 대기열 서비스 모듈
    └── user              # 유저 서비스 모듈
        └── point         
```

