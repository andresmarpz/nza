import { createServerAction } from "../src";
import { z } from "zod";

const exampleAction = createServerAction()
  .input(z.object({ name: z.string() }))
  .use(async (input, locals) => ({
    testLocal: 1,
  }))
  .handler(async (input, locals) => {
    console.log(input, locals);
  });

exampleAction({ name: "test" });
