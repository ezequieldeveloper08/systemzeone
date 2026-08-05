import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post('onboarding')
  async createOnboarding(@Req() req: any, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.createOnboardingWorkspace(req.user.id, dto);
  }

  @Get()
  async getWorkspaces(@Req() req: any) {
    return this.workspacesService.getUserWorkspaces(req.user.id);
  }
}
