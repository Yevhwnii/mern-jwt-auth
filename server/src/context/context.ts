import { Response, Request } from 'express';

export interface Context {
  req: Request;
  res: Response;
  payload?: { userId: string };
}
