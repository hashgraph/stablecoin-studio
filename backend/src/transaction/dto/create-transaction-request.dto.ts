import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsInt,
  Min,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class CreateTransactionRequestDto {
  @ApiProperty({
    description: 'The message to be signed by the keys',
    example:
      '0a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001803188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001807188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001803188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001809188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001804188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda038801001200',
    minLength: 10,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  transaction_message: string;

  @ApiProperty({
    description: 'A description of the transaction',
    example: 'This transaction is for the creation of a new StableCoin',
    minLength: 5,
    maxLength: 200,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The Hedera Account ID used for this transaction',
    example: '0.0.12345',
    required: true,
  })
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, {
    message:
      'Hedera Account ID must be in the format shard.realm.account with each part being a number',
  })
  hedera_account_id: string;

  @ApiProperty({
    description: 'A list of public keys to be used for signing the transaction',
    example: [
      '0x75ec8c1997089874ce881690e95900f821a7f69152814728be971e67e4bc2224',
      '0x4617e0079f0e943fc407e77ca9fc366f47ccdb4cbec6d5d51eeb996e781c052d',
      '0xa0d7a883021253dc9f260ca7934b352f2d75e96d23ebdd1b3851ec0f0f0729d1',
    ],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^0x[0-9a-fA-F]+$/, {
    each: true,
    message: 'Each key must be ED25519 or ECDSA',
  })
  key_list: string[];

  @ApiProperty({
    description: 'The number of keys required to sign the transaction',
    example: 1,
    default: 0, // KeyList with no threshold
    required: true,
  })
  @IsInt()
  @Min(0)
  threshold: number;

  constructor(
    transaction_message: string,
    description: string,
    hedera_account_id: string,
    key_list: string[],
    threshold: number,
  ) {
    this.transaction_message = transaction_message;
    this.description = description;
    this.hedera_account_id = hedera_account_id;
    this.key_list = key_list;
    this.threshold = threshold;
  }
}
