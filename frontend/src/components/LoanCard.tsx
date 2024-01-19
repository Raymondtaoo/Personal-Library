import React from 'react';

interface Loan {
  id: number;
  user_id: number;
  book_id: number;
  checkout_date: string;
  due_date: string;
  return_date?: string;
}

const LoanCard: React.FC<{ loan: Loan }> = ({ loan }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-4 hover:bg-gray-100">
      <p className="text-gray-600">Loan ID: {loan.id}</p>
      <p className="text-gray-600">User ID: {loan.user_id}</p>
      <p className="text-gray-600">Book ID: {loan.book_id}</p>
      <p className="text-md text-gray-700">Checkout Date: {loan.checkout_date}</p>
      <p className="text-md text-gray-700">Due Date: {loan.due_date}</p>
      {loan.return_date && <p className="text-md text-gray-700">Return Date: {loan.return_date}</p>}
    </div>
  );
};

export default LoanCard;
