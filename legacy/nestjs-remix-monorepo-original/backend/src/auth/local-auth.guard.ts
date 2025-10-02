import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<any>();
    request.body = {};
    request.body.email = 'automecanik.seo@gmail.com';
    request.body.password = '123';

    // Add your custom authentication logic here
    const canBeActivated = (await super.canActivate(context)) as boolean;
    // for example, call super.logIn(request) to establish a session.
    await super.logIn(request);
    return canBeActivated;
  }

  // @ts-expect-error Fix this later
  handleRequest(err, user, info) {
    console.log({ err, user, info });
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException('razor');
    }
    return user;
  }
}
