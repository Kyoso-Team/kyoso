class FadeUi {
  public faded: boolean = $state(false);

  public set(state: boolean) {
    this.faded = state;
  }
}

export const fadeUi = new FadeUi();