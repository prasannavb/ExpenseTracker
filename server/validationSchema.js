const Joi = require('joi'); 

const signUpSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),  
    password: Joi.string().min(6).required() 
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),  
    password: Joi.string().min(6).required() 
});

const createBudgetSchema = Joi.object({
    budget_name: Joi.string().required(),
    budget_limit: Joi.number().required(),
    uid: Joi.string().required()
});

const updateBudgetSchema = Joi.object({
    budget_name: Joi.string().required(),
    budget_limit: Joi.number().required(),
    uid: Joi.string().required()
});

const createExpenseSchema = Joi.object({
    uid: Joi.string().required(),
    bid: Joi.string().required(),
    name: Joi.string().required(),
    amount: Joi.number().required(),
    date: Joi.string().required(),
    type: Joi.string().required()
});

const updateExpenseSchema = Joi.object({
    name: Joi.string().required(),
    amount: Joi.number().required(),
    type: Joi.string().required(),
});

const deleteBudgetSchema = Joi.object({
    uid: Joi.string().required(),
    bid: Joi.string().required()
});

const deleteExpenseSchema = Joi.object({
    expid: Joi.string().required(),
    bid: Joi.string().required()
});


module.exports = {
    signUpSchema,
    loginSchema,
    createBudgetSchema,
    updateBudgetSchema,
    createExpenseSchema,
    updateExpenseSchema,
    deleteBudgetSchema,
    deleteExpenseSchema,
};