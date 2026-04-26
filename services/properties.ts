import { supabase } from '@/lib/supabase';
import { NewProperty, Property } from '@/types/database';

const TABLE = 'properties';
const COLUMNS = 'id, user_id, name, address, created_at';

export const propertiesService = {
  async list(): Promise<Property[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(COLUMNS)
      .order('created_at', { ascending: false });
    if (error) throw new Error('Neizdevās ielādēt īpašumus.');
    return data ?? [];
  },

  async getById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(COLUMNS)
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error('Neizdevās ielādēt īpašumu.');
    return data;
  },

  async create(input: NewProperty, userId: string): Promise<Property> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        name: input.name,
        address: input.address,
        user_id: userId,
      })
      .select(COLUMNS)
      .single();
    if (error) throw new Error('Neizdevās izveidot īpašumu.');
    return data;
  },

  async update(id: string, input: NewProperty): Promise<Property> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ name: input.name, address: input.address })
      .eq('id', id)
      .select(COLUMNS)
      .single();
    if (error) throw new Error('Neizdevās atjaunināt īpašumu.');
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw new Error('Neizdevās dzēst īpašumu.');
  },
};
