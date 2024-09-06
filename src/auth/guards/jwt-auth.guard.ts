import { Injectable, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }

      throw err || new UnauthorizedException('Unauthorized access');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive or suspended');
    }

    return user;
  }

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (roles && roles.length > 0 && !roles.includes(user.role)) {
      throw new ForbiddenException('You do not have the necessary permissions');
    }

    return super.canActivate(context);
  }
}
