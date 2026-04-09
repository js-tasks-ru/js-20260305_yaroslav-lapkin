type SortOrder = "asc" | "desc";
type SortableTableData = Record<string, string | number>;

type SortableTableSort = {
  id: string;
  order: SortOrder;
};

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: "string" | "number" | "custom";
  template?: (value: string | number) => string;
  customSorting?: (a: SortableTableData, b: SortableTableData) => number;
}

interface Options {
  data?: SortableTableData[];
  sorted?: SortableTableSort;
  isSortLocally?: boolean;
}

type SubElements = {
  [key: string]: HTMLElement;
};

export default class SortableTable {
  private headersConfig: SortableTableHeader[];
  private data: SortableTableData[];
  private isSortLocally: boolean;
  private sorted: SortableTableSort | null = null;

  public element: HTMLElement | null = null;
  public subElements: SubElements = {};

  constructor(
    headersConfig: SortableTableHeader[] = [],
    { data = [], sorted, isSortLocally = true }: Options = {},
  ) {
    this.headersConfig = [...headersConfig];
    this.data = [...data];
    this.isSortLocally = isSortLocally;
    this.sorted = sorted ?? null;

    this.initSortedData();

    this.render();

    if (this.sorted) {
      this.updateHeader(this.sorted.id, this.sorted.order);
    }
  }

  private initSortedData(): void {
    const sorted = this.sorted;
    if (!sorted || !this.isSortLocally) {
      return;
    }

    const column = this.headersConfig.find((col) => col.id === sorted.id);

    if (column?.sortable) {
      this.data = this.getSortedData(sorted.id, sorted.order, column);
    }
  }

  public render(): void {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTableTemplate();

    this.element = wrapper.firstElementChild as HTMLElement;
    this.subElements = this.getComponents(this.element);

    const arrowWrapper = document.createElement("div");
    arrowWrapper.innerHTML = this.getSortArrowHTML();
    this.subElements.arrow = arrowWrapper.firstElementChild as HTMLElement;

    this.initEventListeners();
  }

  private getTableTemplate(): string {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getTableHeaderHTML()}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.generateRowsHtml(this.data)}
        </div>
      </div>
    `;
  }

  private getTableHeaderHTML(): string {
    return this.headersConfig
      .map(
        (col) => `
      <div class="sortable-table__cell" data-id="${col.id}" data-sortable="${col.sortable ? "true" : "false"}">
        <span>${col.title}</span>
      </div>
    `,
      )
      .join("");
  }

  private getSortArrowHTML(): string {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  private generateRowsHtml(data: SortableTableData[]): string {
    return data
      .map(
        (item) => `
      <div class="sortable-table__row">
        ${this.headersConfig.map((col) => this.generateCellHtml(item, col)).join("")}
      </div>
      `,
      )
      .join("");
  }

  private generateCellHtml(
    item: SortableTableData,
    col: SortableTableHeader,
  ): string {
    const value = item[col.id];
    const content = col.template ? col.template(value) : String(value ?? "");
    return `<div class="sortable-table__cell">${content}</div>`;
  }

  private getComponents(element: HTMLElement): SubElements {
    const result: SubElements = {};
    const elements = element.querySelectorAll("[data-element]");

    elements.forEach((subElement) => {
      const name = (subElement as HTMLElement).dataset.element;
      if (name) {
        result[name] = subElement as HTMLElement;
      }
    });

    return result;
  }

  public sort(field: string, order: SortOrder = "asc"): void {
    const column = this.headersConfig.find((col) => col.id === field);
    if (!column?.sortable) {
      return;
    }

    this.sorted = { id: field, order };

    if (this.isSortLocally) {
      this.data = this.getSortedData(field, order, column);
      this.subElements.body.innerHTML = this.generateRowsHtml(this.data);
    } else {
      this.sortOnServer();
    }

    this.updateHeader(field, order);
  }

  private sortOnServer(): void {
    return;
  }

  private updateHeader(field: string, order: SortOrder): void {
    const allColumns = this.subElements.header.querySelectorAll("[data-id]");
    const currentColumn = this.subElements.header.querySelector(
      `[data-id="${field}"]`,
    );

    allColumns.forEach((column) => {
      column.removeAttribute("data-order");
    });

    if (currentColumn) {
      currentColumn.setAttribute("data-order", order);

      currentColumn.append(this.subElements.arrow);
    }
  }

  private getSortedData(
    field: string,
    order: SortOrder,
    column: SortableTableHeader,
  ): SortableTableData[] {
    const direction = order === "asc" ? 1 : -1;
    const sortType = column.sortType ?? "string";

    return [...this.data].sort((a, b) => {
      if (sortType === "custom" && column.customSorting) {
        return direction * column.customSorting(a, b);
      }

      if (sortType === "number") {
        return direction * (Number(a[field]) - Number(b[field]));
      }

      return (
        direction *
        String(a[field]).localeCompare(String(b[field]), ["ru", "en"], {
          caseFirst: "upper",
        })
      );
    });
  }

  private onHeaderClick = (event: Event): void => {
    const cell = (event.target as HTMLElement).closest(
      ".sortable-table__cell",
    ) as HTMLElement | null;
    if (!cell) {
      return;
    }

    const isSortable = cell.dataset.sortable === "true";
    const field = cell.dataset.id;

    if (isSortable && field) {
      const order = cell.dataset.order === "desc" ? "asc" : "desc";
      this.sort(field, order);
    }
  };

  private initEventListeners(): void {
    this.subElements.header.addEventListener("pointerdown", this.onHeaderClick);
  }

  public remove(): void {
    this.element?.remove();
  }

  public destroy(): void {
    if (this.subElements.header) {
      this.subElements.header.removeEventListener(
        "pointerdown",
        this.onHeaderClick,
      );
    }
    this.remove();
    this.element = null;
    this.subElements = {};
    this.headersConfig = [];
    this.data = [];
    this.sorted = null;
  }
}
