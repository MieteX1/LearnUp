import React, { useState } from 'react';

const CommentForm = ({ onSubmit, initialValue = '', buttonText = 'Skomentuj', onCancel = null }) => {
    const [content, setContent] = useState(initialValue);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(content);
        setContent('');
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border rounded-lg mb-2 bg-gray-50 resize-none"
                placeholder="Napisz komentarz..."
                rows="3"
            />
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="px-4 py-1 bg-[#F9CB40] hover:bg-[#E1B83A] text-black rounded-full text-sm"
                >
                    {buttonText}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-sm"
                    >
                        Anuluj
                    </button>
                )}
            </div>
        </form>
    );
};

export default CommentForm;