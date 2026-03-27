type SortOrder = "asc" | "desc";

type SortableTableData = Record<string, string | number>;

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: "string" | "number";
  template?: (value: string | number) => string;
}

export default class SortableTable {
  private headersConfig: SortableTableHeader[];
  private data: SortableTableData[];
  public element: HTMLElement | null = null;
  private header: HTMLElement | null = null;
  private body: HTMLElement | null = null;

  constructor(
    headersConfig: SortableTableHeader[] = [],
    data: SortableTableData[] = [],
  ) {
    this.headersConfig = [...headersConfig];
    this.data = [...data];
    this.render();
  }

  public render(): void {
    this.element = document.createElement("div");
    this.element.className = "sortable-table";

    const header = this.getTableHeader();
    const body = this.getTableBody();

    this.element.append(header, body);
    this.header = header;
    this.body = body;
  }

  private getTableHeader(): HTMLElement {
    const header = document.createElement("div");
    header.className = "sortable-table__header sortable-table__row";
    header.setAttribute("data-element", "header");

    for (const col of this.headersConfig) {
      const cell = document.createElement("div");
      cell.className = "sortable-table__cell";
      cell.setAttribute("data-id", col.id);
      cell.setAttribute("data-sortable", col.sortable ? "true" : "false");
      if (col.sortable) {
        cell.innerHTML = `
          <span>${col.title}</span>
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
        `;
      } else {
        cell.innerHTML = `<span>${col.title}</span>`;
      }

      header.appendChild(cell);
    }

    return header;
  }

  private getTableBody(): HTMLElement {
    const body = document.createElement("div");
    body.className = "sortable-table__body";
    body.setAttribute("data-element", "body");

    for (const item of this.data) {
      const row = document.createElement("div");
      row.className = "sortable-table__row";

      for (const col of this.headersConfig) {
        const value = item[col.id];
        row.appendChild(this.getTableCell(col, value));
      }

      body.appendChild(row);
    }

    return body;
  }

  private getTableCell(
    col: SortableTableHeader,
    value: string | number,
  ): HTMLElement {
    const cell = document.createElement("div");
    cell.className = "sortable-table__cell";
    if (col.template) {
      cell.innerHTML = col.template(value);
    } else {
      cell.textContent = String(value);
    }

    return cell;
  }

  public sort(field: string, order: SortOrder = "asc"): void {
    const column = this.headersConfig.find((col) => col.id === field);
    if (!column?.sortable) {
      return;
    }

    const direction = order === "asc" ? 1 : -1;
    const sortType = column.sortType ?? "string";

    this.data = [...this.data].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      if (sortType === "number") {
        return direction * (Number(aValue) - Number(bValue));
      }

      return (
        direction *
        String(aValue).localeCompare(String(bValue), ["ru", "en"], {
          caseFirst: "upper",
        })
      );
    });

    this.updateBody();
    this.updateHeader(field, order);
  }

  private updateBody(): void {
    if (!this.body) {
      return;
    }

    const newBody = this.getTableBody();
    this.body.replaceWith(newBody);
    this.body = newBody;
  }

  private updateHeader(field: string, order: SortOrder): void {
    if (!this.header) {
      return;
    }

    const headerCells = this.header.querySelectorAll(".sortable-table__cell");

    headerCells.forEach((cell) => {
      if (cell.getAttribute("data-id") === field) {
        cell.setAttribute("data-order", order);
      } else {
        cell.removeAttribute("data-order");
      }
    });
  }

  public remove(): void {
    this.element?.remove();
  }

  public destroy(): void {
    this.remove();
    this.element = null;
    this.header = null;
    this.body = null;
    this.headersConfig = [];
    this.data = [];
  }
}
