export class getTransactionsResponseDto {
  id: string;
  transaction_message: string;
  description: string;
  status: string;
  threshold: number;
  key_list: string[];
  signed_keys: string[];

  constructor(
    id: string,
    transaction_message: string,
    description: string,
    status: string,
    threshold: number,
    key_list: string[],
    signed_keys: string[],
  ) {
    this.id = id;
    this.transaction_message = transaction_message;
    this.description = description;
    this.status = status;
    this.threshold = threshold;
    this.key_list = key_list;
    this.signed_keys = signed_keys;
  }
}
