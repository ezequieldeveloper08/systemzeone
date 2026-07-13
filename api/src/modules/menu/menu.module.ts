import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MenuItemOrmEntity } from './infrastructure/database/menu-item.orm-entity';
import { MenuGroupOrmEntity } from './infrastructure/database/menu-group.orm-entity';
import { CategoryItemOrmEntity } from './infrastructure/database/category-item.orm-entity';
import { MenuItemVariationOrmEntity } from './infrastructure/database/item-variation.orm-entity';
import { ChoiceOrmEntity } from './infrastructure/database/choice.orm-entity';
import { ChoiceItemOrmEntity } from './infrastructure/database/choice-item.orm-entity';
import { ChoiceItemVariationOrmEntity } from './infrastructure/database/choice-item-variation.orm-entity';
import { MenuItemRepository } from './infrastructure/repositories/menu-item.repository';
import { IMenuItemRepositoryToken } from './domain/repositories/menu-item.repository.interface';
import { MenuGroupRepository } from './infrastructure/repositories/menu-group.repository';
import { IMenuGroupRepositoryToken } from './domain/repositories/menu-group.repository.interface';
import { ListMenuItemsUseCase } from './application/use-cases/list-menu-items.use-case';
import { CreateMenuItemUseCase } from './application/use-cases/create-menu-item.use-case';
import { GetMenuItemUseCase } from './application/use-cases/get-menu-item.use-case';
import { UpdateMenuItemUseCase } from './application/use-cases/update-menu-item.use-case';
import { DeleteMenuItemUseCase } from './application/use-cases/delete-menu-item.use-case';
import { CreateMenuGroupUseCase } from './application/use-cases/create-menu-group.use-case';
import { ListMenuGroupsUseCase } from './application/use-cases/list-menu-groups.use-case';
import { UpdateMenuGroupUseCase } from './application/use-cases/update-menu-group.use-case';
import { DeleteMenuGroupUseCase } from './application/use-cases/delete-menu-group.use-case';
import { MenuController } from './presentation/controllers/menu.controller';
import { MenuPublicController } from './presentation/controllers/menu-public.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      MenuItemOrmEntity,
      MenuGroupOrmEntity,
      CategoryItemOrmEntity,
      MenuItemVariationOrmEntity,
      ChoiceOrmEntity,
      ChoiceItemOrmEntity,
      ChoiceItemVariationOrmEntity,
    ]),
  ],
  providers: [
    {
      provide: IMenuItemRepositoryToken,
      useClass: MenuItemRepository,
    },
    {
      provide: IMenuGroupRepositoryToken,
      useClass: MenuGroupRepository,
    },
    ListMenuItemsUseCase,
    CreateMenuItemUseCase,
    GetMenuItemUseCase,
    UpdateMenuItemUseCase,
    DeleteMenuItemUseCase,
    CreateMenuGroupUseCase,
    ListMenuGroupsUseCase,
    UpdateMenuGroupUseCase,
    DeleteMenuGroupUseCase,
  ],
  controllers: [MenuController, MenuPublicController],
  exports: [IMenuItemRepositoryToken],
})
export class MenuModule {}
