import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParsePagePipe implements PipeTransform {
  transform(value: any): number {
    const page = parseInt(value, 10);
    return isNaN(page) || page < 1 ? 1 : page;
  }
}
