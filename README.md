# libromarks-server
Simple Node.js server to handle or manage bookmarks stored by users while navigating online

## Installation
1. To run migrations a **knexfile** is needed, to create one you can run the command:
```
npm run knext:init
```

2. After that you must fill the attributes on the connection object depending on the DBMS you use

```javascript
{
  client: 'mysql',
  connection: {
    host: '<host>',
    user: '<user>',
    password: '<password>',
    database: '<database>',
  },
  migrations: {
    tableName: 'knex_migrations',
    extension: 'ts',
  }
}
```

3. Once configured, you can run the migrations
```
npm run migrate:latest
```