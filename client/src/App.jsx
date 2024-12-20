import Login from './Login/Login.jsx'
import Signup from './Signup/Signup.jsx'
import Dashboard from './Dashboard/Dashboard.jsx'
import ExpensesPage from './Expense/Expense.jsx'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
const App=()=>
{
  return(
    <>
    <BrowserRouter>
      <Routes>
        <Route index path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/budget/:uid' element={<ExpensesPage/>}/>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App