const config = require("../database/config")
const db = require("../database/db")


describe('Test database creation', () => {
    it('should return successfully created', async () => {
    expect.assertions(1);
    const returnedValue = await db.createDatabase()
    return expect(returnedValue).toEqual('created successfully')
  })
})


describe('Test table creation', () => {
    it('should return successfully created for tables', async () => {
    expect.assertions(1);
    const returnedValue = await db.createTables()
    return expect(returnedValue).toEqual('created successfully')
  })
})