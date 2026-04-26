import { supabase } from '@/lib/supabase';
import {
  Contract,
  ContractWithRelations,
  NewContract,
} from '@/types/database';

const TABLE = 'contracts';
const COLUMNS_BASIC =
  'id, user_id, property_id, tenant_id, status, start_date, end_date, created_at';
const COLUMNS_WITH_RELATIONS = `${COLUMNS_BASIC}, property:properties(id, name, address), tenant:tenants(id, full_name)`;

export const contractsService = {
  async list(): Promise<ContractWithRelations[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(COLUMNS_WITH_RELATIONS)
      .order('created_at', { ascending: false });
    if (error) throw new Error('Neizdevās ielādēt līgumus.');
    return (data as unknown as ContractWithRelations[]) ?? [];
  },

  async getById(id: string): Promise<ContractWithRelations | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(COLUMNS_WITH_RELATIONS)
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error('Neizdevās ielādēt līgumu.');
    return (data as unknown as ContractWithRelations) ?? null;
  },

  async create(input: NewContract, userId: string): Promise<Contract> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        property_id: input.property_id,
        tenant_id: input.tenant_id,
        status: input.status,
        start_date: input.start_date,
        end_date: input.end_date,
        user_id: userId,
      })
      .select(COLUMNS_BASIC)
      .single();
    if (error) throw new Error('Neizdevās izveidot līgumu.');
    return data;
  },

  async update(id: string, input: NewContract): Promise<Contract> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        property_id: input.property_id,
        tenant_id: input.tenant_id,
        status: input.status,
        start_date: input.start_date,
        end_date: input.end_date,
      })
      .eq('id', id)
      .select(COLUMNS_BASIC)
      .single();
    if (error) throw new Error('Neizdevās atjaunināt līgumu.');
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw new Error('Neizdevās dzēst līgumu.');
  },
};
