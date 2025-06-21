Responsiblities of each thing in the backend:

1. Repositories: Build SQL, Redis, S3 and Meilisearch queries. Transactions are not handled here, services determine whether certain queries should be inside transactions or not. For select queries, don't pick fields dynamically, makes things a bit more complex than it needs to be and performance difference is often minimal.
2. Services: Uses repository methods to execute the desired logic. These methods must not throw expected errors (e.g.: `throw new Error()`).
3. Routers and bakcground jobs: Return HTTP exceptions (routers only) and execute methods from services. Route validation schemas also reside here.

**Structure**

```
backend
  src
    middlewares
      [middleware_name].ts
    modules
      [module_name]
        [module_name].repository.ts
        [module_name].service.ts
    routers
      [router_name].router.ts
    schema
      [table_group_name].ts
    singletons
      [singleton_name].ts
    tests
      routers
        [router_name]
          [action].test.ts
    types
      index.ts
    utils
      [util_category].ts
```

To maintain some order within each structure, it's recommended to define methods based on what operation they're doing, as so:

1. Upsert
2. Create
3. Update
4. Delete
5. Read

Example:

```ts
class UserDbRepository {
  public upsertUser() { ... }

  public createUser() { ... }

  public createOsuUser() { ... }

  public createDiscordUser() { ... }

  public updateUser() { ... }

  public deleteUser() { ... }

  public getUser() { ... }

  public isUserAdmin() { ... }
}
```
