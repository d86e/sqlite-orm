# ⚙️ sqlite-orm

Node.js 的异步、非阻塞 SQLite3 ORM组件，使用了Promise。也可以使用async、await同步操作，非常方便。链试查询，模型自动映射，模型保存，代码精简。


# 特征

- 小巧精练，仅两百多行代码，除了sqlite3驱动无其他组件依赖
- 简单的数据库连接，直接写sqlite文件路径即可
- 自动映射所有的表和字段为JavaScript对象模型
- 带有链式查询方法
- 可以使用where or、join、left join等
- 具有模型保存方法，自动判断是新增还是编辑

# 安装

你可以使用 npm 或 yarn 安装sqlite-orm
* (推荐)使用github链接安装
```bash
npm install https://github.com/d86e/sqlite-orm
# or
yarn add https://github.com/d86e/sqlite-orm
```

# 用法

注意：sqlite-orm模块必须在使用前安装。
一共有以下几个模型操作方法可以使用：
- find
- select
- delete
- save
- where
- whereOr
- join
- outerJoin
- crossJoin

New一个数据库对象，数据库访问会有延时，支持使用async await
```bash
import SqliteORM from 'sqlite-orm';
async function main() {
    const db = await new SqliteORM('./db.sqlite');
}
main()
```
数据表为Users的对应模型
```bash
import SqliteORM from 'sqlite-orm';
async function main() {
    const db = await new SqliteORM('./db.sqlite');

    const Users = db.table.Users;
}
main()
```

使用find方法查询一条数据
```bash
import SqliteORM from 'sqlite-orm';
async function main() {
    const db = await new SqliteORM('./db.sqlite');

    const Users = db.table.Users;

    await Users.find({id: 1});

    console.log(Users.name);
}
main()
```

使用save方法保存数据
```bash
import SqliteORM from 'sqlite-orm';
async function main() {
    const db = await new SqliteORM('./db.sqlite');

    const Users = db.table.Users;

    let user = await Users.find({id: 1});

    //保存修改
    user.age = 19;
    user.save();

    //新增一条数据
    Users.name = 'Angela';
    Users.age = 20;

    let id = await Users.save();

    console.log(id);
}
main()
```

使用select方法查询多条数据
```bash
import SqliteORM from 'sqlite-orm';
async function main() {
    const db = await new SqliteORM('./db.sqlite');

    const Users = db.table.Users;

    let list = await Users.select();

    console.log(list);
}
main()
```

使用where方法查询多条数据
```bash
import SqliteORM from 'sqlite-orm';
async function main() {
    const db = await new SqliteORM('./db.sqlite');

    const Users = db.table.Users;

    let list = await Users.where({age: 18}).select();

    console.log(list);

    // where or 也可以这样写,直接传数组

    let list = await Users.where([{age: 18},{name: 'Tommy'}]).select();

    console.log(list);
}
main()
```

或者使用whereOr方法查询多条数据
```bash
import SqliteORM from 'sqlite-orm';
async function main() {
    const db = await new SqliteORM('./db.sqlite');

    const Users = db.table.Users;

    let list = await Users.whereOr({age: 18, name: 'Tommy'}).select();

    console.log(list);

    // 直接传数组也可以

    let list = await Users.where([{age: 18},{name: 'Tommy'}]).select();

    console.log(list);
}
main()
```

使用join查询多张表
```bash
import SqliteORM from 'sqlite-orm';
async function main() {
    const db = await new SqliteORM('./db.sqlite');

    const Users = db.table.Users;

    let list = await Users.join('Type', 'Type.user_id = Users.id').where({'Users.age': 18, 'Type.active': true}).select();

    console.log(list);
}
main()
```

使用outerJoin外连接,左外连接（LEFT OUTER JOIN）
```bash
import SqliteORM from 'sqlite-orm';
async function main() {
    const db = await new SqliteORM('./db.sqlite');

    const Users = db.table.Users;

    let list = await Users.join('Type', 'Type.user_id = Users.id').where({'Users.age': 18, 'Type.active': true}).select();

    console.log(list);
}
main()
```

使用crossJoin交叉连接
```bash
import SqliteORM from 'sqlite-orm';
async function main() {
    const db = await new SqliteORM('./db.sqlite');

    const Users = db.table.Users;

    let list = await Users.crossJoin('Type').where({'Users.age': 18, 'Type.active': true}).select();

    console.log(list);
}
main()
```

使用delete删除数据
```bash
import SqliteORM from 'sqlite-orm';
async function main() {
    const db = await new SqliteORM('./db.sqlite');

    const Users = db.table.Users;

    let res = await Users.where({'id': 8}).delete();

    console.log(res); // true or false

    //或者这样写也可以

    let res = await Users.delete({'id': 8});

    console.log(res); // true or false
}
main()
```


# 测试

```bash
npm run test
```

# 致谢

感谢 [sqlite3](https://github.com/TryGhost/node-sqlite3) 的作提供了如此优秀的 sqlite3 npm模块对sqlite3进行驱动。

# 变更日志

我们使用 GitHub 发布来获取最新版本的注释。有关旧版本的详细信息，请参阅 git 历史记录中的 CHANGELOG.md。


# License


`sqlite-orm` 是使用 [BSD 许可协议](https://github.com/d86e/sqlite-orm/raw/master/LICENSE).
