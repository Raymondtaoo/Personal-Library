import React from 'react';

interface Book {
  id: number;
  title: string;
  author: string;
  genre?: string;
}

const BookCard: React.FC<{ book: Book }> = ({ book }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-2 mb-2 hover:bg-gray-100">
      <div className="text-sm text-gray-600">ID: {book.id}</div>
      <div className="text-lg font-semibold text-gray-800">{book.title}</div>
      <div className="text-md text-gray-700">Author: {book.author}</div>
      {book.genre && <div className="text-md text-gray-700">Genre: {book.genre}</div>}
    </div>
  );
};

export default BookCard;
