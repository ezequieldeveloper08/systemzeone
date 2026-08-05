export class CreateWorkspaceDto {
  name!: string;
  slug?: string;
  marketplaces?: string[];
  socialNetworks?: string[];
  categories?: string[];
  workStructure?: string;
}
