import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class RemoveHexPrefixPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (value.toLowerCase().startsWith('0x')) {
      return value.substring(2);
    }
    return value;
  }
}
