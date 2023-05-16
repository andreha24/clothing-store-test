const sql = require('mssql');
const jwt = require('jsonwebtoken');
let instance = null;

const config = {
    user: "dsrdsr7",
    password: "NAMS9kUgcwgQS@S",
    server: "dsrdsr7v2.database.windows.net",
    database: "Internet_ cloth_shop_v2",
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
};

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    // async getFilesFromStorage() {
    //     try {
    //         const [files] = await bucket.getFiles();
    //         console.log('files', files);
    //         return files;
    //     } catch (err) {
    //         console.error('ERROR:', err);
    //     }
    // }

    async getAllProducts() {
        try {
            const pool = new sql.ConnectionPool(config);
            const response = await new Promise((resolve, reject) => {
                pool.connect().then(() => {
                    const request = new sql.Request(pool);
                    request.query("SELECT * FROM Products").then((result, err) => {
                        if(err){
                            reject(new Error(err.message));
                        }
                        resolve(result.recordset);
                        pool.close();
                    }).catch((err) => {
                        console.error(err);
                        pool.close();
                    });
                })
            })
            return response
        } catch (error) {
            console.log(error);
        }
    }

    async getProduct(id) {
        try {
            const pool = new sql.ConnectionPool(config);
            const response = await new Promise((resolve, reject) => {
                pool.connect().then(() => {
                    const request = new sql.Request(pool);
                    request.query(`SELECT * FROM Products WHERE id = ${id}`).then((result, err) => {
                        if(err){
                            reject(new Error(err.message));
                        }
                        resolve(result.recordset);
                        pool.close();
                    }).catch((err) => {
                        console.error(err);
                        pool.close();
                    });
                })
            })
            return response
        } catch (error) {
            console.log(error);
        }
    }




    async addProduct(name, sex, price, description, type_of_product,type,size,rating, season,collection_name, images) {
        try {
            await sql.connect(config);
            const result = await sql.query`EXEC InsertProduct ${sex}, ${name} , ${price}, ${description}, ${type_of_product},${type}, ${size} ,${rating}, ${season},${collection_name}, ${images}`;
        } catch (error) {
            console.log(error);
        } finally {
            sql.close();
        }
    }

    async deleteTour(id){
        sql.connect(config)
            .then(pool => {
                const request = pool.request();
                request.query(`DELETE FROM MyTable WHERE id = ${id}`)
                    .then(result => {
                        console.log(`Deleted ${result.rowsAffected} rows`);
                    })
                    .catch(error => {
                        console.log(`Error: ${error}`);
                    });
            })
            .catch(error => {
                console.log(`Error connecting to the database: ${error}`);
            });
    }

    async editTour(id, name) {
        try {
            await sql.connect(config);
            const result = await sql.query`UPDATE MyTable SET Name=${name} WHERE Id=${id}`;
        } catch (error) {
            console.log(error);
        } finally {
            sql.close();
        }
    }

    async getProductImages(){
        try {
            const pool = new sql.ConnectionPool(config);
            return await new Promise((resolve, reject) => {
                pool.connect().then(() => {
                    const request = new sql.Request(pool);
                    request.query("SELECT * FROM Product_img;").then((result, err) => {
                        if (err) {
                            reject(new Error(err.message));
                        }
                        resolve(result.recordset);
                        pool.close();
                    }).catch((err) => {
                        console.error(err);
                        pool.close();
                    });
                })
            })
        } catch (error) {
            console.log(error);
        }
    }

    async insertNewUser(_name, _mail, _password) {
        try {
            await sql.connect(config);
            const res = await sql.query`INSERT INTO Users ([Name], e_mail, [password]) VALUES ('${_name}', '${_mail}', '${_password}');`;
            return res; // Возвращаем успешный результат в виде промиса
        } catch (error) {
            console.log(error);
            throw error; // Пробрасываем ошибку для ее обработки в catch блоке
        } finally {
            sql.close();
        }
    }

    async checkUser(_mail, _password) {
        try {
            await sql.connect(config);
            const result = await sql.query`SELECT * FROM Users WHERE e_mail = ${_mail} AND password = ${_password}`;
            if (result.recordset.length > 0) {
                const token = jwt.sign({ name : result.recordset[0].Name, role: result.recordset[0].is_admin}, 'секретный_ключ', { expiresIn: '1h' });
                const user = result.recordset[0];
                return {user: user, token: token};
            } else {
                return null;
            }
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            sql.close();
        }
    }

    // async insertNewUser(_name, _mail, _password){
    //     try {
    //         const pool = new sql.ConnectionPool(config);
    //         return await new Promise((resolve, reject) => {
    //             pool.connect().then(() => {
    //                 const request = new sql.Request(pool);
    //                 request.query(`INSERT INTO Users ([Name], e_mail, [password]) VALUES ('${_name}', '${_mail}', '${_password}');`).then((result, err) => {
    //                     if (err) {
    //                         reject(new Error(err.message));
    //                     }
    //                     resolve(result.recordset);
    //                     pool.close();
    //                 }).catch((err) => {
    //                     console.error(err);
    //                     pool.close();
    //                 });
    //             })
    //         })
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    async getRecentClothes(){
        try {
            const pool = new sql.ConnectionPool(config);
            return await new Promise((resolve, reject) => {
                pool.connect().then(() => {
                    const request = new sql.Request(pool);
                    request.query("SELECT TOP 4 * FROM Products ORDER BY date_added DESC;").then((result, err) => {
                        if (err) {
                            reject(new Error(err.message));
                        }
                        resolve(result.recordset);
                        pool.close();
                    }).catch((err) => {
                        console.error(err);
                        pool.close();
                    });
                })
            })
        } catch (error) {
            console.log(error);
        }
    }
    async getTopClothes(){
        try {
            const pool = new sql.ConnectionPool(config);
            return await new Promise((resolve, reject) => {
                pool.connect().then(() => {
                    const request = new sql.Request(pool);
                    request.query("SELECT TOP 4 * FROM Products ORDER BY rating DESC;").then((result, err) => {
                        if (err) {
                            reject(new Error(err.message));
                        }
                        console.log(result);
                        resolve(result.recordset);
                        pool.close();
                    }).catch((err) => {
                        console.error(err);
                        pool.close();
                    });
                })
            })
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = DbService;


