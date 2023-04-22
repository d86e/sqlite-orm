import SqliteORM from '../src/index.js';

async function main() {
    const db = await new SqliteORM('./db.sqlite');
    // db.table.Users.id = 9
    db.table.Users.name = "Tommy"
    db.table.Users.age = 18
    // let user = await db.table.Users.whereOr({ id: 12, age: 18 }).find()
    // user.age = 19
    let id = await db.table.Users.save();
    console.log(id)
}
main()