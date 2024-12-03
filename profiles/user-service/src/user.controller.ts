import { Controller, Patch } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('resolve-issues')
  async resolveIssues() {
    const updatedCount = await this.userService.resolveIssues();
    return { message: 'Issues resolved', updatedCount };
  }
}
