const {spawnSync} = require('node:child_process')

function mockDB() {
  
  const emptyRows = async (db) => {
    await db.query(`DELETE FROM industries_companies`)
    await db.query(`DELETE FROM invoices`)
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM industries`)
  };

  const resetRows = async (db) => {
    await emptyRows(db)
    spawnSync(`psql -d ${db.database} -f data.sql`, {shell: true})
  };

  const cleanUp = async (db) => {
    const database = db.database
    await db.end()
    spawnSync(`psql -c "DROP DATABASE IF EXISTS ${database};"`, {shell: true})

  }

  jest.mock('./db', () => {
    const database = 'test_' + require('node:crypto').randomUUID().replace(/-/g, '')
    const {spawnSync} = require('node:child_process')
    spawnSync(`psql -c "DROP DATABASE IF EXISTS ${database};"`, {shell: true})
    spawnSync(`psql -c "CREATE DATABASE ${database};"`, {shell: true})
    spawnSync(`psql -d ${database} -f data.sql`, {shell: true})

    const {Client} = require('pg')
    const db = new Client({
      host: 'localhost',
      database
    })
    return {
      ...jest.requireActual('./db'),
      db,
      init_db: async () => {
        await db.connect()
      }
    }
  })
  return {resetRows, emptyRows, cleanUp}
}

module.exports = {
  mockDB
}