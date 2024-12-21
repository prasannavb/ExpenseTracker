import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [formData, setFormData] = useState({
    uid: `${sessionStorage.getItem('uid')}`,
    bid: `${sessionStorage.getItem('bid')}`,
    name: '',
    amount: '',
    date: '',
    type: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [budget_limit, setBudgetLimit] = useState({
    budget_limit: '',
    total_expenses: ''
  });

  const openModal = (expense = null) => {
    setCurrentExpense(expense);
    setFormData(expense || { 
      uid: `${sessionStorage.getItem('uid')}`, 
      bid: `${sessionStorage.getItem('bid')}`, 
      name: '', 
      amount: '', 
      date: '', 
      type: '' 
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExpense(null);
    setFormData({
      uid: `${sessionStorage.getItem('uid')}`,
      bid: `${sessionStorage.getItem('bid')}`,
      name: '',
      amount: '',
      date: '',
      type: ''
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Expense name is required';
    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0 || 
      (formData.type.trim() === "Expenditure" && Number(formData.amount) > Number(budget_limit.budget_limit))) {
      errors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.type.trim()) errors.type = 'Expense type is required';
    if(currentExpense)
    {
      if (formData.type.trim() === "Expenditure" && 
      (Number(formData.amount) + Number(budget_limit.total_expenses) - Number(currentExpense.amount) > Number(budget_limit.budget_limit))) {
      errors.amount = 'Expense will exceed allocated budget';
    }
    }
    else
    {
      if (formData.type.trim() === "Expenditure" && 
      (Number(formData.amount) + Number(budget_limit.total_expenses) > Number(budget_limit.budget_limit))) {
      errors.amount = 'Expense will exceed allocated budget';}
    }
   
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const deleteExpense = async (expid) => {
    const bid = sessionStorage.getItem('bid');
    try {
      const { data } = await axios.delete("http://localhost:8080/deleteexpense", {
        data: {
          expid,
          bid
        }
      });
      alert(data.message);
      fetchBudgetExpense(sessionStorage.getItem('bid'));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const navigate = useNavigate();

  const AddExpense = async () => {
    try {
      const { data } = await axios.post('http://localhost:8080/createexpense', formData);
      alert(data.message);
      fetchBudgetExpense(sessionStorage.getItem('bid'));
      closeModal();
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const updateExpense = async () => {
    try {
      const expid = currentExpense.expid;
      const { data } = await axios.put(`http://localhost:8080/updateexpense/${expid}`, {
        name: formData.name,
        type: formData.type,
        amount: formData.amount,
      });
      alert(data.message);
      fetchBudgetExpense(sessionStorage.getItem('bid'));
      closeModal();
    } catch (error) {
      console.error('Error updating expense:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update expense. Please try again.';
      alert(errorMessage);
    }
  };

  const fetchBudgetExpense = async (bid) => {
    try {
      const { data } = await axios.get(`http://localhost:8080/fetchallbudgetexpense/${bid}`);
      const expensesList = data || [];

      const expenditureExpenses = expensesList.filter(expense => expense.type === 'Expenditure');
      const totalExpenses = expenditureExpenses.length > 0 
        ? expenditureExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0) 
        : 0;

      sessionStorage.setItem('total_expenses', totalExpenses);

      setExpenses(expensesList);
      setBudgetLimit({
        budget_limit: sessionStorage.getItem('budget_limit'),
        total_expenses: totalExpenses,
      });

    } catch (error) {
      console.error('Error fetching budget expenses:', error);
      alert('Failed to fetch budget expenses. Please try again later.');
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem('uid') || !sessionStorage.getItem('bid')) {
      navigate('/');
    }
    fetchBudgetExpense(sessionStorage.getItem('bid'));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (currentExpense) {
        updateExpense();
      } else {
        let date = new Date().toISOString().split('T')[0];
        formData.date = date;
        AddExpense();
      }
    }
  };

  const Back=()=>
  {
    navigate('/')
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Expenses</h1>
          <div className='flex'>
          <button 
          className=" text-white px-4 py-2 rounded-md flex items-center gap-2 mr-2 transition-colors addbtn"
          onClick={Back}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"  
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            role="img"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          
        </button>
          <button
            onClick={() => openModal()}
            className="text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors addbtn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Expense
          </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow-md rounded">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{expense.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">₹ {expense.amount}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{expense.date}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{expense.type}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button
                      onClick={() => openModal(expense)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteExpense(expense.expid)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {currentExpense ? 'Edit Expense' : 'Add New Expense'}
                </h3>
                <form onSubmit={handleSubmit} className="mt-2 text-left">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Title"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {formErrors.name && <p className="mt-1 text-red-500 text-xs italic">{formErrors.name}</p>}
                  </div>
                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">Amount</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      placeholder="Amount spent"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {formErrors.amount && <p className="mt-1 text-red-500 text-xs italic">{formErrors.amount}</p>}
                  </div>
                  <div className="mb-4">
                    <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                    <input
                      type="text"
                      id="type"
                      name="type"
                      value={formData.type}
                      placeholder="Income or Expenditure"
                      onChange={handleInputChange}
                      className="capitalize shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {formErrors.type && <p className="mt-1 text-red-500 text-xs italic">{formErrors.type}</p>}
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      {currentExpense ? 'Update' : 'Add'} Expense
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ExpensesPage;
