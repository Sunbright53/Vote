// src/utils/lock.ts
export const votedKey = (batch) => `mh-voted:${batch || 'default'}`;
