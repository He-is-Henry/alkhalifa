import { UserRole } from '../../user/user.schema';

export interface JwtPayload {
  sub: string; // userId
  role: UserRole;
  name: string;
}
