

import * as React from 'react';

interface AddReviewFormProps {
    productId: number;
    onAddReview: (productId: number, rating: number, comment: string) => void;
    addToast: (message: string, type: 'success' | 'error') => void;
}

const AddReviewForm: React.FC<AddReviewFormProps> = ({ productId, onAddReview, addToast }) => {
    const [rating, setRating] = React.useState(0);
    const [comment, setComment] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || comment.trim() === '') {
            addToast("Please provide a rating and a comment.", "error");
            return;
        }
        onAddReview(productId, rating, comment);
        setRating(0);
        setComment('');
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Write a Review</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                    <div className="rating">
                        {/* The inputs are in reverse order to make the CSS :hover ~ label selector work correctly with float:right */}
                        <input id="star5" name="rating" type="radio" value="5" checked={rating === 5} onChange={() => setRating(5)} /><label htmlFor="star5" title="5 stars"></label>
                        <input id="star4" name="rating" type="radio" value="4" checked={rating === 4} onChange={() => setRating(4)} /><label htmlFor="star4" title="4 stars"></label>
                        <input id="star3" name="rating" type="radio" value="3" checked={rating === 3} onChange={() => setRating(3)} /><label htmlFor="star3" title="3 stars"></label>
                        <input id="star2" name="rating" type="radio" value="2" checked={rating === 2} onChange={() => setRating(2)} /><label htmlFor="star2" title="2 stars"></label>
                        <input id="star1" name="rating" type="radio" value="1" checked={rating === 1} onChange={() => setRating(1)} /><label htmlFor="star1" title="1 star"></label>
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                    <textarea
                        id="comment"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-2 bg-white text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Share your thoughts on this product..."
                        required
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-md hover:bg-yellow-500 transition-colors"
                >
                    Submit Review
                </button>
            </form>
        </div>
    );
};

export default AddReviewForm;