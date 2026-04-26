export type Profile = {
  id: string;
  email: string;
  created_at: string;
};

export type Property = {
  id: string;
  user_id: string;
  name: string;
  address: string;
  created_at: string;
};

export type Tenant = {
  id: string;
  user_id: string;
  full_name: string;
  contact_info: string;
  created_at: string;
};

export type ContractStatus = 'active' | 'ended';

export type Contract = {
  id: string;
  user_id: string;
  property_id: string;
  tenant_id: string;
  status: ContractStatus;
  start_date: string;
  end_date: string | null;
  created_at: string;
};

export type ContractFile = {
  id: string;
  contract_id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  uploaded_at: string;
};

export type ContractWithRelations = Contract & {
  property: Pick<Property, 'id' | 'name' | 'address'> | null;
  tenant: Pick<Tenant, 'id' | 'full_name'> | null;
};

export type NewProperty = Pick<Property, 'name' | 'address'>;
export type NewTenant = Pick<Tenant, 'full_name' | 'contact_info'>;
export type NewContract = Pick<
  Contract,
  'property_id' | 'tenant_id' | 'status' | 'start_date' | 'end_date'
>;
