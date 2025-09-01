import React from 'react';
import TaskLibrary from '../components/Task/TaskLibrary.jsx';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const LibraryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Zaloguj się, aby zobaczyć swoją bibliotekę</h1>
        <button
          onClick={() => navigate('/login')}
          className="bg-[#69DC9E] text-black px-6 py-2 rounded-full hover:bg-[#5bc78d] transition-colors"
        >
          Zaloguj się
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-[#F5F5F5] bg-opacity-80 py-8">
        <div className="max-w-[80%] mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Twoja Biblioteka</h1>
            <button
              onClick={() => navigate('/add-task-collection')}
              className="flex items-center gap-2 bg-[#69DC9E] text-black px-4 py-2 rounded-full hover:bg-[#5bc78d] transition-colors"
            >
              <Plus size={20} />
              Dodaj nowy zbiór zadań
            </button>
          </div>
          <p className="text-gray-600">
            Tutaj znajdziesz wszystkie swoje zbiory zadań oraz te, do których się zapisałeś
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-[75%] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-[25px] p-6 shadow-lg border-2 border-[#69DC9E]">
            <h3 className="text-lg font-semibold mb-2">Zadania w toku</h3>
            <p className="text-3xl font-bold text-[#69DC9E]">0</p>
          </div>
          <div className="bg-white rounded-[25px] p-6 shadow-lg border-2 border-[#69DC9E]">
            <h3 className="text-lg font-semibold mb-2">Ukończone zbiory</h3>
            <p className="text-3xl font-bold text-[#69DC9E]">0</p>
          </div>
          <div className="bg-white rounded-[25px] p-6 shadow-lg border-2 border-[#69DC9E]">
            <h3 className="text-lg font-semibold mb-2">Średni postęp</h3>
            <p className="text-3xl font-bold text-[#69DC9E]">0%</p>
          </div>
        </div>

        {/* Task Library Component */}
        <TaskLibrary />
      </div>
    </div>
  );
};

export default LibraryPage;