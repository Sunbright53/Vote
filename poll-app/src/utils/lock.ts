// src/utils/lock.ts
export const votedKey = (batch: string) => `mh-voted:${batch || 'default'}`;
