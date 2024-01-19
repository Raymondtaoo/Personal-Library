import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import axios from "axios";
import BookCard from "../components/BookCard";

interface Book {
  id: number;
  title: string;
  author: string;
  genre?: string;
}

const Books: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const [books, setBooks] = useState<Book[]>([]);
  const [newBook, setNewBook] = useState({ title: "", author: "", genre: "" });
  const [updateBook, setUpdateBook] = useState({
    id: "",
    title: "",
    author: "",
    genre: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/rust/books`);
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [apiUrl]);

  const createBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/rust/books`, newBook);
      setBooks([response.data, ...books]);
      setNewBook({ title: "", author: "", genre: "" });
    } catch (error) {
      console.error("Error creating book:", error);
    }
  };

  const handleUpdateBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/api/rust/books/${updateBook.id}`, {
        title: updateBook.title,
        author: updateBook.author,
        genre: updateBook.genre,
      });
      setUpdateBook({ id: "", title: "", author: "", genre: "" });
      setBooks(
        books.map((book) => {
          if (book.id === parseInt(updateBook.id)) {
            return {
              ...book,
              title: updateBook.title,
              author: updateBook.author,
              genre: updateBook.genre,
            };
          }
          return book;
        })
      );
    } catch (error) {
      console.error("Error updating book:", error);
    }
  };

  const deleteBook = async (bookId: number) => {
    try {
      await axios.delete(`${apiUrl}/api/rust/books/${bookId}`);
      setBooks(books.filter((book) => book.id !== bookId));
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <NavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-gray-800 text-center mt-10">
          Book Management
        </h1>
        {/* Form to add new book */}
        <form onSubmit={createBook} className="mb-6 p-4 bg-blue-100 rounded shadow mt-10">
            <input
            placeholder="Title"
            type="text"
            value={newBook.title}
            onChange={(e) =>
              setNewBook({ ...newBook, title: e.target.value })
            }
            className="mb-2 w-full p-2 border border-gray-300 rounded"
            />
            <input
            placeholder="Author"
            type="text"
            value={newBook.author}
            onChange={(e) =>
              setNewBook({ ...newBook, author: e.target.value })
            }
            className="mb-2 w-full p-2 border border-gray-300 rounded"
            />
            <input
            placeholder="Genre"
            type="text"
            value={newBook.genre}
            onChange={(e) =>
              setNewBook({ ...newBook, genre: e.target.value })
            }
            className="mb-2 w-full p-2 border border-gray-300 rounded"
            />
            <button
            type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
            Add Book
            </button>
        </form>
        {/* Form to update book */}
        <form onSubmit={handleUpdateBook} className="mb-6 p-4 bg-green-100 rounded shadow">
            <input
            placeholder="Book ID"
            type="text"
            value={updateBook.id}
            onChange={(e) =>
                setUpdateBook({ ...updateBook, id: e.target.value })
            }
            className="mb-2 w-full p-2 border border-gray-300 rounded"
            />
            <input
            placeholder="New Title"
            type="text"
            value={updateBook.title}
            onChange={(e) =>
                setUpdateBook({ ...updateBook, title: e.target.value })
            }
            className="mb-2 w-full p-2 border border-gray-300 rounded"
            />
            <input
            placeholder="New Author"
            type="text"
            value={updateBook.author}
            onChange={(e) =>
                setUpdateBook({ ...updateBook, author: e.target.value })
            }
            className="mb-2 w-full p-2 border border-gray-300 rounded"
            />
            <input
            placeholder="New Genre"
            type="text"
            value={updateBook.genre}
            onChange={(e) =>
                setUpdateBook({ ...updateBook, genre: e.target.value })
            }
            className="mb-2 w-full p-2 border border-gray-300 rounded"
            />
            <button
            type="submit" className="w-full p-2 text-white bg-green-500 rounded hover:bg-green-600">
            Update Book
            </button>
        </form>

        {/* Display books */}
        <div className="mt-10">
          <h2 className="text-3xl font-semibold text-gray-700 text-center">
            Our Book Collection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white p-4 rounded-lg shadow hover:bg-gray-200"
              >
                <BookCard book={book} />
                <button
                  onClick={() => deleteBook(book.id)}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                >
                  Delete Book
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Books;
