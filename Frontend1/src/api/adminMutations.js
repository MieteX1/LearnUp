import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';



// Admin mutations with optimistic updates
export const useCreateModerator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const { data } = await axios.post('http://localhost:3000/api/user', {
        ...userData,
        role: 'moderator'
      });
      return data;
    },
    onMutate: async (newModerator) => {
      await queryClient.cancelQueries(['moderators']);
      const previousModerators = queryClient.getQueryData(['moderators']);

      const tempModerator = {
        ...newModerator,
        id: 'temp-' + Date.now(),
        role: 'moderator',
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      };

      queryClient.setQueryData(['moderators'], old => [...(old || []), tempModerator]);

      return { previousModerators };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['moderators'], context.previousModerators);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['moderators'], old =>
        old?.map(mod => mod.id.startsWith('temp-') ? data : mod)
      );
    }
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }) => {
      const { data } = await axios.put(`http://localhost:3000/api/user/${userId}`, { role });
      return data;
    },
    onMutate: async ({ userId, role }) => {
      await queryClient.cancelQueries(['users']);
      await queryClient.cancelQueries(['moderators']);

      const previousData = {
        users: queryClient.getQueryData(['users']),
        moderators: queryClient.getQueryData(['moderators'])
      };

      // Update users list
      queryClient.setQueryData(['users'], old =>
        old?.map(user => user.id === userId ? { ...user, role } : user)
      );

      // Update moderators list
      if (role === 'moderator') {
        const user = previousData.users?.find(u => u.id === userId);
        if (user) {
          queryClient.setQueryData(['moderators'], old => [...(old || []), { ...user, role }]);
        }
      } else {
        queryClient.setQueryData(['moderators'], old =>
          old?.filter(mod => mod.id !== userId)
        );
      }

      return previousData;
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['users'], context.previousData.users);
      queryClient.setQueryData(['moderators'], context.previousData.moderators);
    }
  });
};

export const useCreateCollectionType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (typeData) => {
      const { data } = await axios.post('http://localhost:3000/api/collection-type', typeData);
      return data;
    },
    onMutate: async (newType) => {
      // Anuluj trwające zapytania
      await queryClient.cancelQueries(['collectionTypes']);

      // Zachowaj poprzedni stan
      const previousTypes = queryClient.getQueryData(['collectionTypes']);

      // Stwórz tymczasowy typ z ID
      const tempType = {
        ...newType,
        id: 'temp-' + Date.now(),
        created_at: new Date().toISOString()
      };

      // Optymistycznie dodaj nowy typ do cache
      queryClient.setQueryData(['collectionTypes'], old => [...(old || []), tempType]);

      return { previousTypes };
    },
    onError: (error, variables, context) => {
      // W przypadku błędu przywróć poprzedni stan
      if (context?.previousTypes) {
        queryClient.setQueryData(['collectionTypes'], context.previousTypes);
      }
      console.error('Error creating collection type:', error);
    },
    onSuccess: (data) => {
      // Po sukcesie zaktualizuj cache rzeczywistymi danymi
      queryClient.setQueryData(['collectionTypes'], old => {
        if (!old) return [data];
        // Zamień tymczasowy typ na rzeczywisty
        return old.map(type =>
          type.id.toString().startsWith('temp-') ? data : type
        );
      });
    },
  });
};


export const useUpdateCollectionType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...typeData }) => {
      const { data } = await axios.patch(`http://localhost:3000/api/collection-type/${id}`, typeData);
      return data;
    },
    onMutate: async ({ id, ...update }) => {
      await queryClient.cancelQueries(['collectionTypes']);
      const previousTypes = queryClient.getQueryData(['collectionTypes']);

      queryClient.setQueryData(['collectionTypes'], old =>
        old?.map(type => type.id === id ? { ...type, ...update } : type)
      );

      return { previousTypes };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['collectionTypes'], context.previousTypes);
    }
  });
};

