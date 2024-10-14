# ERD 설계서

## 1. ERD

```mermaid
---
title: 콘서트 예매 서비스
---

erDiagram
		%% 만료날짜는 이후 Redis의 TTL 기능...
    Queue {
        int id PK
        int userId
        int concertId
        QueueStatus status
        datetime createdAt
        datetime expireAt
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
        int concertId
        date openDate
        datetime startAt
        PerformanceStatus status
    }
    Seat {
        int id PK
        int performanceId
        int position
        int amount
        SeatStatus status
    }

    %% 예약은 따로
    %% 취소를 고려하면? UQ: userId & seatId & state 
    Reservation {
        int id PK
        int userId 
        int seatId 
        datetime createdAt
        ReservationStatus status
    }
    Payment {
        int id PK
        int reservationId
        int billingPrice
        int payPrice
        datetime createdAt
    }

    %% 유저 서비스
    User {
        string id PK
        string name
        string email
    }
    Point {
        int id PK
        int userId
        int amount
    }
    PointHistory {
        int id PK
        int userId
        int amount
        string type
        datetime createdAt
    }

    %% generates: 1:1 관계에서 필수 
    %% reserves: 0 or 1 관계 (옵셔널)
    %% places: 1:N 관계에서 1 ~ N개
    %% has: 1:N 관계에서 0 ~ N개 (옵셔널)
    Concert ||--|{ Performance : "has"
    Performance ||--|{ Seat : "has"

    %% 좌석 취소를 고려하면 N : 1 로 해야한다.
    Seat ||--o{ Reservation : "has"

    %% 결제 취소를 고려하면 N : 1 로 해야한다.
    Reservation ||--|{ Payment : "has"

    User ||--o{ Reservation : "makes"
    User ||--|| Point : "has"
    User ||--o{ PointHistory : "has"
```

## 2. ERD 관계 설명

### 콘서트 서비스

- `Consert`(콘서트)와 `Performance`(공연)는 1 : N 관계를 가집니다.
- `Performance`와 `Seat`는 1 : N 관계를 가집니다.
- `Seat`와 `Resrvation`은 1 : N 관계를 가집니다.
    - 좌석 점유시간 초과나 취소등을 고려해 1 : N으로 설정되어야 한다고 생각했습니다.

### 예약 서비스

- `Resrvation`는 반드시 1개의 `Payment`를 가집니다.
    - 결제 취소 분할 결제 등을 고려해 1 : N으로 설정되어야 한다고 생각했습니다.

### 유저서비스

- User와 Point는 1 : 1 관계를 가집니다.
- User와 PointHistory는 1 : N 관계를 가집니다.

