import React, { useState } from 'react';
import CommentActions from './CommentActions.jsx';
import CommentForm from './CommentForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatRelativeDate } from '../../utils/dateFormatter.js';
import { Link } from 'react-router-dom';


const Comment = ({ feedback, onReply, onVote, replies = [], depth = 0 }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(feedback.comment);
    const { user } = useAuth();
    const maxDepth = 10;

    const handleSubmitReply = (content) => {
        onReply(feedback.comment_id, content);
        setShowReplyForm(false);
    };

    const getPointsColor = (points) => {
        if (points > 0) return 'text-green-500';
        if (points < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    const handleSubmitEdit = async () => {
        const success = await feedback.onEditComment(feedback.comment_id, editedContent);
        if (success) {
            setIsEditing(false);
        }
    };

    // Calculate margin based on depth
    const getMarginClass = () => {
        if (feedback.depth === 0) return '';
        if (feedback.depth === 1) return 'ml-4 sm:ml-8 md:ml-12 lg:ml-16';
        if (feedback.depth === 2) return 'ml-6 sm:ml-12 md:ml-16 lg:ml-24';
        if (feedback.depth === 3) return 'ml-8 sm:ml-16 md:ml-20 lg:ml-32';
        return 'ml-10 sm:ml-20 md:ml-24 lg:ml-40';
    };

    return (
        <>
            <div className="mb-4">
                <div className={`bg-white rounded-lg p-2 sm:p-4 shadow-sm ${getMarginClass()}`}>
                    <div className="flex items-start gap-2">
                        <Link
                            to={`/profile/${feedback.user_id}`}
                            className="hover:opacity-80 transition-opacity flex-shrink-0"
                        >
                            <img
                                src={feedback.user?.profile_picture || "/default-profile.png"}
                                alt="Profile"
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                            />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                <Link
                                    to={`/profile/${feedback.user_id}`}
                                    className="font-semibold hover:underline text-sm sm:text-base"
                                >
                                    {feedback.user?.login || 'Unknown User'}
                                </Link>
                                {!feedback.is_deleted && (
                                    <>
                                        <span className="text-xs sm:text-sm text-gray-500">•</span>
                                        <span className={`${getPointsColor(feedback.points)} font-medium text-xs sm:text-sm`}>
                                            {feedback.points} punktów
                                        </span>
                                    </>
                                )}
                                <span className="text-xs sm:text-sm text-gray-500">•</span>
                                <span className="text-xs sm:text-sm text-gray-500">
                                    {formatRelativeDate(feedback.updated_at)}
                                </span>
                            </div>

                            {isEditing && !feedback.is_deleted ? (
                                <div className="mt-2">
                                    <textarea
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        className="w-full p-2 border rounded-lg mb-2 bg-gray-50 resize-none text-sm sm:text-base"
                                        rows="3"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSubmitEdit}
                                            className="px-3 sm:px-4 py-1 bg-[#F9CB40] hover:bg-[#E1B83A] text-black rounded-full text-xs sm:text-sm"
                                        >
                                            Zapisz
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditedContent(feedback.comment);
                                            }}
                                            className="px-3 sm:px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-xs sm:text-sm"
                                        >
                                            Anuluj
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-800 mt-1 text-sm sm:text-base break-words">
                                    {feedback.is_deleted ? (
                                        <span className="italic text-gray-500">Komentarz został usunięty</span>
                                    ) : (
                                        feedback.comment || 'Brak komentarza'
                                    )}
                                </p>
                            )}

                            {!feedback.is_deleted && (
                                <>
                                    <CommentActions
                                        comment={feedback}
                                        onVote={onVote}
                                        onReply={() => setShowReplyForm(!showReplyForm)}
                                        onReport={feedback.onReport}
                                        onEdit={() => setIsEditing(true)}
                                        onDelete={feedback.onDeleteComment}
                                        maxDepth={maxDepth}
                                        currentDepth={depth}
                                    />

                                    {showReplyForm && user && (
                                        <CommentForm
                                            onSubmit={handleSubmitReply}
                                            buttonText="Odpowiedz"
                                            onCancel={() => setShowReplyForm(false)}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {replies && replies.length > 0 && (
                <div>
                    {replies.map((reply) => (
                        <Comment
                            key={reply.comment_id}
                            feedback={{
                                ...reply,
                                onEditComment: feedback.onEditComment,
                                onDeleteComment: feedback.onDeleteComment,
                                onReport: feedback.onReport
                            }}
                            onReply={onReply}
                            onVote={onVote}
                            replies={reply.replies}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

export default Comment;