import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import axios from 'axios';
import LoanCard from '../components/LoanCard';

interface Loan {
  id: number;
  user_id: number;
  book_id: number;
  checkout_date: string;
  due_date: string;
  return_date?: string;
}

const Loans: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const [loans, setLoans] = useState<Loan[]>([]);
  const [newLoan, setNewLoan] = useState({ user_id: '', book_id: '', checkout_date: '', due_date: '' });
  const [updateLoan, setUpdateLoan] = useState({ id: '', user_id: '', book_id: '', checkout_date: '', due_date: '', return_date: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/rust/loans`);
        setLoans(response.data.reverse());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [apiUrl]);

  const createLoan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formattedLoan = {
      ...newLoan,
      user_id: parseInt(newLoan.user_id),
      book_id: parseInt(newLoan.book_id),
    };
    try {
      const response = await axios.post(`${apiUrl}/api/rust/loans`, formattedLoan);
      setLoans([response.data, ...loans]);
      setNewLoan({ user_id: '', book_id: '', checkout_date: '', due_date: '' });
    } catch (error) {
      console.error('Error creating loan:', error);
    }
  };

  const handleUpdateLoan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updatedLoan = {
      user_id: parseInt(updateLoan.user_id),
      book_id: parseInt(updateLoan.book_id),
      checkout_date: updateLoan.checkout_date,
      due_date: updateLoan.due_date,
      return_date: updateLoan.return_date 
    };
    try {
      await axios.put(`${apiUrl}/api/rust/loans/${updateLoan.id}`, updatedLoan);
      setUpdateLoan({ id: '', user_id: '', book_id: '', checkout_date: '', due_date: '', return_date: '' });
      setLoans(
        loans.map((loan) => {
          if (loan.id === parseInt(updateLoan.id)) {
            return { ...loan, ...updatedLoan };
          }
          return loan;
        })
      );
    } catch (error) {
      console.error('Error updating loan:', error);
    }
  };

  const deleteLoan = async (loanId: number) => {
    try {
      await axios.delete(`${apiUrl}/api/rust/loans/${loanId}`);
      setLoans(loans.filter((loan) => loan.id !== loanId));
    } catch (error) {
      console.error('Error deleting loan:', error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <NavBar />
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mt-10">Loan Management</h1>
      
      {/* Form to add new loan */}
      <form onSubmit={createLoan} className="mb-6 p-4 bg-blue-100 rounded shadow mt-10">
        <input
          type="text"
          placeholder="User ID"
          className="mb-2 w-full p-2 border border-gray-300 rounded"
          value={newLoan.user_id}
          onChange={(e) => setNewLoan({ ...newLoan, user_id: e.target.value })}
        />
        <input
          type="text"
          placeholder="Book ID"
          className="mb-2 w-full p-2 border border-gray-300 rounded"
          value={newLoan.book_id}
          onChange={(e) => setNewLoan({ ...newLoan, book_id: e.target.value })}
        />
        <input
          type="date"
          placeholder="Checkout Date"
          className="mb-2 w-full p-2 border border-gray-300 rounded"
          value={newLoan.checkout_date}
          onChange={(e) => setNewLoan({ ...newLoan, checkout_date: e.target.value })}
        />
        <input
          type="date"
          placeholder="Due Date"
          className="mb-2 w-full p-2 border border-gray-300 rounded"
          value={newLoan.due_date}
          onChange={(e) => setNewLoan({ ...newLoan, due_date: e.target.value })}
        />
        <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
          Add Loan
        </button>
      </form>

      {/* Form to update loan */}
      <form onSubmit={handleUpdateLoan} className="mb-6 p-4 bg-green-100 rounded shadow">
        <input
          type="text"
          placeholder="Loan ID"
          className="mb-2 w-full p-2 border border-gray-300 rounded"
          value={updateLoan.id}
          onChange={(e) => setUpdateLoan({ ...updateLoan, id: e.target.value })}
        />
        <input
          type="text"
          placeholder="User ID"
          className="mb-2 w-full p-2 border border-gray-300 rounded"
          value={updateLoan.user_id}
          onChange={(e) => setUpdateLoan({ ...updateLoan, user_id: e.target.value })}
        />
        <input
          type="text"
          placeholder="Book ID"
          className="mb-2 w-full p-2 border border-gray-300 rounded"
          value={updateLoan.book_id}
          onChange={(e) => setUpdateLoan({ ...updateLoan, book_id: e.target.value })}
        />
        <input
          type="date"
          placeholder="Checkout Date"
          className="mb-2 w-full p-2 border border-gray-300 rounded"
          value={updateLoan.checkout_date}
          onChange={(e) => setUpdateLoan({ ...updateLoan, checkout_date: e.target.value })}
        />
        <input
          type="date"
          placeholder="Due Date"
          className="mb-2 w-full p-2 border border-gray-300 rounded"
          value={updateLoan.due_date}
          onChange={(e) => setUpdateLoan({ ...updateLoan, due_date: e.target.value })}
        />
        <input
          type="date"
          placeholder="Return Date"
          className="mb-2 w-full p-2 border border-gray-300 rounded"
          value={updateLoan.return_date}
          onChange={(e) => setUpdateLoan({ ...updateLoan, return_date: e.target.value })}
        />
        <button type="submit" className="w-full p-2 text-white bg-green-500 rounded hover:bg-green-600">
          Update Loan
        </button>
      </form>

      {/* Display loans */}
      <div className="mt-10">
        <h2 className="text-3xl font-semibold text-center">Current Loans</h2>
        <div className="mt-6">
          {loans.map(loan => (
            <div key={loan.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-4 hover:bg-gray-100">
              <LoanCard loan={loan} />
              <button onClick={() => deleteLoan(loan.id)} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
                Delete Loan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};

export default Loans;
