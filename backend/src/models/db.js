// backend/models/db.js
import { Sequelize } from "sequelize";

let sequelize;

// ✅ If DATABASE_URL is set (Render), use that
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // needed for Render's self-signed certs
      },
    },
  });
} else {
  // ✅ Fallback for local dev
  sequelize = new Sequelize(
    process.env.DB_NAME || "science_master",
    process.env.DB_USER || "postgres",
    process.env.DB_PASS || "postgres",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
    }
  );
}

export default sequelize;
