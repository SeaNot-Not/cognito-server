import { Controller, All, NotFoundException } from "@nestjs/common";

@Controller()
export class NotFoundController {
  @All("*")
  notFound() {
    throw new NotFoundException("Resource not found");
  }
}
