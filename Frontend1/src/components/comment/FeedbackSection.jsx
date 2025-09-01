import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import Comment from './Comment.jsx';
import CommentForm from './CommentForm.jsx';
import ReportCommentPopup from '../Reports/ReportComment.jsx';
import {useAlert} from "../ui/Alert.jsx";
import DefaultPopup from "../ui/DefaultPopup.jsx";



const FeedbackSection = ({ collectionId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const {addAlert} = useAlert();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // Fetch comments query
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', collectionId],
    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:3000/api/evaluation/collection/${collectionId}`
      );
      return organizeComments(response.data);
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content) => {
      return axios.post('http://localhost:3000/api/evaluation', {
        user_id: user.id,
        collection_id: parseInt(collectionId),
        comment: content
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', collectionId]);
      addAlert('Komentarz został dodany', 'success');
    }
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ parentId, content }) => {
      return axios.post('http://localhost:3000/api/evaluation', {
        user_id: user.id,
        collection_id: parseInt(collectionId),
        comment: content,
        answer: parentId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', collectionId]);
        addAlert('Odpowiedź została dodana', 'success');
    }
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ evaluationId, isPositive }) => {
        /// Find comment in both root comments and replies
        const findComment = (comments, targetId) => {
            for (const comment of comments) {
                if (comment.comment_id === targetId) {
                    return comment;
                }
                if (comment.replies) {
                    const found = comment.replies.find(reply => reply.comment_id === targetId);
                    if (found) return found;
                }
            }
            return null;
        };

        const comment = findComment(comments, evaluationId);
        if (!comment) {
            throw new Error('Nie znaleziono komentarza');
        }

        if ((isPositive && comment.user_liked) || (!isPositive && comment.user_disliked)) {
            throw new Error('Już zagłosowałeś na ten komentarz');
        }

        return axios.post('http://localhost:3000/api/evaluation-value', {
            evaluation_id: evaluationId,
            evaluator_id: user.id,
            is_positive: isPositive
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['comments', collectionId]);
        addAlert('Głos został oddany', 'success');
    },
    onError: (error) => {
        if (error.message === 'Już zagłosowałeś na ten komentarz') {
            addAlert('Już zagłosowałeś na ten komentarz', 'error');
        } else {
            addAlert('Wystąpił błąd podczas głosowania', 'error');
        }
    }
});

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: async ({ commentId, newContent }) => {
      return axios.patch(
        `http://localhost:3000/api/evaluation/${commentId}`,
        { comment: newContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', collectionId]);
      addAlert('Komentarz został zaktualizowany', 'success');
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      return axios.delete(
        `http://localhost:3000/api/evaluation/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', collectionId]);
    }
  });

  // Organize comments into a hierarchy
  const organizeComments = (commentsData) => {
    const commentMap = new Map();
    const rootComments = [];

   commentsData.forEach(comment => {
    comment.replies = [];
    comment.user = {
      login: comment.author_login,
      profile_picture: comment.author_avatar_id ? `http://localhost:3000/api/uploads/${comment.author_avatar_id}` : comment.author_profile_picture,
      role: 'user'
    };
    commentMap.set(comment.comment_id, comment);
  });
    commentsData.forEach(comment => {
      if (comment.parent_id === null) {
        rootComments.push(comment);
      } else {
        const parentComment = commentMap.get(comment.root_id);
        if (parentComment) {
          if (!parentComment.replies) {
            parentComment.replies = [];
          }
          parentComment.replies.push(comment);
        }
      }
    });

    return rootComments.sort((a, b) => Number(b.points) - Number(a.points));
  };

  // Handlers
  const handleSubmitFeedback = async (content) => {
    if (!user) {
      addAlert('Musisz być zalogowany, aby dodać komentarz.', 'error');
      return;
    }

    try {
      await addCommentMutation.mutateAsync(content);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      addAlert('Wystąpił błąd podczas wysyłania komentarza.', 'error');
    }
  };

  const handleReply = async (parentId, replyContent) => {
    if (!user) return;

    try {
      await replyMutation.mutateAsync({ parentId, content: replyContent });
    } catch (err) {
      console.error('Error submitting reply:', err);
      addAlert('Wystąpił błąd podczas wysyłania odpowiedzi.', 'error');
    }
  };

  const handleVote = async (evaluationId, isPositive) => {
    if (!user) {
      addAlert('Musisz być zalogowany, aby głosować.', 'error');
      return;
    }

    try {
      await voteMutation.mutateAsync({ evaluationId, isPositive });
    } catch (err) {
      console.error('Error submitting vote:', err);
      addAlert('Wystąpił błąd podczas głosowania.', 'error');
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      await editCommentMutation.mutateAsync({ commentId, newContent });
      return true;
    } catch (error) {
      console.error('Error editing comment:', error);
      return false;
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentToDelete(commentId);
    addAlert('Czy na pewno chcesz usunąć ten komentarz?', 'warning');
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCommentMutation.mutateAsync(commentToDelete);
      setShowDeleteConfirm(false);
      setCommentToDelete(null);
      addAlert('Komentarz został usunięty', 'success');
      return true;
    } catch (error) {
      addAlert('Wystąpił błąd podczas usuwania komentarza.', 'error');
      console.error('Error deleting comment:', error);
      return false;
    }
  };


  const handleReportClick = (commentId) => {
    setSelectedCommentId(commentId);
    setShowReportPopup(true);
  };

  if (isLoading) {
    return (
      <div className="w-2/3 mx-auto mt-12 p-6 border-[3px] border-gray-300 rounded-[25px] bg-white bg-opacity-80">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#69DC9E]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:w-2/3 w-[95%] mx-auto mt-12 p-6 border-[3px] border-gray-300 rounded-[25px] bg-white bg-opacity-80">
      <h2 className="text-2xl font-bold mb-4 text-center">Komentarze</h2>

      <div className="mb-8">
        <CommentForm
          onSubmit={handleSubmitFeedback}
          isSubmitting={addCommentMutation.isPending}
        />
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <Comment
            key={comment.comment_id}
            feedback={{
              ...comment,
              onEditComment: handleEditComment,
              onDeleteComment: handleDeleteComment,
              onReport: handleReportClick
            }}
            onReply={handleReply}
            onVote={handleVote}
            replies={comment.replies.map(reply => ({
              ...reply,
              onEditComment: handleEditComment,
              onDeleteComment: handleDeleteComment,
              onReport: handleReportClick
            }))}
            depth={0}
          />
        ))}
      </div>

      {showReportPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ReportCommentPopup
            onClose={() => setShowReportPopup(false)}
            evaluationId={selectedCommentId}
          />
        </div>
      )}
     <DefaultPopup
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCommentToDelete(null);
        }}
        title="Potwierdź usunięcie"
        actions={
          <>
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setCommentToDelete(null);
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full"
            >
              Anuluj
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
            >
              Usuń
            </button>
          </>
        }
      >
        <p className="text-center">Czy na pewno chcesz usunąć ten komentarz?</p>
        <p className="text-center text-gray-500 mt-2">Tej akcji nie można cofnąć.</p>
      </DefaultPopup>
    </div>

  );
};

export default FeedbackSection;