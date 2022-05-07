import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AccessLogMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, baseUrl: url } = request;
    const userAgent = request.get('user-agent') || '';

    if (userAgent === 'ELB-HealthChecker/2.0') return next();

    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      this.logger.log(
        `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
