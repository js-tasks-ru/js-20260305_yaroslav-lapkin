type DoubleSliderSelected = {
  from: number;
  to: number;
};

interface Options {
  min?: number;
  max?: number;
  formatValue?: (value: number) => string;
  selected?: DoubleSliderSelected;
}

export default class DoubleSlider {
  public element: HTMLElement;
  public min: number;
  public max: number;

  private formatValue: (value: number) => string;
  private from: number;
  private to: number;

  private inner!: HTMLElement;
  private progress!: HTMLElement;
  private thumbLeft!: HTMLElement;
  private thumbRight!: HTMLElement;
  private fromLabel!: HTMLElement;
  private toLabel!: HTMLElement;

  private dragging: "left" | "right" | null = null;

  constructor(options: Options = {}) {
    const {
      min = 0,
      max = 100,
      formatValue = (value) => String(value.toFixed(1)),
      selected,
    } = options;

    this.min = Math.min(min, max);
    this.max = Math.max(min, max);
    this.formatValue = formatValue;

    const from = selected?.from ?? this.min;
    const to = selected?.to ?? this.max;

    this.from = this.clamp(Math.min(from, to), this.min, this.max);
    this.to = this.clamp(Math.max(from, to), this.min, this.max);

    this.element = this.createElement();
    this.updateView();
    this.addEventListeners();
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private get isDisabled(): boolean {
    return this.min === this.max;
  }

  private valueToPercent(value: number): number {
    if (this.max === this.min) return 0;
    return ((value - this.min) / (this.max - this.min)) * 100;
  }

  private percentToValue(percent: number): number {
    return this.min + (percent / 100) * (this.max - this.min);
  }

  private getPointerPercent(e: PointerEvent): number {
    const rect = this.inner.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    return this.clamp(percent, 0, 100);
  }

  private createElement(): HTMLElement {
    const template = `
      <div class="range-slider">
        <span data-element="from"></span>
        <div class="range-slider__inner">
          <span class="range-slider__progress"></span>
          <span class="range-slider__thumb-left"></span>
          <span class="range-slider__thumb-right"></span>
        </div>
        <span data-element="to"></span>
      </div>
    `.trim();

    const wrapper = document.createElement("div");
    wrapper.innerHTML = template;
    const element = wrapper.firstElementChild as HTMLElement;

    this.fromLabel = element.querySelector('[data-element="from"]')!;
    this.toLabel = element.querySelector('[data-element="to"]')!;
    this.inner = element.querySelector(".range-slider__inner")!;
    this.progress = element.querySelector(".range-slider__progress")!;
    this.thumbLeft = element.querySelector(".range-slider__thumb-left")!;
    this.thumbRight = element.querySelector(".range-slider__thumb-right")!;

    return element;
  }

  private updateView(): void {
    this.fromLabel.textContent = this.formatValue(this.from);
    this.toLabel.textContent = this.formatValue(this.to);

    if (this.isDisabled) {
      this.progress.style.left = "0%";
      this.progress.style.right = "0%";
      this.thumbLeft.style.left = "0%";
      this.thumbRight.style.right = "0%";
      return;
    }

    const left = this.valueToPercent(this.from);
    const right = this.valueToPercent(this.to);

    this.thumbLeft.style.left = `${left}%`;
    this.thumbRight.style.right = `${100 - right}%`;
    this.progress.style.left = `${left}%`;
    this.progress.style.right = `${100 - right}%`;
  }

  private addEventListeners(): void {
    this.thumbLeft.addEventListener(
      "pointerdown",
      this.handlePointerDown("left", this.thumbLeft),
    );
    this.thumbRight.addEventListener(
      "pointerdown",
      this.handlePointerDown("right", this.thumbRight),
    );
  }

  private handlePointerDown(side: "left" | "right", thumb: HTMLElement) {
    return (event: PointerEvent): void => {
      event.preventDefault();
      if (event.pointerId !== undefined) {
        thumb.setPointerCapture(event.pointerId);
      }

      this.startDrag(side);
    };
  }

  private handleMove = (event: PointerEvent): void => {
    if (!this.dragging || this.isDisabled) return;

    const percent = this.getPointerPercent(event);
    const value = this.percentToValue(percent);

    if (this.dragging === "left") {
      this.from = Math.min(value, this.to);
    } else {
      this.to = Math.max(value, this.from);
    }

    this.updateView();
  };

  private handleUp = (): void => {
    if (!this.dragging) return;

    this.stopDrag();
    this.dispatchRangeSelect();
  };

  private startDrag(side: "left" | "right"): void {
    this.dragging = side;

    document.addEventListener("pointermove", this.handleMove);
    document.addEventListener("pointerup", this.handleUp);
    document.addEventListener("pointercancel", this.handleUp);
  }

  private stopDrag(): void {
    this.dragging = null;

    document.removeEventListener("pointermove", this.handleMove);
    document.removeEventListener("pointerup", this.handleUp);
    document.removeEventListener("pointercancel", this.handleUp);
  }

  private dispatchRangeSelect(): void {
    this.element.dispatchEvent(
      new CustomEvent("range-select", {
        detail: { from: this.from, to: this.to },
        bubbles: true,
      }),
    );
  }

  public destroy(): void {
    document.removeEventListener("pointermove", this.handleMove);
    document.removeEventListener("pointerup", this.handleUp);
    document.removeEventListener("pointercancel", this.handleUp);

    this.element.remove();
  }
}
