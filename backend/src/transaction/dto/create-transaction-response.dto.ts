export class CreateTransactionResponseDto {
  transactionId: string;

  constructor(transactionId: string) {
    this.transactionId = transactionId;
  }
}
