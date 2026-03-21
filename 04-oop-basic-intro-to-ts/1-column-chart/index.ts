import { createElement } from "../../shared/utils/create-element";

interface Options {
  data?: number[];
  label?: string;
  value?: number;
  link?: string;
  formatHeading?: (value: number) => string;
}

type SubElements = {
  header?: HTMLElement;
  body?: HTMLElement;
};

export default class ColumnChart {
  private data: number[];
  private value: number;
  private readonly label: string;
  private readonly link?: string;
  private readonly formatHeading: (value: number) => string;
  public readonly chartHeight = 50;
  public element: HTMLElement | null = null;
  private subElements: SubElements = {};

  constructor({
    data = [],
    label = "",
    value = 0,
    link,
    formatHeading = (value) => String(value),
  }: Options = {}) {
    this.data = [...data];
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
  }

  private getTemplate(): string {
    return `
      <div class="column-chart ${this.data.length ? "" : "column-chart_loading"}" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ""}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.formatHeading(this.value)}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getChartColumns()}
          </div>
        </div>
      </div>
      `.trim();
  }

  private getChartColumns(): string {
    if (!this.data.length) {
      return "";
    }
    const maxValue = Math.max(0, ...this.data);
    if (maxValue === 0) {
      return this.data
        .map(() => `<div style="--value: 0" data-tooltip="0%"></div>`)
        .join("");
    }
    const scale = this.chartHeight / maxValue;
    return this.data
      .map((item) => {
        const value = Math.floor(item * scale);
        const percent = Math.round((item / maxValue) * 100);
        return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
      })
      .join("");
  }

  private getSubElements(element: HTMLElement): SubElements {
    const elements: SubElements = {};
    for (const subElement of element.querySelectorAll("[data-element]")) {
      const name = (subElement as HTMLElement).dataset
        .element as keyof SubElements;
      elements[name] = subElement as HTMLElement;
    }
    return elements;
  }

  public render(): void {
    this.element = createElement(this.getTemplate());
    this.subElements = this.getSubElements(this.element);
  }

  public update(data: number[], value = this.value): void {
    this.data = [...data];
    this.value = value;
    if (this.subElements.body) {
      this.subElements.body.innerHTML = this.getChartColumns();
    }
    if (this.subElements.header) {
      this.subElements.header.textContent = this.formatHeading(this.value);
    }
    this.element?.classList.toggle("column-chart_loading", !this.data.length);
  }

  public remove(): void {
    this.element?.remove();
  }

  public destroy(): void {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
