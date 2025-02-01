import type { InferResponseType } from 'hono';
import type { api } from './api';

class Common {
  public session: InferResponseType<(typeof api)['auth']['session']['$get']> = $state(null);

  public setSession(session: InferResponseType<(typeof api)['auth']['session']['$get']>) {
    this.session = session;
  }
}

export const c = new Common();
