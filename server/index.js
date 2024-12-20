const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const { connectDB } = require('./databaseConnection.js');
const { Users, Budget, Expense } = require('./models.js');
const {loginSchema,signUpSchema,createBudgetSchema,createExpenseSchema,deleteBudgetSchema,deleteExpenseSchema,updateBudgetSchema,updateExpenseSchema}=require('./validationSchema.js')
const bcrypt = require('bcrypt');
const app = express();

app.use(cors());
app.use(express.json());

// Start the database connection and then start the server
connectDB(app);

// Helper function for hashing passwords
const hashPassword = async (password) => bcrypt.hash(password, 10);

// Helper function for verifying passwords
const verifyPassword = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

// Function to handle internal server errors
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
};

// Middleware for validating requests
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body || req.params || req.query);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }
        next();
    };
};

// Signup route
app.post('/signup', async (req, res) => {
    try {
        const { error } = signUpSchema.validate(req.body);

        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        const { name, email, password } = req.body;
        console.log(req.body) 
        const hashedPassword = await hashPassword(password);
        await Users.create({ name, email, password: hashedPassword });
        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        if (error instanceof Sequelize.UniqueConstraintError) {

            if (error.errors[0].path === 'email') {
                return res.status(400).send({ message: 'Email already exists. Please use a different email.' });
            }
        }
        handleServerError(res, error);
    }
});

// Login route
app.post("/login", async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);

        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        const { email, password } = req.body;
        const user = await Users.findOne({
            attributes: ['uid', 'password'],
            where: { email }
        });

        if (user && await verifyPassword(password, user.dataValues.password)) {
            return res.status(200).json({ validity: true, uid: user.dataValues.uid });
        }
 
        res.status(401).send({ validity: false,message:"Invalid credintials" });
    } catch (error) {
        res.status(500).send({ validity: false,message:'Invalid credintials' });
    }
});

// Create Budget route
app.post("/createbudget", validateRequest(createBudgetSchema), async (req, res) => {
    try {
        const { budget_name, budget_limit, uid } = req.body;
        const existingBudget = await Budget.findOne({ where: { budget_name, uid } });

        if (existingBudget) {
            return res.status(400).send({ message: 'Budget already created for the same name' });
        }

        await Budget.create({ uid, budget_name, budget_limit });
        res.status(201).send({ message: 'Budget created successfully' });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Fetch all budgets by user UID
app.get('/fetchallbudget/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        const budgets = await Budget.findAll({
            attributes: [
                'bid', 
                'budget_name', 
                'budget_limit',
                [Sequelize.fn('SUM', Sequelize.col('Expenses.amount')), 'total_expenses']
            ],
            where: { uid },
            include: [
                {
                    model: Expense,
                    attributes: [], 
                },
            ],
            group: ['Budget.bid'], 
        });

        res.status(200).send(budgets);
    } catch (error) {
        handleServerError(res, error);
    }
});


// Update Budget route
app.put('/updatebudget/:bid', validateRequest(updateBudgetSchema), async (req, res) => {
    try {
        const { budget_name, budget_limit, uid } = req.body;
        const { bid } = req.params;

        const [updated] = await Budget.update({ budget_name, budget_limit, uid }, { where: { bid } });

        if (!updated) {
            return res.status(404).send({ message: 'Budget not found' });
        }

        res.status(200).send({ message: 'Budget details successfully updated' });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Delete Budget route
app.delete('/deletebudget', validateRequest(deleteBudgetSchema), async (req, res) => {
    try {
        const { uid, bid } = req.body;
        const budget = await Budget.findOne({ where: { uid, bid } });

        if (!budget) {
            return res.status(404).send({ msg: "Budget not found" });
        }

        await Expense.destroy({ where: { uid, bid } });
        await budget.destroy();

        res.status(200).send({ message: "Record deleted successfully" });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Create Expense route
app.post('/createexpense', validateRequest(createExpenseSchema), async (req, res) => {
    try {
        const { uid, bid, name, amount, date, type } = req.body;
        const budget = await Budget.findOne({ where: { bid } });

        if (!budget) {
            return res.status(404).send({ message: "Budget not found" });
        }

        await Expense.create({
            uid,
            bid,
            name,
            amount,
            date,
            type,
            budget: budget.budget_name
        });

        res.status(201).send({ message: 'Expense created successfully' });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Fetch all expenses by user UID
app.get("/fetchallexpense/:uid",async (req, res) => {
    try {
        const { uid } = req.params;
        const expenses = await Expense.findAll({attributes:['expid','name','type','amount','budget','date'], where: { uid } });
        res.status(200).send(expenses);
    } catch (error) {
        handleServerError(res, error);
    }
});


// Fetch all expenses by budget UID
app.get("/fetchallbudgetexpense/:bid",async (req, res) => {
    try {
        const { bid } = req.params;
        const expenses = await Expense.findAll({attributes:['expid','name','type','amount','budget','date'], where: { bid } });
        res.status(200).send(expenses);
    } catch (error) {
        handleServerError(res, error);
    }
});

// Update Expense route
app.put('/updateexpense/:expid', validateRequest(updateExpenseSchema), async (req, res) => {
    try {
        const { expid } = req.params;
        const { name, amount, type } = req.body;

        const [updated] = await Expense.update({ name, type, amount }, { where: { expid } });

        if (!updated) {
            return res.status(404).send({ message: 'Expense not found' });
        }

        res.status(200).send({ message: 'Expense details successfully updated' });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Delete Expense route
app.delete('/deleteexpense', validateRequest(deleteExpenseSchema), async (req, res) => {
    try {
        const { expid, bid } = req.body;
        const expense = await Expense.findOne({ where: { expid, bid } });

        if (!expense) {
            return res.status(404).send({ msg: "Expense not found" });
        }

        await expense.destroy();
        res.status(200).send({ message: "Record deleted successfully" });
    } catch (error) {
        handleServerError(res, error);
    }
});

module.exports = { app };
