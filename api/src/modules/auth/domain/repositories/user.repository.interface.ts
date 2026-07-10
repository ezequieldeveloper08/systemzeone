import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByTenantId(tenantId: string): Promise<User[]>;
  delete(id: string): Promise<void>;
}

export const IUserRepositoryToken = Symbol('IUserRepository');
