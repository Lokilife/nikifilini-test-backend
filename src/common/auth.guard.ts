import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Говорили что лишь удалили часть бека, но не модифицировали,
    // так что значит тут мне ничего делать не надо).
    const ctx = GqlExecutionContext.create(context)
    const headers = ctx.getContext().req.headers

    return true
  }
}
