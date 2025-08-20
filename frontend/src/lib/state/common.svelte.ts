import type { Api } from '../api';

class Common {
  public session: Api['auth']['session']['get'] | null = $state(null);

  public setSession(session: Api['auth']['session']['get'] | null) {
    this.session = session;
  }
}

export const c = new Common();
