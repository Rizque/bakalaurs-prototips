import { supabase } from '@/lib/supabase';
import { NewTenant, Tenant } from '@/types/database';

const TABLE = 'tenants';
const COLUMNS = 'id, user_id, full_name, contact_info, created_at';

export const tenantsService = {
  async list(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(COLUMNS)
      .order('created_at', { ascending: false });
    if (error) throw new Error('Neizdevās ielādēt īrniekus.');
    return data ?? [];
  },

  async getById(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(COLUMNS)
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error('Neizdevās ielādēt īrnieku.');
    return data;
  },

  async create(input: NewTenant, userId: string): Promise<Tenant> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        full_name: input.full_name,
        contact_info: input.contact_info,
        user_id: userId,
      })
      .select(COLUMNS)
      .single();
    if (error) throw new Error('Neizdevās izveidot īrnieku.');
    return data;
  },

  async update(id: string, input: NewTenant): Promise<Tenant> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        full_name: input.full_name,
        contact_info: input.contact_info,
      })
      .eq('id', id)
      .select(COLUMNS)
      .single();
    if (error) throw new Error('Neizdevās atjaunināt īrnieku.');
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw new Error('Neizdevās dzēst īrnieku.');
  },
};
