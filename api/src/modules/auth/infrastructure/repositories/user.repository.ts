import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../database/user.orm-entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
  ) {}

  private toDomain(orm: UserOrmEntity): User {
    return new User(
      orm.id,
      orm.name,
      orm.email,
      orm.passwordHash,
      orm.tenantId,
      orm.createdAt,
      orm.updatedAt,
      orm.role,
    );
  }

  private toOrm(domain: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.email = domain.email;
    orm.passwordHash = domain.passwordHash;
    orm.tenantId = domain.tenantId;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    orm.role = domain.role;
    return orm;
  }

  async create(user: User): Promise<User> {
    const orm = this.toOrm(user);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.ormRepository.findOneBy({ email });
    return orm ? this.toDomain(orm) : null;
  }

  async findById(id: string): Promise<User | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  async findByTenantId(tenantId: string): Promise<User[]> {
    const orms = await this.ormRepository.findBy({ tenantId });
    return orms.map(orm => this.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
