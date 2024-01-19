import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';

interface Review {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  review_text?: string;
}

const Reviews: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ book_id: '', user_id: '', rating: '', review_text: '' });
  const [updateReview, setUpdateReview] = useState({ id: '', book_id: '', user_id: '', rating: '', review_text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/rust/reviews`);
        setReviews(response.data.reverse());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [apiUrl]);

  const createReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formattedReview = {
      ...newReview,
      book_id: parseInt(newReview.book_id),
      user_id: parseInt(newReview.user_id),
      rating: parseInt(newReview.rating),
    };
    try {
      const response = await axios.post(`${apiUrl}/api/rust/reviews`, formattedReview);
      setReviews([response.data, ...reviews]);
      setNewReview({ book_id: '', user_id: '', rating: '', review_text: '' });
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  const handleUpdateReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updatedReview = {
        id: parseInt(updateReview.id),
      book_id: parseInt(updateReview.book_id),
      user_id: parseInt(updateReview.user_id),
      rating: parseInt(updateReview.rating),
      review_text: updateReview.review_text 
    };
    try {
      await axios.put(`${apiUrl}/api/rust/reviews/${updateReview.id}`, updatedReview);
      setUpdateReview({ id: '', book_id: '', user_id: '', rating: '', review_text: '' });
      setReviews(
        reviews.map((review) => {
          if (review.id === parseInt(updateReview.id)) {
            return { ...review, ...updatedReview };
          }
          return review;
        })
      );
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const deleteReview = async (reviewId: number) => {
    try {
      await axios.delete(`${apiUrl}/api/rust/reviews/${reviewId}`);
      setReviews(reviews.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <NavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-gray-800 text-center mt-10">Review Management</h1>

        {/* Form to add new review */}
        <form onSubmit={createReview} className="mb-6 p-4 bg-blue-100 rounded shadow mt-10">
            <input
                type="text"
                placeholder="Book ID"
                className="block w-full p-3 rounded bg-blue-200 border border-transparent focus:outline-none"
                onChange={(e) => setNewReview({ ...newReview, book_id: e.target.value })}
                value={newReview.book_id}
            />
            <input
                type="text"
                placeholder="User ID"
                className="block w-full p-3 rounded bg-blue-200 border border-transparent focus:outline-none"
                onChange={(e) => setNewReview({ ...newReview, user_id: e.target.value })}
                value={newReview.user_id}
            />
            <input
                type="text"
                placeholder="Rating"
                className="block w-full p-3 rounded bg-blue-200 border border-transparent focus:outline-none"
                onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                value={newReview.rating}
            />
            <input
                type="text"
                placeholder="Review Text"
                className="block w-full p-3 rounded bg-blue-200 border border-transparent focus:outline-none"
                onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
                value={newReview.review_text}
            />
            <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                Add Review
            </button>
        </form>
        
        {/* Form to update review */}
        <form onSubmit={handleUpdateReview} className="mb-6 p-4 bg-green-100 rounded shadow">
            <input
                type="text"
                placeholder="Review ID"
                className="block w-full p-3 rounded bg-green-200 border border-transparent focus:outline-none"
                onChange={(e) => setUpdateReview({ ...updateReview, id: e.target.value })}
                value={updateReview.id}
            />
            <input
                type="text"
                placeholder="Book ID"
                className="block w-full p-3 rounded bg-green-200 border border-transparent focus:outline-none"
                onChange={(e) => setUpdateReview({ ...updateReview, book_id: e.target.value })}
                value={updateReview.book_id}
            />
            <input
                type="text"
                placeholder="User ID"
                className="block w-full p-3 rounded bg-green-200 border border-transparent focus:outline-none"
                onChange={(e) => setUpdateReview({ ...updateReview, user_id: e.target.value })}
                value={updateReview.user_id}
            />
            <input
                type="text"
                placeholder="Rating"
                className="block w-full p-3 rounded bg-green-200 border border-transparent focus:outline-none"
                onChange={(e) => setUpdateReview({ ...updateReview, rating: e.target.value })}
                value={updateReview.rating}
            />
            <input
                type="text"
                placeholder="Review Text"
                className="block w-full p-3 rounded bg-green-200 border border-transparent focus:outline-none"
                onChange={(e) => setUpdateReview({ ...updateReview, review_text: e.target.value })}
                value={updateReview.review_text}
            />
            <button type="submit" className="w-full p-2 text-white bg-green-500 rounded hover:bg-green-600">
                Update Review
            </button>
        </form>

        {/* Display reviews */}
        <div className="mt-10">
          <h2 className="text-3xl font-semibold text-gray-700 text-center">User Reviews</h2>
          <div className="mt-6">
            {reviews.map(review => (
              <div key={review.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-4 hover:bg-gray-100">
                <ReviewCard review={review} />
                <button onClick={() => deleteReview(review.id)} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
                  Delete Review
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
