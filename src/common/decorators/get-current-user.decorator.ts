import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) return request.user[data]; // specific property
    return request.user; // full user object
  },
); // can use only when there is a user object in the request (req.user)
