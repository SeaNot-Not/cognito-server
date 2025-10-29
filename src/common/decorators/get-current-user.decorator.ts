import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Types } from "mongoose";

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) {
      // specific property
      const value = request.user[data];

      // convert mongodb objectid to string
      if (value instanceof Types.ObjectId) {
        return value.toString();
      }

      return value;
    }

    return request.user; // full user object
  },
); // can use only when there is a user object in the request (req.user)
