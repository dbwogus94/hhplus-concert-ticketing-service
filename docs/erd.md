# ERD 설계서

## 1. ERD

```mermaid
---
title: 콘서트 예매 서비스
---

%% 생의 주기가 같은 경우만 FK를 사용한다.
%% 유저서비스는 userId를, 외부서비스는 Uid? 이상한데..
erDiagram
   
    %% 유저 서비스
    User {
        string id PK
        string name
        string email
    }
    Point {
        int id PK
        string userId FK
        int amount
    }
    PointHistory {
        int id PK
        string userId FK
        int amount
        string type
        datetime createdAt
    }

    %% 콘서트 예약 서비스
    Concert {
        int id PK
        string name
        string description
        date startDate
        date endDate
    }
    Performance {
        int id PK
        int concertId FK
        date openDate
        datetime startAt
        PerformanceStatus status
    }
    Seat {
        int id PK
        int performanceId FK
        int position
        int amount
        SeatStatus status
    }

    %% 예약은 따로
    %% 취소를 고려하면? UQ: userUid & performanceId & seatId & state 
    Reservation {
        int id PK
        string userId 
        int performanceId 
        int seatId 
        datetime createdAt
        %% ReservationStatus status
    }

    %% 주문 서비스
    Order {
        int id PK
        string userId FK
        int reservationId FK
        int amount
        OrderStatus status
        datetime createdAt
    }

    Payment {
        int id PK
        int orderId FK
        int amount
        datetime createdAt
    }

     Queue {
        int id PK
        string userId
        int concertId
        QueueStatus status
        datetime createdAt
    }
    

    %% reserves: 0 or 1 관계
    %% places: 0개 이상
    %% generates: 1:1 관계에서 필수
    User ||--o{ Reservation : "makes"
    User ||--o{ Order : "places"
    User ||--|| Point : "has"
    User ||--o{ PointHistory : "has"

    Order ||--|| Payment : "has"

    Concert ||--|{ Performance : "has"
    Performance ||--|{ Seat : "has"

    %% 취소를 고려하면 N : 1 로 해야한다.
    Reservation ||--|| Seat : "reserves"
    %% 취소를 고려하면 1 : N 로 해야한다.
    Reservation ||--|| Order : "generates"
    %% User ||--o{ Queue : "joins"
```

## 2. ERD 관계 설명

### 유저서비스

- User와 Point는 1 : 1 관계를 가집니다.
- User와 PointHistory는 1 : N 관계를 가집니다.

### 주문서비스

- `Order`은 반드시 1개의 `Resrvation`을 가집니다.
    - 취소를 고려한다면 1 : N으로 조정되어야 합니다.
- `Order`는 반드시 1개의 `Payment`를 가집니다.
    - 취소를 고려한다면 1 : N으로 조정되어야 합니다.

### 콘서트 서비스

- `Consert`(콘서트)와 `Performance`(공연)는 1 : N 관계를 가집니다.
- `Performance`와 `Seat`는 1 : N 관계를 가집니다.
- `Seat`와 `Resrvation`은 1 : 1 관계를 가집니다.
    - 취소를 고려한다면 1 : N으로 조정되어야 합니다.