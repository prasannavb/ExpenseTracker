const Sequelize = require('sequelize');

const sequelize = new Sequelize("expenseTracker", "postgres", "postgres", {
  host: "localhost",
  port: 5432,
  dialect: "postgres"
});

async function connectDB(app) {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    app.listen(8080, () => {
      console.log("Connected to the database and server is running on port 8080");
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

module.exports = { connectDB,sequelize };
