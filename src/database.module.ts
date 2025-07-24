import { Global, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as schema from "../db/schema"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"

@Global()
@Module({
  providers: [
    {
      provide: "DATABASE_CONNECTION",
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>("DATABASE_URL")
        if (!url) throw new Error("DATABASE_URL is not defined")
        const pool = new Pool({ connectionString: url })
        return drizzle(pool, { schema })
      }
    }
  ],
  exports: ["DATABASE_CONNECTION"]
})
export class DatabaseModule {}
