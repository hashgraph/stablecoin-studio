export default class LogMessageDTO {
  requestId: string;
  description: string;
  detail: any;

  constructor(requestId: string, description: string, detail: any) {
    this.requestId = requestId;
    this.description = description;
    this.detail = detail;
  }
}