export const useDeleteCollectionType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (typeId) => {
      await axios.delete(`http://localhost:3000/api/collection-type/${typeId}`);
    },
    onMutate: async (typeId) => {
      await queryClient.cancelQueries(['collectionTypes']);
      const previousTypes = queryClient.getQueryData(['collectionTypes']);

      queryClient.setQueryData(['collectionTypes'], old =>
        old?.filter(type => type.id !== typeId)
      );

      return { previousTypes };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['collectionTypes'], context.previousTypes);
    }
  });
};
export const useAdminDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      await axios.patch(`http://localhost:3000/api/user/admin-delete/${userId}`);
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries(['users']);
      await queryClient.cancelQueries(['moderators']);
      const previousData = {
        users: queryClient.getQueryData(['users']),
        moderators: queryClient.getQueryData(['moderators'])
      };

      // Optimistically remove user from both lists
      queryClient.setQueryData(['users'], old =>
        old?.filter(user => user.id !== userId)
      );
      queryClient.setQueryData(['moderators'], old =>
        old?.filter(mod => mod.id !== userId)
      );

      return { previousData };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['users'], context.previousData.users);
      queryClient.setQueryData(['moderators'], context.previousData.moderators);
    }
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      await axios.post(`http://localhost:3000/api/user/ban/${userId}`);
    },
    onMutate: async (userId) => {
      // Anuluj trwające zapytania
      await Promise.all([
        queryClient.cancelQueries(['users']),
        queryClient.cancelQueries(['moderators'])
      ]);

      // Zachowaj poprzedni stan
      const previousData = {
        users: queryClient.getQueryData(['users']),
        moderators: queryClient.getQueryData(['moderators'])
      };

      // Optymistycznie zaktualizuj obie listy
      queryClient.setQueryData(['users'], old => {
        if (!old) return [];
        return old.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              ban_date: new Date().toISOString()
            };
          }
          return user;
        });
      });

      queryClient.setQueryData(['moderators'], old => {
        if (!old) return [];
        return old.map(mod => {
          if (mod.id === userId) {
            return {
              ...mod,
              ban_date: new Date().toISOString()
            };
          }
          return mod;
        });
      });

      return { previousData };
    },
    onError: (_, __, context) => {
      // W przypadku błędu przywróć poprzedni stan
      queryClient.setQueryData(['users'], context.previousData.users);
      queryClient.setQueryData(['moderators'], context.previousData.moderators);
    },
  });
};

export const useUnBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      await axios.post(`http://localhost:3000/api/user/unban/${userId}`);
    },
    onMutate: async (userId) => {
      // Anuluj trwające zapytania
      await Promise.all([
        queryClient.cancelQueries(['users']),
        queryClient.cancelQueries(['moderators'])
      ]);

      // Zachowaj poprzedni stan
      const previousData = {
        users: queryClient.getQueryData(['users']),
        moderators: queryClient.getQueryData(['moderators'])
      };

      // Optymistycznie zaktualizuj obie listy
      queryClient.setQueryData(['users'], old => {
        if (!old) return [];
        return old.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              ban_date: null
            };
          }
          return user;
        });
      });

      queryClient.setQueryData(['moderators'], old => {
        if (!old) return [];
        return old.map(mod => {
          if (mod.id === userId) {
            return {
              ...mod,
              ban_date: null
            };
          }
          return mod;
        });
      });

      return { previousData };
    },
    onError: (_, __, context) => {
      // W przypadku błędu przywróć poprzedni stan
      queryClient.setQueryData(['users'], context.previousData.users);
      queryClient.setQueryData(['moderators'], context.previousData.moderators);
    },

  });
};

export const useResolveComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, id }) => {
      await axios.patch(`http://localhost:3000/api/${type}-complaint/${id}`);
    },
    onMutate: async ({ type, id }) => {
      await queryClient.cancelQueries(['complaints']);
      const previousComplaints = queryClient.getQueryData(['complaints']);

      if (previousComplaints) {
        const typeToKey = {
          'collection': 'collections',
          'comment': 'comments',
          'user': 'users'
        };

        const key = typeToKey[type];
        if (key) {
          queryClient.setQueryData(['complaints'], {
            ...previousComplaints,
            [key]: previousComplaints[key]?.map(complaint =>
              complaint.id === id
                ? { ...complaint, solved_at: new Date().toISOString() }
                : complaint
            )
          });
        }
      }

      return { previousComplaints };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['complaints'], context.previousComplaints);
    }
  });
};
export const useSendVerificationEmail = () => {
  return useMutation({
    mutationFn: async (userEmail) => {
      await axios.post('http://localhost:3000/api/auth/resending-verification-email-as-moderator', {
        userEmail
      });
    }
  });
};