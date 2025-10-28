import { Types } from "mongoose";
import { BadRequestException } from "@nestjs/common";

export const validateObjectId = (id: string, type = "ID") => {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`Invalid ${type}`);
  }
};
