import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async resolveIssues(): Promise<number> {
    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ issues: false })
      .where('issues = :issues', { issues: true })
      .returning(['id'])
      .execute();

    return result.raw.length;
  }
}
