import { JwtPayload } from './types/jwt-payload.type';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
