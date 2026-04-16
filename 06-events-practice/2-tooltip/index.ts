export default class Tooltip {
  private static instance: Tooltip | null = null;
  public element: HTMLElement | null = null;
  private isInitialized = false;
  private readonly selector = "[data-tooltip]";

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    document.addEventListener("pointerover", this.handlePointerOver);
    document.addEventListener("pointerout", this.handlePointerOut);

    this.isInitialized = true;
  }

  public render(text: string): void {
    if (!this.element) {
      const element = document.createElement("div");

      element.className = "tooltip";
      element.style.pointerEvents = "none";
      element.style.left = "0px";
      element.style.top = "0px";

      document.body.append(element);
      this.element = element;
    }

    this.element.textContent = text;
    this.element.style.opacity = "1";
  }

  private show(target: HTMLElement, event: PointerEvent): void {
    const text = target.dataset.tooltip;
    if (!text) {
      return;
    }

    this.render(text);
    this.updatePosition(event);
  }

  private hide(): void {
    if (!this.element) {
      return;
    }
    this.element.remove();
    this.element = null;
  }

  private updatePosition(event: PointerEvent): void {
    if (!this.element) {
      return;
    }

    const x = event.clientX + 10;
    const y = event.clientY + 10;

    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  private getTarget(node: EventTarget | null): HTMLElement | null {
    if (!(node instanceof Element)) {
      return null;
    }

    const target = node.closest(this.selector);
    return target instanceof HTMLElement ? target : null;
  }

  private handlePointerOver = (event: PointerEvent): void => {
    const target = this.getTarget(event.target);
    if (!target) {
      return;
    }

    this.show(target, event);
  };

  private handlePointerOut = (event: PointerEvent): void => {
    const fromTarget = this.getTarget(event.target);
    const toTarget = this.getTarget(event.relatedTarget);

    if (!fromTarget) {
      return;
    }

    if (fromTarget === toTarget) {
      return;
    }

    if (toTarget) {
      this.show(toTarget, event);
      return;
    }

    this.hide();
  };

  public destroy(): void {
    document.removeEventListener("pointerover", this.handlePointerOver);
    document.removeEventListener("pointerout", this.handlePointerOut);

    this.element?.remove();
    this.element = null;

    this.isInitialized = false;
    Tooltip.instance = null;
  }
}
