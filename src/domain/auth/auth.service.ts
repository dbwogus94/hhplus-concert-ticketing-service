import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserInfo } from 'src/common';

type JwtPayload = Pick<UserInfo, 'userId' | 'queueUid'>;

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(private readonly jwtService: JwtService) {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET 없음');
    this.jwtSecret = process.env.JWT_SECRET;
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.verify(token, {
        secret: this.jwtSecret,
      });
    } catch (error) {
      return null;
    }
  }

  issueToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: '5h',
    });
  }
}
