import * as SecureStore from 'expo-secure-store';

const CHUNK_PREFIX = '__chunked__:';
const CHUNK_SIZE = 1800;

function chunkKey(key: string, index: number) {
  return `${key}__${index}`;
}

async function readChunkCount(key: string): Promise<number | null> {
  const raw = await SecureStore.getItemAsync(key);
  if (raw === null) return null;
  if (!raw.startsWith(CHUNK_PREFIX)) return 0;
  const parsed = parseInt(raw.slice(CHUNK_PREFIX.length), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function clearChunks(key: string) {
  const count = await readChunkCount(key);
  if (count && count > 0) {
    for (let i = 0; i < count; i++) {
      await SecureStore.deleteItemAsync(chunkKey(key, i));
    }
  }
}

async function getItem(key: string): Promise<string | null> {
  const raw = await SecureStore.getItemAsync(key);
  if (raw === null) return null;
  if (!raw.startsWith(CHUNK_PREFIX)) return raw;

  const totalChunks = parseInt(raw.slice(CHUNK_PREFIX.length), 10);
  if (!Number.isFinite(totalChunks) || totalChunks <= 0) return null;

  let result = '';
  for (let i = 0; i < totalChunks; i++) {
    const chunk = await SecureStore.getItemAsync(chunkKey(key, i));
    if (chunk === null) return null;
    result += chunk;
  }
  return result;
}

async function setItem(key: string, value: string): Promise<void> {
  await clearChunks(key);

  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) {
    chunks.push(value.slice(i, i + CHUNK_SIZE));
  }

  for (let i = 0; i < chunks.length; i++) {
    await SecureStore.setItemAsync(chunkKey(key, i), chunks[i]);
  }
  await SecureStore.setItemAsync(key, `${CHUNK_PREFIX}${chunks.length}`);
}

async function removeItem(key: string): Promise<void> {
  await clearChunks(key);
  await SecureStore.deleteItemAsync(key);
}

export const secureStoreAdapter = {
  getItem,
  setItem,
  removeItem,
};
