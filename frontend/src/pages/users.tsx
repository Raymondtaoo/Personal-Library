import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import axios from 'axios';
import UserCard from '../components/UserCard';

interface User {
  id: number;
  name: string;
  email: string;
}

const Users: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [updateUser, setUpdateUser] = useState({ id: '', name: '', email: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/rust/users`);
        setUsers(response.data.reverse());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [apiUrl]);

  const createUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/rust/users`, newUser);
      setUsers([response.data, ...users]);
      setNewUser({ name: '', email: '' });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/api/rust/users/${updateUser.id}`, { name: updateUser.name, email: updateUser.email });
      setUpdateUser({ id: '', name: '', email: '' });
      setUsers(
        users.map((user) => {
          if (user.id === parseInt(updateUser.id)) {
            return { ...user, name: updateUser.name, email: updateUser.email };
          }
          return user;
        })
      );
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      await axios.delete(`${apiUrl}/api/rust/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <NavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-gray-800 text-center mt-10">User Management</h1>
        
        {/* Form to add new user */}
        <form onSubmit={createUser} className="mb-6 p-4 bg-blue-100 rounded shadow mt-10">
          <input
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="mb-2 w-full p-2 border border-gray-300 rounded"
          />
          <input
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="mb-2 w-full p-2 border border-gray-300 rounded"
          />
          <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
            Add User
          </button>
        </form>

        {/* Form to update user */}
        <form onSubmit={handleUpdateUser} className="mb-6 p-4 bg-green-100 rounded shadow">
          <input
            placeholder="User ID"
            value={updateUser.id}
            onChange={(e) => setUpdateUser({ ...updateUser, id: e.target.value })}
            className="mb-2 w-full p-2 border border-gray-300 rounded"
          />
          <input
            placeholder="New Name"
            value={updateUser.name}
            onChange={(e) => setUpdateUser({ ...updateUser, name: e.target.value })}
            className="mb-2 w-full p-2 border border-gray-300 rounded"
          />
          <input
            placeholder="New Email"
            value={updateUser.email}
            onChange={(e) => setUpdateUser({ ...updateUser, email: e.target.value })}
            className="mb-2 w-full p-2 border border-gray-300 rounded"
          />
          <button type="submit" className="w-full p-2 text-white bg-green-500 rounded hover:bg-green-600">
            Update User
          </button>
        </form>

        {/* Display users */}
        <div className="mt-10">
          <h2 className="text-3xl font-semibold text-gray-700 text-center">Our Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {users.map(user => (
              <div key={user.id} className="bg-white p-4 rounded-lg shadow hover:bg-gray-200">
                <UserCard user={user} />
                <button onClick={() => deleteUser(user.id)} className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
                  Delete User
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
