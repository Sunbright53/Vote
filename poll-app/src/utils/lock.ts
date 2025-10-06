export const votedKey = (batch: string) => `mh_voted_${batch}`;
const BATCH_KEY = 'mh_current_batch';

export const rememberBatch = (b: string) =>
  localStorage.setItem(BATCH_KEY, b || 'default');

export const currentBatch = () =>
  localStorage.getItem(BATCH_KEY) || 'default';

export const isVoted = (batch?: string) =>
  !!localStorage.getItem(votedKey(batch ?? currentBatch()));

export const markVoted = (batch?: string) => {
  const b = batch ?? currentBatch();
  rememberBatch(b);
  localStorage.setItem(votedKey(b), new Date().toISOString());
};

export const clearVoted = (batch?: string) =>
  localStorage.removeItem(votedKey(batch ?? currentBatch()));
