// import { Kafka, Partitioners } from 'kafkajs';

// // Kafka 클라이언트 설정
// const kafka = new Kafka({
//   clientId: 'my-app',
//   brokers: ['localhost:9094'],
// });

// // 프로듀서 생성
// const producer = kafka.producer({
//   createPartitioner: Partitioners.DefaultPartitioner,
// });

// // 메시지 전송 함수
// async function sendMessage() {
//   try {
//     // 프로듀서 연결
//     await producer.connect();

//     // 메시지 전송
//     await producer.send({
//       topic: 'test-topic',
//       messages: [
//         {
//           key: 'key1',
//           value: JSON.stringify({ message: 'Hello Kafka!' }),
//         },
//       ],
//     });

//     console.log('Message sent successfully');
//   } catch (error) {
//     console.error('Error producing message:', error);
//   } finally {
//     // 프로듀서 연결 종료
//     await producer.disconnect();
//   }
// }

// sendMessage();
