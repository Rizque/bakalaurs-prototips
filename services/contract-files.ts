import { supabase } from '@/lib/supabase';
import { ContractFile } from '@/types/database';
import * as FileSystem from 'expo-file-system/legacy';

const BUCKET = 'contract-files';
const TABLE = 'contract_files';
const COLUMNS =
  'id, contract_id, user_id, file_name, storage_path, uploaded_at';

function decodeBase64(base64: string): Uint8Array {
  const binary = global.atob
    ? global.atob(base64)
    : Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const contractFilesService = {
  async getByContract(contractId: string): Promise<ContractFile | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(COLUMNS)
      .eq('contract_id', contractId)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error('Neizdevās ielādēt līguma failu.');
    return data;
  },

  async upload(params: {
    contractId: string;
    userId: string;
    localUri: string;
    fileName: string;
  }): Promise<ContractFile> {
    const { contractId, userId, localUri, fileName } = params;
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${userId}/${contractId}/${safeName}`;

    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const bytes = decodeBase64(base64);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, bytes, {
        contentType: 'application/pdf',
        upsert: true,
      });
    if (uploadError) throw new Error('Faila augšupielāde neizdevās.');

    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        contract_id: contractId,
        user_id: userId,
        file_name: safeName,
        storage_path: storagePath,
      })
      .select(COLUMNS)
      .single();
    if (error) throw new Error('Faila ieraksta saglabāšana neizdevās.');
    return data;
  },

  async createSignedUrl(file: ContractFile, expiresInSec = 60): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(file.storage_path, expiresInSec);
    if (error || !data?.signedUrl) {
      throw new Error('Neizdevās izveidot piekļuves saiti.');
    }
    return data.signedUrl;
  },

  async remove(file: ContractFile): Promise<void> {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([file.storage_path]);
    if (storageError) throw new Error('Faila dzēšana neizdevās.');

    const { error } = await supabase.from(TABLE).delete().eq('id', file.id);
    if (error) throw new Error('Faila ieraksta dzēšana neizdevās.');
  },
};
