<p align="center">
  <h1 align="center">nza</h1>
  <p align="center">
    Typesafe, validated server actions with Zod, for Next.js.
  </p>
</p>
<br/>
<p align="center">
  <a href="https://github.com/andresmarpz/nza/actions?query=branch%3Amaster"><img src="https://github.com/andresmarpz/nza/actions/workflows/build.yml/badge.svg?event=push&branch=main" alt="nza build status" /></a>
  <a href="https://opensource.org/licenses/MIT" rel="nofollow">
    <img src="https://img.shields.io/badge/License-MIT-orange.svg" alt="License MIT badge" />
  </a>
  <a href="https://www.npmjs.com/package/nza">
    <img alt="npm" src="https://img.shields.io/npm/v/nza?color=yellow">
  </a>
  <a href="https://bundlephobia.com/package/nza">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/nza">
  </a>
</p>
<br/>

## Installation

This library has `zod` as peer dependency, since we use it to create a schema and validate the input. Install with your preferred package manager.

```bash
$ npm install nza zod
```

## Example

Let's say we wanted to have a server action to create a user task. The first thing would be to identify the input we need.

```ts
import { z } from 'zod';

const taskInput = z.object({
  title: z.string(),
  description: z.string().optional(),
  done: z.boolean()
})
```

Next, we can define our typesafe server action. Import `createServerAction` to do so.

```ts
import { z } from 'zod';
import { createServerAction } from 'nza';

const taskInput = z.object({
  title: z.string(),
  description: z.string().optional(),
  done: z.boolean()
})

const serverAction = createServerAction()
  .input(taskInput)
  .handler(async (input) => {
    const task = await db.task.create({
      data: input
    })

    return task;
  })
```

Of course, the handler will already have the input typed and the output inferred.

## Middleware

Aside from the handler itself, you can abstract common pieces of code used on multiple server actions and use them as middleware. For example:
<br/>

```ts

/**
*  A common middleware would be to require user authentication. For example, the following
*  would work when using `next-auth`. If you need some input, you can grab it. It will respect
*  the schema provided previously.
*
*  Notice that you can return an object with `locals`. These are accumulated through every middleware and then
*  passed down to the server action handler. 
*/

async function withAuth(){
  const session = await getSession()

  if(!session){
    throw new Error('You must be authenticated')
  }

  return {
    session
  }
}

const actionRequireAuth = createServerAction()
  .input(...)
  .use(withAuth)
  .handler(async (input, locals) => {
    // locals contains the session key we returned before.

    const user = locals.session.user;

    ...
  })
```

The `locals` parameter is shared across middlewares as well, and accumulated with each call. At first, it will be an empty object, then it will merge every `locals` return from middlewares. You can store anything you obtain on middlewares and that might need either on the following middlewares or on the server action handler.
<br/><br/>
If you need the input of the action on the middleware, or a part of it, count on having it.
<br/>

```ts
function checkAge(input: { age: number }) {
  return {
    validAge: input.age >= 21
  }
}

const test = createServerAction()
  .input(
    z.object({
      name: z.string(),
      age: z.number(),
    })
  )
  .use(checkAge)
  .handler((input, locals) => {
    // locals will now contain 'validAge'
    console.log(locals.validAge);
  });
```
