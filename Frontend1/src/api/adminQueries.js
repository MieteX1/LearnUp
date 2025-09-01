import { useQuery,} from '@tanstack/react-query';
import axios from 'axios';

// Admin-specific queries
export const useModeratorsList = () => {
  return useQuery({
    queryKey: ['moderators'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/api/user');
      return data.filter(user => user.role === 'moderator');
    }
  });
};

export const useCollectionTypesList = () => {
  return useQuery({
    queryKey: ['collectionTypes'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/api/collection-type');
      return data;
    }
  });
};

export const useComplaintsList = () => {
  return useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const [collections, comments, users] = await Promise.all([
        axios.get('http://localhost:3000/api/collection-complaint/'),
        axios.get('http://localhost:3000/api/comment-complaint/'),
        axios.get('http://localhost:3000/api/user-complaint/')
      ]);

      return {
        collections: collections.data,
        comments: comments.data,
        users: users.data
      };
    }
  });
};

export const useUsersList = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/api/user');
      return data;
    }
  });
};

export const useUnverifiedUsers = () => {
  return useQuery({
    queryKey: ['unverifiedUsers'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/api/user/unverified');
      return data;
    }
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/api/user/all-users-total-times');
      return data;
    }
  });
};