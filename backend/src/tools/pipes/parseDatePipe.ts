import { BadRequestException, PipeTransform } from '@nestjs/common';
import { messages } from 'src/config';

export class ParseDatePipe implements PipeTransform {
  transform(value: string): Date {
    try {
      const dateParsed = new Date(Date.parse(value));
      const isDatesTheSame = dateParsed.toISOString() === value;
      if (isDatesTheSame) return dateParsed;
      throw new Error();
    } catch (error) {
      throw new BadRequestException(messages.types.shouldBeDate);
    }
  }
}
