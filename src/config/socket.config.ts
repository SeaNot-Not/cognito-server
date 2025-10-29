import configuration from "../config/env.config";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions } from "socket.io";

export class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions) {
    const { clientUrl } = configuration();

    const serverOptions: Partial<ServerOptions> = {
      cors: {
        origin: clientUrl,
        credentials: true,
        methods: ["GET", "POST"],
      },
    };

    return super.createIOServer(port, { ...options, ...serverOptions } as ServerOptions);
  }
}
