import React from 'react';

interface User {
  id: number; 
  name: string;
  email: string;
}

const UserCard: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-2 mb-2 hover:bg-gray-100">
      <div className="text-sm text-gray-600">ID: {user.id}</div>
      <div className="text-lg font-semibold text-gray-800">{user.name}</div>
      <div className="text-md text-gray-700">{user.email}</div>
    </div>
  );
};

export default UserCard;