// import { Kafka } from 'kafkajs';

// // Kafka 클라이언트 설정
// const kafka = new Kafka({
//   clientId: 'my-app',
//   brokers: ['localhost:9094'],
// });

// // 컨슈머 생성
// const consumer = kafka.consumer({ groupId: 'test-group' });

// // 메시지 수신 함수
// async function consumeMessages() {
//   try {
//     // 컨슈머 연결
//     await consumer.connect();

//     // 토픽 구독
//     await consumer.subscribe({
//       topic: 'test-topic',
//       fromBeginning: true,
//     });

//     // 메시지 처리
//     await consumer.run({
//       eachMessage: async ({ topic, partition, message }) => {
//         console.log({
//           topic,
//           partition,
//           offset: message.offset,
//           value: message.value?.toString(),
//         });

//         // await consumer.commitOffsets([
//         //   {
//         //     topic,
//         //     partition,
//         //     offset: (Number(message.offset) + 1).toString(),
//         //   },
//         // ]);
//         // throw new Error('에러');
//       },
//     });
//   } catch (error) {
//     console.error('Error consuming message:', error);
//   }
// }

// consumeMessages();

// // 종료 시그널 처리
// process.on('SIGTERM', async () => {
//   await consumer.disconnect();
//   process.exit(0);
// });
