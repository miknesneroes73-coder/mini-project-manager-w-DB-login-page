import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class LimitPipe implements PipeTransform<number | undefined, number> {
  transform(value: number | undefined): number {
    const limit = value ?? 10;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new BadRequestException('limit must be an integer between 1 and 50');
    }
    return limit;
  }
}

@Injectable()
export class SkipPipe implements PipeTransform<number | undefined, number> {
  transform(value: number | undefined): number {
    const skip = value ?? 0;
    if (!Number.isInteger(skip) || skip < 0) {
      throw new BadRequestException('skip must be an integer greater than or equal to 0');
    }
    return skip;
  }
}
