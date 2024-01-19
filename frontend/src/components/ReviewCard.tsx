import React from 'react';

interface Review {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  review_text?: string;
}

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-4 hover:bg-gray-100">
      <p className="text-sm text-gray-600">Review ID: {review.id}</p>
      <p className="text-sm text-gray-600">Book ID: {review.book_id}</p>
      <p className="text-sm text-gray-600">User ID: {review.user_id}</p>
      <p className="text-lg font-semibold text-gray-800">Rating: {review.rating}</p>
      {review.review_text && <p className="text-md text-gray-700">Review: {review.review_text}</p>}
    </div>
  );
};

export default ReviewCard;
