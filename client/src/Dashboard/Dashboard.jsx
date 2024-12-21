import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css'


const borderclassses = [
  'border-red-500',
  ' border-yellow-500',
  ' border-green-500',
  ' border-blue-500',
  ' border-black',
];
const colorClasses = [
    ' bg-red-500 border-red-500',
    'bg-yellow-500 border-yellow-500',
    ' bg-green-500 border-green-500',
    'bg-blue-500 border-blue-500',
    'bg-black-500 border-black',
  ];

const Dashboard = () => {
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({uid:`${sessionStorage.getItem('uid')}`, budget_name: '', budget_limit: '' });
  const [formErrors, setFormErrors] = useState({});
  const [expenses,setExpenses]=useState([])

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  
  const openModal = (mode, budget = null) => {
    setModalMode(mode);
    setFormData(budget ? {uid:`${sessionStorage.getItem('uid')}`, budget_name: budget.budget_name, budget_limit: budget.budget_limit } : {uid:`${sessionStorage.getItem('uid')}`, budget_name: '', budget_limit: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ uid:`${sessionStorage.getItem('uid')}`,budget_name: '', budget_limit: '' });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log(formData)
    setFormErrors({ ...formErrors, [name]: '' });
  };


  const navigate=useNavigate()

  const fetchAllBudgets=async(uid)=>{
    const {data}=await axios.get(`http://localhost:8080/fetchallbudget/${uid}`)
    setBudgets(data)
    console.log(data)

  }

  const AddBudget=async()=>
  {
    try {
        const {data}=await axios.post('http://localhost:8080/createbudget',formData)
        alert(data.message)
        fetchAllBudgets(sessionStorage.getItem('uid'))
        closeModal();
            
    } catch (error) {
        alert(error.response.data.message)    
    }
    
  }

  const UpdateBudget=async()=>
  {
    try {
        let bid=sessionStorage.getItem('bid')
        const {data}=await axios.put(`http://localhost:8080/updatebudget/${bid}`,formData)
        alert(data.message)
        fetchAllBudgets(sessionStorage.getItem('uid'))
        sessionStorage.removeItem('bid')
        closeModal();
            
    } catch (error) {
        alert(error.response.data.message)    
    }
  }

  const deleteBudget = async (bid) => {
    const uid = sessionStorage.getItem('uid');
    try {
      const { data } = await axios.delete('http://localhost:8080/deletebudget', {
        data: { bid, uid }  // Use 'data' for sending the request body
      });
      alert(data.message)

    } catch (error) {
      console.error('Error deleting budget:', error);
    }

    fetchAllBudgets(uid)
    fetchRandomExpense(sessionStorage.getItem('uid'))

  };
  
  const fetchRandomExpense=async(uid)=>
  {
      const {data}=await axios.get(`http://localhost:8080/fetchallexpense/${uid}`)
      console.log(data)
      setExpenses(data)
  }

  useEffect(()=>{
    if(!sessionStorage.getItem('uid'))
    {
        navigate('/login')
    }
    fetchAllBudgets(sessionStorage.getItem('uid'))
    fetchRandomExpense(sessionStorage.getItem('uid'))
  },[])
  const validateForm = () => {
    const errors = {};

    if (!formData.budget_name.trim()) errors.name = 'Budget name is required';
    if (!formData.budget_limit || isNaN(formData.budget_limit) || formData.budget_limit <= 0) {
      errors.budget_limit = 'Please enter a valid budget amount';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (modalMode === 'add') {
        AddBudget()
      } else {
       UpdateBudget()
      }
    }
  };

  const viewAllExpense=(bid,budget_limit)=>
  {
    sessionStorage.setItem('bid',bid)
    sessionStorage.setItem('budget_limit',budget_limit)
    navigate(`/budget/${bid}`)
  }

  return (
    <>
        <Navbar/>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Existing Budgets</h1>
        <button
          onClick={() => openModal('add')}
          className=" text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors addbtn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Budget
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget, index) => {
          const colorClass = colorClasses[index % colorClasses.length];
          const borderclass = borderclassses[index % borderclassses.length];
          const remaining = budget.budget_limit - budget.total_expenses;
          const progress = (budget.total_expenses / budget.budget_limit) * 100;

          return (
            <div
              key={budget.bid}
            //   className={`p-4 rounded-xl border-2 ${borderclass} bg-white shadow-sm`}
              className={` p-4 bg-white shadow-lg rounded-xl border-2 ${borderclass} transition-transform transform hover:scale-105`}
              
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{budget.budget_name}</h3>
                <div className="text-right">
                  <p className="text-lg font-bold">₹ {budget.budget_limit}</p>
                  <p className="text-sm text-gray-600">budget_limit</p>
                </div>
              </div>

              <div className="relative h-2 w-full bg-gray-200 rounded-full mb-4">
                <div
                  className={`absolute top-0 left-0 h-full ${colorClass} rounded-full`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">₹ {budget.total_expenses??0}</span>
                  <span className="text-gray-600"> spent</span>
                </div>
                <div>
                  <span className="font-medium">₹ {remaining}</span>
                  <span className="text-gray-600"> remaining</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                onClick={()=>{viewAllExpense(budget.bid,budget.budget_limit)}}
                  className="text-green-600 hover:text-green-800 focus:outline-none"
                
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3C7.03 3 3.2 6.55 3 10c.2 3.45 4 7 9 7s8.8-3.55 9-7c-.2-3.45-4-7-9-7zm0 12c-2.1 0-4-1.79-4-4s1.9-4 4-4 4 1.79 4 4-1.9 4-4 4z" />
  </svg>
                </button>
              <button
                  onClick={() => {
                    sessionStorage.setItem('bid', budget.bid);
                    openModal('edit', budget);
                  }}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>

                <button
                  onClick={() => deleteBudget(budget.bid)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {modalMode === 'add' ? 'Add New Budget' : 'Update Budget'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name"  className="block text-gray-700 text-sm font-bold mb-2">Budget Name</label>
                <input
                  type="text"
                  id="name"
                  name="budget_name"
                  value={formData.budget_name}
                  placeholder='Budget name'
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 mt-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {formErrors.name && <p className="mt-1 text-red-500 text-xs italic">{formErrors.name}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="budget_limit"  className="block text-gray-700 text-sm font-bold mb-2">Budget Limit</label>
                <input
                  type="number"
                  id="budget_limit"
                  name="budget_limit"
                  placeholder='Budget limit'
                  value={formData.budget_limit}
                  onChange={handleInputChange}
                  // className="mt-1 py-2  w-full  addbudget"
                  className="shadow appearance-none border rounded w-full py-2 px-2 mt-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"

                />
                {formErrors.budget_limit && <p className="mt-1 text-red-500 text-xs italic">{formErrors.budget_limit}</p>}
              </div>
              <div className="flex items-center justify-between">
              <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                {modalMode === 'add' ?'Add Budget':'Update Budget'}
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
      )}
      
       <h2 className="text-2xl font-bold mt-12 mb-6">Recent Expenses</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                Budget
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                 ₹ {expense.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {expense.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {expense.budget}
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

   
    </>
  );
};

export default Dashboard;