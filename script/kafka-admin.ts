// import { Kafka, Partitioners } from 'kafkajs';

// (async () => {
//   // 1. Kafka 인스턴스 생성
//   const kafka = new Kafka({
//     clientId: 'my-app',
//     brokers: ['localhost:9094'],
//   });

//   // 2. Admin 클라이언트 연결 및 토픽 생성
//   const admin = kafka.admin();
//   await admin.connect();
//   await admin.createTopics({
//     topics: [
//       {
//         topic: 'test-topic',
//         numPartitions: 1,
//         replicationFactor: 1,
//         configEntries: [{ name: 'cleanup.policy', value: 'delete' }],
//       },
//     ],
//     timeout: 5000,
//   });

//   await admin.disconnect(); // 토픽 생성 후 연결 해제

//   // 3. Producer/Consumer 설정 및 연결
//   const producer = kafka.producer({
//     createPartitioner: Partitioners.DefaultPartitioner,
//   });
//   const consumer = kafka.consumer({ groupId: 'test-group' });
//   await producer.connect();
//   await consumer.connect();
// })();
