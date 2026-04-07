// 数据库入口点

export { initializeDatabase, insertDefaultConfig, closeDatabase } from './init';
export { DatabaseManager, getDatabaseManager, setDatabaseManager } from './manager';
