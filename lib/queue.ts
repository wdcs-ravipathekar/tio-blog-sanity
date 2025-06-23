// lib/queue.ts
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
    username: 'default',
    password: 'AemuQzk2F4gkVyZTvZKBbMgsQvaAJDOR',
    host: 'redis-19125.c81.us-east-1-2.ec2.redns.redis-cloud.com',
    port: 19125
});
console.log("\nlogger-------> ~ queue.ts:9 ~ connection:", connection);

export const postQueue = new Queue('postQueue', { connection });
