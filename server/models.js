const {sequelize}=require('./databaseConnection.js')
const {DataTypes}=require('sequelize')

const Users=sequelize.define(
    'Users',
    {
        uid:{
            type:DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4,
            primaryKey:true
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false
        },
        email:{
            type:DataTypes.STRING,
            unique:true,
            allowNull:false

        },
        password:{
            type:DataTypes.STRING,
            allowNull:false
        },
    },
    {
        tableName: 'Users',
        createdAt:false, 
        updatedAt:false
    }
); 

const Budget=sequelize.define(
    'Budget',
    {
        uid:{
            type:DataTypes.UUID,
            allowNull:false,
            references: {
                model: 'Users',
                key: 'uid',
            },
        },
        bid:{
            type:DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4,
            primaryKey:true
        },
        budget_name:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        budget_limit:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    { 
        tableName: 'Budget',
        createdAt:false, 
        updatedAt:false
    }
)

const Expense=sequelize.define(
    'Expense',
    {
        expid:{
            type:DataTypes.UUID,
            primaryKey:true,
            defaultValue:DataTypes.UUIDV4
        },
        uid:{
            type:DataTypes.UUID,
            allowNull:false,
            references: {
                model: 'Users',
                key: 'uid',
            },
        },
        bid:{
            type:DataTypes.UUID,
            allowNull:false,
            references: {
                model: 'Budget',
                key: 'bid',
            },
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),  
            allowNull: false
        },
        type:{
            type:DataTypes.STRING,
            allowNull:false
        },
        budget:{
            type:DataTypes.STRING,
            allowNull:false
        },
        date:{
            type:DataTypes.STRING, 
            allowNull:false
        }
    },
    {
        tableName:'ExpenseDetails',
        createdAt:false,
        updatedAt:false
    }
)
Users.hasMany(Budget, { foreignKey: 'uid' });  // User has many Budgets
Budget.belongsTo(Users, { foreignKey: 'uid' }); // Budget belongs to User

Budget.hasMany(Expense, { foreignKey: 'bid' }); // Budget has many Expenses
Expense.belongsTo(Budget, { foreignKey: 'bid' }); // Expense belongs to Budget

Users.hasMany(Expense, { foreignKey: 'uid' }); // User has many Expenses
Expense.belongsTo(Users, { foreignKey: 'uid' }); // Expense belongs to User

module.exports={Users,Budget,Expense} 