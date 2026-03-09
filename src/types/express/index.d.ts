declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username?: string;
        email: string;
        role: string;
        status?: string;
        [key: string]: any;
      };
      token?: string;
    }
  }
}

export {};
