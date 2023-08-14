import { z } from "zod";

type InputSetterFn<In, Ls> = <Z extends z.ZodTypeAny>(
  schema: Z
) => ServerAction<In & z.infer<typeof schema>, Ls>;

type MiddlewareFn<In, Ls, Out> = (input: In, locals: Ls) => Out;

type HandlerFn<In, Ls> = <R>(
  fn: (input: In, locals: Ls) => Promise<R>
) => (input: In) => Promise<Awaited<R>>;

interface ServerAction<In, Ls> {
  input: InputSetterFn<In, Ls>;
  use: <O extends Record<any, any> | void>(
    fn: MiddlewareFn<In, Ls, O>
  ) => ServerAction<In, Ls & Awaited<O>>;
  handler: HandlerFn<In, Ls>;
}

export { ServerAction, InputSetterFn, MiddlewareFn, HandlerFn };
