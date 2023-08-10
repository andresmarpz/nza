import { z } from "zod";
import { MiddlewareFn, ServerAction } from "./types";
import { merge } from "./utils";

function serverAction<In, Ls extends Record<any, any> = {}>(opts: {
  schema?: z.ZodTypeAny;
  middleware: MiddlewareFn<In, Ls, unknown>[];
}): ServerAction<In, Ls> {
  return {
    input: (newSchema) =>
      serverAction<In & z.infer<typeof newSchema>, Ls>(
        Object.assign(opts, {
          schema: newSchema,
        })
      ),

    use: (fn) => {
      return serverAction<In, Ls & Awaited<ReturnType<typeof fn>>>(
        Object.assign(opts, {
          middleware: opts.middleware.concat(fn),
        })
      );
    },

    handler: (fn) => {
      return async function action(
        input: In
      ): Promise<Awaited<ReturnType<typeof fn>>> {
        const parsedInput = opts.schema?.parse(input) || input;
        // internal locals type, won't be exposed so we can assert
        let acc = {} as Ls;

        for (const mw of opts.middleware) {
          const result = await mw(parsedInput, acc);

          if (result) acc = merge(acc, result);
        }

        return await fn(parsedInput, acc);
      };
    },
  };
}

export function createServerAction() {
  return serverAction({ middleware: [] });
}
