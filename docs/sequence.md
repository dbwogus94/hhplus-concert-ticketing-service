## UseCase 시퀀스 다이어 그램

- [UseCase 시퀀스 다이어 그램](#usecase-시퀀스-다이어-그램)
  - [1. 유저와 대기열 서비스 시퀀스 다이어그램](#1-유저와-대기열-서비스-시퀀스-다이어그램)
  - [2. 콘서트 예약 시퀀스 다이어그램](#2-콘서트-예약-시퀀스-다이어그램)
  - [3. 결제 시퀀스 다이어그램](#3-결제-시퀀스-다이어그램)
  - [4. 유저 서비스 - 포인트 조회 충전](#4-유저-서비스---포인트-조회-충전)


### 1. 유저와 대기열 서비스 시퀀스 다이어그램
> [!NOTE] 
> 놀이공원(유량제어) 방식 대기열의 “상태” 변화를 중점으로 표현했습니다.

```mermaid
sequenceDiagram
    actor Client
    participant Waiting as 대기열 서비스
    participant Concert as 콘서트 서비스
    participant Payment as 결제 서비스
    participant DB 

    Client->>+Waiting: 대기열 등록 요청
    Waiting->>+DB: 유저 상태 업데이트 ('NONE' -> 'WAIT')
    DB-->>-Waiting: 업데이트 확인
    Waiting-->>-Client: 대기열 등록 완료
    
    loop 특정 시간 마다 반복
        Waiting->>+DB: 대기 유저 n명 상태 변경 ('WAIT' -> 'ACTIVE')
        DB-->>-Waiting: 상태 변경 확인
    end

		loop Polling 방식으로 요청
	    Client->>+Waiting: 대기열 조회 요청
	    Waiting->>+DB: 유저 상태 조회
	    DB-->>-Waiting: 유저 상태 반환 ('WAIT' 또는 'ACTIVE')
	    Waiting-->>-Client: 대기열 상태 정보
		end

    alt 유저 상태가 ACTIVE일 경우
        Client->>+Concert: 좌석 예약 요청
        Concert->>+DB: 좌석 "임시 예약" 상태로 변경
        DB->>-Concert: 좌석 업데이트 확인
        Concert-->>Client: 예약 완료
        Concert->>-Waiting: 유저 상태 변경 요청 ('ACTIVE' -> 'EXPIRE')
    
    else 시간 임계점 초과
        Waiting->>+DB: 유저 상태 변경 ('ACTIVE' -> 'EXPIRE')
        DB-->>-Waiting: 상태 변경 확인
    end

```

### 2. 콘서트 예약 시퀀스 다이어그램
> [!NOTE] 
> 콘서트 좌석이 “임시 예약” 되고 “예약 완료” 되는 일련의 과정을 중점으로 표현했습니다.


```mermaid
sequenceDiagram
    actor Client
    participant Concert as 콘서트 서비스
    participant Order as 주문 서비스
    participant DB
    %% note right of Client: .

    %% 예약 가능 날짜 조회
    Client->>+ Concert: "콘서트의 날짜 목록" 조회 요청
    Concert->>+ DB: 콘서트의 날짜별 상태 조회
    DB-->>- Concert: 데이터 리턴
    Concert-->>- Client: "콘서트의 날짜 목록" 응답

    %% 특정 날짜 예약 가능 좌석 조회
    Client->>+ Concert: "선택한 날짜의 콘서트 좌석 목록" 조회 요청
    Concert->>+ DB: 선택한 날짜의 콘서트 좌석 조회
    DB-->>- Concert: 데이터 리턴
    Concert-->>- Client: "선택한 날짜의 콘서트 좌석" 목록 응답

    %% 좌석 예약 요청
    Client->>+ Concert: "콘서트 좌석 예약" 요청
    Concert->>+ DB: 좌석 예약 가능한 상태인지 확인
    DB-->>- Concert: 데이터 리턴

    alt "예약가능" 상태 라면? 
        Concert->>+ DB: 좌석 상태 변경 ('예약가능' -> '임시예약')
        DB-->>- Concert: 업데이트 확인
        Concert-->> Client: "콘서트 좌석 예약" 성공 응답
        %% Event
        Concert->> Order: 주문 서비스에 주문 생성 알림
        Order->>+ DB: 주문 "결제대기" 상태로 생성
        DB-->>- Order: 생성 확인

    else "임시예약" 또는 "예약완료" 상태 라면?
        Concert-->>- Client: 예약 불가능한 상태라는 에러 응답
    end

    Client->>+Order: "예약한 좌석 결제" 요청
    Order->> DB: 주문 확인
    Order-->> Client: "예약한 좌석 결제" 완료 응답
    %% Event
    Order->>- Concert: 콘서트 서비스에 결제 완료 알림
    Concert->>+ DB: 좌석 상태 변경 ('임시예약' -> '예약완료')
    DB-->>-Concert: 상태 변경 확인
```

### 3. 결제 시퀀스 다이어그램
> [!NOTE] 
> 예약된 공연을 결제 하는 일련의 과정을 중심을 표현했습니다.
> - 결제는 대기열 토큰이 필요하지 않습니다.

```mermaid
sequenceDiagram
    actor Client
    participant Order as 주문 서비스
    participant Concert as 콘서트 서비스
    participant DB
    
    note right of Order: 포인트 조회 로직은 편의상 DB를 조회로 표기했습니다.

    %% 결제 요청
    Client->>+ Order: "예약한 좌석 결제" 요청
    Order->>+ DB: 주문이 "결제대기" 상태인지 확인
    DB->>- Order: 데이터 리턴

    alt 주문이 "결제대기" 상태라면?
        Order->>+ DB: 포인트 조회
        DB-->>- Order: 데이터 리턴

        alt 포인트 잔액이 충분하다면?
            Order->>+DB: 포인트 변경
            DB-->>-Order: 업데이트 확인
            Order->>+ DB: 주문 상태 변경 ('결제대기' -> '결제완료')
            DB-->>- Order: 업데이트 확인
            Order-->> Client: 결제 완료 응답
            %% Event
            Order->>Concert: 결제 완료 알림
            Concert->>+DB: 콘서트 좌석 상태 변경 ('임시예약' -> '예약완료')
		        DB-->>-Concert: 상태 변경 확인
		        

        else 포인트 잔액이 부족하다면?
            Order-->> Client: 잔액 부족 에러 응답
        end
    else 주문이 "결제완료" 상태라면?
        Order-->>Client: 결제가 완료된 주문이라는 에러 응답
    else 주문이 존재하지 않는다면?
        Order-->>- Client: 주문이 존재하지 않는다는 에러 응답
    end

```


### 4. 유저 서비스 - 포인트 조회 충전
> [!NOTE] 
> 포인트 조회, 포인트 충전에 관해 명시 했습니다.


```mermaid
sequenceDiagram
    actor Client
    participant User as 유저 서비스
    participant DB

    %% 포인트 조회
    Client->>+User: "포인트 잔액" 조회 요청
    User->>+DB: 포인트 잔액 조회 
    DB-->>-User: 데이터 리턴
    User-->>-Client: "포인트 잔액" 응답

    %% 포인트 충전
    Client->>+User: "포인트 충전" 요청
    User->>+DB: 포인트 변경
    DB-->>-User: 업데이트 확인
    User-->>-Client:  "포인트 충전" 응답

```