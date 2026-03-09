/**
 * Express Request type extensions
 * @module types/express
 */
declare global {
  namespace Express {
    interface Request {
      /** Authenticated user object */
      user?: {
        /** User's unique identifier */
        id: string;
        /** User's username */
        username?: string;
        /** User's email address */
        email: string;
        /** User's role (jobseeker, employer, admin) */
        role: string;
        /** User's account status */
        status?: string;
        /** Additional properties */
        [key: string]: any;
      };
      /** JWT token from authorization header */
      token?: string;
    }
  }
}

export {};
