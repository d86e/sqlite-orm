
import sqlite3 from 'sqlite3'
const SqliteORM = (function () {
    let instance;
    let db;
    let joinSrt = "";
    let whereStr = "";
    let whereJoin = (where) => {
        let wStr = ""
        let whileObj = function (where) {
            let whereArr = []
            for (let key in where) {
                if (Object.hasOwnProperty.call(where, key)) {
                    if (typeof where[key] === 'string') {
                        whereArr.push(`${key} = '${where[key]}'`)
                    }
                    else if (typeof where[key] === 'object') {
                        if (typeof where[key][1] === 'string') {
                            whereArr.push(`${key} ${where[key][0]} '${where[key]}'`)
                        } else {
                            whereArr.push(`${key} ${where[key][0]} ${where[key]}`)
                        }
                    }
                    else {
                        whereArr.push(`${key} = ${where[key]}`)
                    }
                }
            }
            return whereArr;
        }
        if (Array.isArray(where)) {
            let arr = [];
            for (let k in where) {
                if (typeof where[k] === 'object') {
                    let whereArr = whileObj(where[k])
                    arr.push(`(${whereArr.join(' AND ')})`)
                }
            }
            wStr = ` WHERE ${arr.join(' OR ')} `
        } else if (typeof where === 'object') {
            let whereArr = whileObj(where)
            if (whereArr.length) {
                wStr = ` WHERE ${whereArr.join(' AND ')} `
            }
        }
        return wStr;
    }
    return (function () {
        if (!instance) {
            instance = class {
                constructor(option) {
                    if (option) {
                        this.option = option;
                        return this.connect(option);
                    } else {
                        db = {}
                    }
                }
                async connect(option) {
                    db = new sqlite3.Database(typeof option === 'string' ? option : option.db)
                    db.table = {};
                    let res = await new Promise((resolve, reject) => {
                        db.all("select * from sqlite_master where type='table';", (err, res) => {
                            resolve(res)
                        })
                    })
                    return await new Promise((r, j) => {
                        res.forEach(async item => {
                            db.table[item.name] = {};
                            db.table[item.name]._table_types = item;
                            db.table[item.name].save = this.save;
                            db.table[item.name].find = this.find;
                            db.table[item.name].where = this.where;
                            db.table[item.name].whereOr = this.whereOr;
                            db.table[item.name].select = this.select;
                            db.table[item.name].delete = this.delete;
                            let fields = await new Promise((r2, j) => {
                                db.all(`PRAGMA table_info(${item.name})`, (err, fields) => {
                                    r2(fields)
                                })
                            })
                            db.table[item.name]._table_fields = fields;
                            fields.forEach(field => {
                                db.table[item.name][field.name] = field.dflt_value;
                            })
                            r(db)
                        })

                    })

                }
                async save() {
                    let fieldArr = [];
                    let valueArr = [];
                    let columnArr = [];
                    let id = this.id;
                    for (let i in this._table_fields) {
                        let field = this._table_fields[i].name;
                        if (field != 'id') {
                            fieldArr.push(field);
                            if (typeof this[field] === 'string') {
                                valueArr.push(`'${this[field]}'`);
                                columnArr.push(`${field} = '${this[field]}'`)
                            } else {
                                valueArr.push(this[field]);
                                columnArr.push(`${field} = ${this[field]}`)
                            }
                        }
                    }
                    this._table_fields.forEach(field => {
                        this[field.name] = field.dflt_value;
                    })
                    if (!id) {
                        return await new Promise((resolve, reject) => {
                            db.run(`INSERT INTO ${this._table_types.name} 
                                    (${fieldArr.join(', ')})
                                    VALUES(${valueArr.join(', ')});`);
                            db.each(`SELECT last_insert_rowid() as id FROM ${this._table_types.name} LIMIT 1;`, (err, res) => {
                                resolve(res.id);
                            })

                        })
                    } else {
                        return await new Promise((resolve, reject) => {
                            db.run(`UPDATE ${this._table_types.name}
                            SET ${columnArr.join(', ')}
                            WHERE id=${id};`);
                            resolve(id);
                        })
                    }
                }
                async find(where) {
                    if (whereStr) {
                        whereStr += whereJoin(where).replace('WHERE', 'AND')
                    } else {
                        whereStr = whereJoin(where);
                    }
                    return await new Promise((resolve, reject) => {
                        db.get(`SELECT * FROM ${this._table_types.name}
                        ${joinSrt} ${whereStr} LIMIT 1;`, (err, res) => {
                            this._table_fields.forEach(field => {
                                this[field.name] = res[field.name];
                            })
                            joinSrt = ""
                            whereStr = ""
                            resolve(this);
                        })
                    })
                }
                async select(where) {
                    if (whereStr) {
                        whereStr += whereJoin(where).replace('WHERE', 'AND')
                    } else {
                        whereStr = whereJoin(where);
                    }
                    return await new Promise((resolve, reject) => {
                        db.all(`SELECT * FROM ${this._table_types.name} 
                        ${joinSrt} ${whereStr}`, (err, res) => {
                            joinSrt = ""
                            whereStr = ""
                            resolve(res);
                        })
                    })
                }
                async delete(where) {
                    if (whereStr) {
                        whereStr += whereJoin(where).replace('WHERE', 'AND')
                    } else {
                        whereStr = whereJoin(where);
                    }
                    return await new Promise((resolve, reject) => {
                        db.run(`DELETE  FROM ${this._table_types.name} 
                        ${whereStr}`, (err) => {
                            if (!err) {
                                whereStr = ""
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        })
                    })
                }
                where(where) {
                    whereStr = whereJoin(where);
                    return this;
                }
                whereOr(where) {
                    let wArr = [];
                    if (!Array.isArray(where)) {
                        for (const key in where) {
                            if (Object.hasOwnProperty.call(where, key)) {
                                let tmp = {}
                                tmp[key] = where[key]
                                wArr.push(tmp);
                            }
                        }
                        whereStr = whereJoin(wArr);
                    } else {
                        whereStr = whereJoin(where);
                    }
                    return this;
                }
                join(where) {
                    joinSrt = ` JOIN ${where[0]} ON ${where[1]} `;
                    return this;
                }
                outerJoin(where) {
                    joinSrt = ` OUTER JOIN ${where[0]} ON ${where[1]} `;
                    return this;
                }
                crossJoin(where) {
                    joinSrt = ` CROSS JOIN ${where} `;
                    return this;
                }
            }
        }
        return instance;
    }());
}());
module.exports = SqliteORM;
