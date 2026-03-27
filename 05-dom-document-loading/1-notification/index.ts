import { createElement } from "../../shared/utils/create-element";

interface Options {
  duration?: number;
  type?: "success" | "error";
}

export default class NotificationMessage {
  static activeNotification?: NotificationMessage;
  public element: HTMLElement;
  private timerId?: number;
  private message: string;
  private duration: number;
  private type: "success" | "error";

  constructor(
    message = "",
    { duration = 2000, type = "success" }: Options = {},
  ) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.destroy();
    }
    this.element = createElement(this.getTemplate());
    NotificationMessage.activeNotification = this;
  }

  private getTemplate(): string {
    return `
      <div class="notification ${this.type}" style="--value: ${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">${this.message}</div>
        </div>
      </div>
    `;
  }

  public show(target: HTMLElement = document.body): void {
    target.append(this.element);
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.timerId = setTimeout(() => {
      this.destroy();
    }, this.duration);
  }

  public remove(): void {
    this.element.remove();
    if (NotificationMessage.activeNotification === this) {
      NotificationMessage.activeNotification = undefined;
    }
  }

  public destroy(): void {
    if (this.timerId !== undefined) {
      clearTimeout(this.timerId);
      this.timerId = undefined;
    }
    this.remove();
  }
}
