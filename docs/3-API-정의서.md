> [!NOTE] 목차
> API 정의서

- [1. 공통 응답 형식](#1-공통-응답-형식)
  - [1.1. 성공 응답](#11-성공-응답)
  - [1.2. 성공 코드: `StateCode`](#12-성공-코드-statecode)
  - [1.3. 에러 응답](#13-에러-응답)
  - [1.4. 에러 코드: `ErrorStateCode`](#14-에러-코드-errorstatecode)
- [2. API 리스트](#2-api-리스트)
  - [2.1. 전체 API](#21-전체-api)
  - [2.2. 대기열 토큰이 필요한 API](#22-대기열-토큰이-필요한-api)
- [3. API EndPoint](#3-api-endpoint)
  - [3.1. 유저 대기열 토큰 발급 API](#31-유저-대기열-토큰-발급-api)
  - [3.2. 대기열 토큰 상태 조회 API](#32-대기열-토큰-상태-조회-api)
  - [3.3. 예약가능한 날짜 조회 API](#33-예약가능한-날짜-조회-api)
  - [3.4. 날짜로 예약 가능한 좌석 조회 API](#34-날짜로-예약-가능한-좌석-조회-api)
  - [3.5. 좌석 예약 요청 API](#35-좌석-예약-요청-api)
  - [3.6. 결제 요청 API](#36-결제-요청-api)
  - [3.7. 잔액 충전 API](#37-잔액-충전-api)
  - [3.8. 잔액 조회 API](#38-잔액-조회-api)


## 1. 공통 응답 형식

### 1.1. 성공 응답

```json
{
	 "stateCode" : "${StateCode}",
	 "message" : "성공",
	 "data" : {...}
}
```

| 필드명 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| `stateCode` | string | ✅ | 상태코드 |
| `message` | string | ✅ | 응답 메세지 |
| `data` | any |  | 응답 데이터  |

### 1.2. 성공 코드: `StateCode`

| 코드 | 설명 |
| --- | --- |
| `200` | 요청에 성공했습니다. |
| `201` | 자원 생성(수정) 요청에 성공했습니다. |
| `202` | 요청에 성공했지만, 처리중입니다. |
| `204` | 요청에 성공, 응답할 내용은 없습니다. |

### 1.3. 에러 응답

```json
{
	 "stateCode" : "${ErrorStateCode}",
	 "message" : "${ErrorMessage}",
}
```

| 필드명 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| `stateCode` | string | ✅ | 상태코드 |
| `message` | string | ✅ | 응답 에러 메세지 |

### 1.4. 에러 코드: `ErrorStateCode`

| 코드 | 설명 |
| --- | --- |
| `400` | 요청 매개변수가 맞지 않는 경우 응답하는 에러입니다. |
| `401` | 인증이 필요한 API에 요청에 인증 헤더가 없거나 유효하지 않는다는 에러입니다. |
| `404` | 서버에 요청한 자원이 없을때 응답하는 에러입니다. |
| `409` | 요청 처리 과정에서 충돌이 발생하면 응답하는 에러입니다. |
| `500` | 서버에서 로직 처리중 문제가 발생하면 응답하는  에러입니다.  |

## 2. API 리스트

### 2.1. 전체 API

1. 유저 대기열 토큰 발급 API
    1. `POST /v1/queue/tokens`
2. 유저 토큰 상태 조회 API
    1. `GET /v1/queue/tokens`
3. 예약가능한 날짜(공연) 조회 API
    1. `GET /v1/performances?concertId=:concertId&date=:date`
4. 날짜로 예약 가능한 좌석 조회 API 
    1. `GET /v1/performances/:performanceId/seats`
5. 좌석 예약 요청 API
    1. `GET /v1/reservations`
6. 결제 API
    1. `GET /v1/reservations/:reservationId/payment`
7. 잔액 충전 API
    1. `PATCH /v1/users/:userId/point`
8. 잔액 조회 API
    1. `GET /v1/users/:userId/point`

### 2.2. 대기열 토큰이 필요한 API

1. 예약가능한 날짜 조회 API
2. 날짜로 예약 가능한 좌석 조회 API 
3. 좌석 예약 요청 API

## 3. API EndPoint

### 3.1. 유저 대기열 토큰 발급 API

<aside>
📌

콘서트에 대기큐에 사용할 유저 토큰 발급 API

</aside>

- **URL:** `/v1/queue/tokens`
- **Method:** `POST`
- **Headers:**
    - `accept: application/json`
- **Resquest body**
    
    ```json
    {
      "userUid": string,
      "concertId": string, 
    }
    ```
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `userUid` | string | ✅ | 유저를 식별하는 UUID 입니다. |
    | `concertId` | number | ✅ | 대기큐를 발급받을 콘서트 ID 입니다. |
- **Response Body Data**
    
    ```json
    {
    	"queueToken": string,
    	"dateTime": string,
    }
    ```
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `queueToken` | string | ✅ | queue 토큰 입니다. |
    | `dateTime` | string | ✅ | 발급된 시간 |
- **Response State Code**:
    - `201`
- **Response Error State Code**
    - `400`:  파라미터 오류
    - `404`: 유저 또는 콘서트가 존재하지 않습니다.
    - `409`: 이미 발급된 토큰이 있습니다.
    - `500`: 서버 에러
- **예시**
    
    ```json
    **URL: POST /**v1**/**queue/tokens
    
    body: {
     "stateCode" : "201",
     "message" : "성공",
     "data" : {
    	 	"queueToken": string,
    		"dateTime": string,
    	}
    }
    ```
    

### 3.2. 대기열 토큰 상태 조회 API

<aside>
📌

유저 토큰 상태를 조회 API 입니다.

토큰 만료시간 어떻게? 

- **Wait ⇒ Active로 전환되고 최초 진입시 제한시간을 가진 JWT 토큰을 새로 발급한다?**
</aside>

- **URL:** `/v1/queue/tokens/:id`
- **Method:** `GET`
- **Headers:**
    - 
- **Resquest body**
    - x
- **Response Body Data**
    
    ```json
    {
    	"tokenId": number,
    	"waitingNumber": number,	
    	"state": "Wait" | "Active" | "Expire",
    	"queueToken": string;
    }
    ```
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `waitingNumber` | number | ✅ | 예상 대기시간 |
    | `state` | string | ✅ | 큐 상태 |
- **Response State Code**
    - `200`
- **Response Error State Code**
    - `401`: 인증 에러
    - `500`: 서버 에러
- **Response 예시**
    
    ```json
    **URL: GET /**v1**/**queue/tokens/:id
    
    {
     "stateCode" : "200",
     "message" : "성공",
     "data" : {
    	 	"waitingNumber": 12,
    		"state": "WAIT",
    	}
    }
    
    {
     "stateCode" : "200",
     "message" : "성공",
     "data" : {
    	 	"waitingNumber": 12,
    		"state": "Active",
    	}
    }
    ```
    

### 3.3. 예약가능한 날짜 조회 API

<aside>
📌

콘서트의  예약 가능한 날짜(공연)를 조회합니다.

</aside>

- **URL:** `GET /v1/performances?concertId=:concertId`
- **Method:** `GET`
- **Headers:**
    - `Authorization: Bearer ${queueJWT}`
- **Resquest Query**
    
    ```json
    {
    	"concertId": "number",
      "state": "Available" | "Deadline" | null,
    }
    ```
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `concertId` | number | ✅ |  콘서트 ID |
    | `state` | string |  | 해당 날짜 공연 상태 |
    
- **Response Body Data**
    
    ```json
    {
    	"totalCount": number,
    	"results": [
    		{
    			"id": numbet,
    		 	"concertId": number,
    		 	"openDate": date, // YYYY-MM-DD
    	    "startAt": date, // YYYY-MM-DD hh:mm:ss
    	    "state": "Available" | "Deadline",
    		}
    	]
    }
    ```
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `totalCount` | number | ✅ | 총 조회 가능 개수 |
    | `results` | array | ✅ | 조회된 공연정보 리스트 |
    
    **[results]**
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `id` | number | ✅ | 공연 ID |
    | `concertId` | number | ✅ | 콘서트 ID |
    | `openDate` | date | ✅ | 공연 오픈날짜 |
    | `startAt` | date | ✅ | 공연 시작시간 |
    | `state` | string | ✅ | 공연 예약 마감 상태 |
    
- **Response State Code**
    - `200`
- **Response Error State Code**
    - `400`: 파라미터 오류
    - `401`: 인증 에러
    - `404`: 콘서트가 존재하지 않습니다.
    - `500`: 서버 에러
- **Response 예시**
    
    ```json
    {
     "stateCode" : "200",
     "message" : "성공",
     "data" : {
    		"totalCount": 30,
    		"results": [
    			{
    				"id": 1,
    			 	"concertId": 10,
            "openDate": "2024-01-01",
            "startAt": "2024-01-01 15:00:00",
      	    "state": "Available",
    			}
    			...
    		]
    	}
    }
    ```
    

### 3.4. 날짜로 예약 가능한 좌석 조회 API

<aside>
📌

콘서트의 예약 가능한 날짜의 좌석 조회합니다.

</aside>

- **URL:** `/v1/performances/:performanceId/seats`
- **Method:** `GET`
- **Headers:**
    - `Authorization: Bearer ${queueJWT}`
- **Resquest Query**
    
    ```json
    {
      "state": "Available" | "Reserved" | "Booked" | null,
    }
    ```
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `state` | string |  | 해당 날짜 공연 상태 |
- **Response Body Data**
    
    ```json
    {
    	"totalCount": number,
    	"results": [
    		{
    			"id": numbet,
    		 	"position": number,
    		 	"amount": number,
    	    "state": "Available" | "Reserved" | "Booked",
    		}
    	]
    }
    ```
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `totalCount` | number | ✅ | 총 조회 가능 개수 |
    | `results` | array | ✅ | 조회된  |
    
    **[results]**
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `id` | number | ✅ | 좌석 ID |
    | `position` | number | ✅ | 공연 좌석 번호 |
    | `amount` | date | ✅ | 공연 좌석 가격 |
    | `state` | string | ✅ | 좌석 상태 |
    
- **Response State Code**
    - `200`
- **Response Error State Code**
    - `400`: 파라미터 오류
    - `401`: 인증 에러
    - `404`: 콘서트 또는 공연이 존재하지 않습니다.
    - `409`: 좌석이 예약 가능한 상태가 아닙니다.
    - `500`: 서버 에러
- **Response 예시**
    
    ```json
    {
     "stateCode" : "200",
     "message" : "성공",
     "data" : {
    		"totalCount": 30,
    		"results": [
    			{
    				"id": 1,
    			 	"position": 13,
    			 	"amount": 50000,
    		    "state": "Available",
    			}
    			...
    		]
    	}
    }
    ```
    

### 3.5. 좌석 예약 요청 API

<aside>
📌

좌석 예약을 요청 합니다.

</aside>

- **URL:** `/v1/reservations`
- **Method:** `POST`
- **Headers:**
    - `Authorization: Bearer ${queueJWT}`
- **Resquest Body**
    
    ```json
    {
      "userUid": string,
      "performanceId": number,
      "seatId": number,
    }
    ```
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `userUid` | string | ✅ | 유저 UUID |
    | `performanceId` | number | ✅ | 공연 ID |
    | `seatId` | number | ✅ | 좌석 ID |
    
- **Response Body Data**
    
    ```json
    {
    	"reservationId": number,
    }
    ```
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `reservationId` | number | ✅ | 임시 예약된 ID |
    
- **Response State Code**
    - `201`
- **Response Error State Code**
    - `400`: 파라미터 오류
    - `401`: 인증 에러
    - `404`: 콘서트 또는 공연이 존재하지 않습니다.
    - `500`: 서버 에러
- **Response 예시**
    
    ```json
    {
     "stateCode" : "201",
     "message" : "성공",
     "data" : {
    		"reservationId": 10,
    	}
    }
    ```
    

### 3.6. 결제 요청 API

<aside>
📌

임시 예약된 좌석 결제 API

</aside>

- **URL:** `/v1/reservations/:reservationId/payment`
- **Method:** `POST`
- **Headers:**
    - `Authorization: Bearer ${queueToken}`
- **Resquest Body**
    
    ```json
    {
    	"userUid": string,
    }
    ```
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `userUid` | string | ✅ | 유저 UUID |
    | `reservationId` | number | ✅ | 예약 ID |
- **Response Body Data**
    
    ```json
    {
    	"paymentId": number,
    }
    ```
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `paymentId` | number | ✅ | 결제 ID |
- **Response State Code**
    - `201`
- **Response Error State Code**
    - `400`: 파라미터 오류
    - `500`: 서버 에러
- **Response 예시**
    
    ```json
    {
     "stateCode" : "201",
     "message" : "성공",
     "data" : {
    		"paymentId": 10,
    	}
    }
    ```
    

### 3.7. 잔액 충전 API

<aside>
📌

포인트 잔액 충전 API

</aside>

- **URL:** `/v1/users/:userId/point`
- **Method:** `PATCH`
- **Headers:**
    - x
- **Resquest Body**
    
    ```json
    {
    	"amount": number,
    }
    ```
    
    | 필드명 | 타입 | 필수여부 | 설명 |
    | --- | --- | --- | --- |
    | `amount` | number | ✅ | 충전 가격 |
- **Response Body Data**
    - x
- **Response State Code**
    - `204`
- **Response Error State Code**
    - `400`: 파라미터 오류
    - `404`: 유저가 존재하지 않습니다.
    - `500`: 서버 에러
- **Response 예시**
    
    ```json
    {
     "stateCode" : "201",
     "message" : "성공",
     "data" : {
    		"paymentId": 10,
    	}
    }
    ```
    

### 3.8. 잔액 조회 API

- **URL:** `/v1/users/:userId/point`
- **Method:** `GET`
- **Headers:**
    - x
- **Resquest Body**
    - x
- **Response Body Data**
    - x
- **Response State Code**
    - `200`
- **Response Error State Code**
    - `400`: 파라미터 오류
    - `404`: 유저가 존재하지 않습니다.
    - `500`: 서버 에러
- **Response 예시**
    
    ```json
    {
     "stateCode" : "201",
     "message" : "성공",
     "data" : {
       "amount": 10000
    	}
    }
    ```