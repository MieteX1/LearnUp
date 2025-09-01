import React from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Flag, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const CommentActions = ({ comment, onVote, onReply, onReport, maxDepth, onEdit, onDelete }) => {
    const { user } = useAuth();
    const isOwner = user?.id === comment.user_id;
    const isModerator = user?.role === 'moderator';
    const isAdmin = user?.role === 'admin';
    const canModerate = isModerator || isAdmin;

    if (comment.is_deleted) {
        return null;
    }

    // Common button style classes
    const buttonBaseClasses = "flex items-center gap-1 transition-colors duration-200 p-1 rounded-md";
    const buttonTextClasses = "text-[10px] sm:text-xs hidden sm:inline-block";
    const iconClasses = "w-3 h-3 sm:w-4 sm:h-4";

    // Determine vote button styles based on user's previous votes
    const upvoteClasses = `${buttonBaseClasses} ${
        comment.user_liked 
            ? 'text-green-500 bg-green-50' 
            : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
    }`;

    const downvoteClasses = `${buttonBaseClasses} ${
        comment.user_disliked 
            ? 'text-red-500 bg-red-50' 
            : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
    }`;

    return (
        <div className="flex flex-wrap items-center gap-1 sm:gap-3 mt-2">
            {/* Vote buttons */}
            <button
                onClick={() => onVote(comment.comment_id, true)}
                className={upvoteClasses}
                disabled={comment.user_liked}
            >
                <ThumbsUp className={iconClasses} />
                <span className={buttonTextClasses}>Plus</span>
            </button>

            <button
                onClick={() => onVote(comment.comment_id, false)}
                className={downvoteClasses}
                disabled={comment.user_disliked}
            >
                <ThumbsDown className={iconClasses} />
                <span className={buttonTextClasses}>Minus</span>
            </button>

            {/* Rest of the buttons remain unchanged */}
            {comment.depth < maxDepth && (
                <button
                    onClick={onReply}
                    className={`${buttonBaseClasses} text-gray-500 hover:text-blue-500 hover:bg-blue-50`}
                >
                    <MessageCircle className={iconClasses} />
                    <span className={buttonTextClasses}>Odpowiedź</span>
                </button>
            )}

            {!isOwner && !canModerate && (
                <button
                    onClick={() => onReport(comment.comment_id)}
                    className={`${buttonBaseClasses} text-gray-500 hover:text-red-500 hover:bg-red-50`}
                >
                    <Flag className={iconClasses} />
                    <span className={buttonTextClasses}>Zgłoś</span>
                </button>
            )}

            {isOwner && (
                <>
                    <button
                        onClick={() => onEdit(comment)}
                        className={`${buttonBaseClasses} text-gray-500 hover:text-blue-500 hover:bg-blue-50`}
                    >
                        <Pencil className={iconClasses} />
                        <span className={buttonTextClasses}>Edytuj</span>
                    </button>
                    <button
                        onClick={() => onDelete(comment.comment_id)}
                        className={`${buttonBaseClasses} text-gray-500 hover:text-red-500 hover:bg-red-50`}
                    >
                        <Trash2 className={iconClasses} />
                        <span className={buttonTextClasses}>Usuń</span>
                    </button>
                </>
            )}

            {!isOwner && canModerate && (
                <button
                    onClick={() => onDelete(comment.comment_id)}
                    className={`${buttonBaseClasses} text-red-500 hover:text-red-700 hover:bg-red-50`}
                >
                    <Trash2 className={iconClasses} />
                    <span className={buttonTextClasses}>
                        {`Usuń jako ${isAdmin ? 'admin' : 'moderator'}`}
                    </span>
                </button>
            )}
        </div>
    );
};

export default CommentActions;