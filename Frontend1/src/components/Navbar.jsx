import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {Menu, X, Plus, LogOut, User, Gem, Users, Bell, LibraryBig, ChartArea, Shield, Settings} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [collectionTypes, setCollectionTypes] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCollectionTypes = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/collection-type");
        setCollectionTypes(response.data);
      } catch (err) {
        console.error("Error fetching collection types:", err);
      }
    };
  
    fetchCollectionTypes();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
  setIsMobileMenuOpen(false);
  setIsDropdownOpen(false);
  setIsUserMenuOpen(false);
}, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef, userMenuRef]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search-task-collection/${searchQuery}`);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 w-full bg-[#50B97E] shadow-md z-50 ">
      <nav className="mx-auto px-4 py-6 max-w-full  min-[1140px]:w-[80%]">
        <div className="flex items-center justify-between">
          {/* Logo section */}
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="">
              <img src="/images/logo.svg" alt="LearnUp" className="h-10 w-auto"/>
            </Link>
            {/* Left side icons */}
            <div className="hidden md:flex items-center justify-center ml-2">
              {user && windowWidth >= 920 && (
                <>
                  <Link to="/premium" className="hover:bg-[#69DC9E]/20 p-2 rounded-full">
                    <Gem size={24} strokeWidth={1} />
                  </Link>
                  <Link to="/community" className="hover:bg-[#69DC9E]/20 p-2 rounded-full">
                    <Users size={24} />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 hover:bg-[#69DC9E]/20 rounded-full"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>

          {/* Center section with search */}
          <div className="hidden md:flex items-center flex-grow justify-center mx-6">
            {user && (
              <>
                <Link to="/add-task-collection" className="hover:bg-[#69DC9E]/20 p-2 rounded-full mr-5">
                  <Plus size={24} />
                </Link>
                <div className="flex items-center bg-[#F5F5F5] rounded-full px-4 py-2 w-full max-w-2xl">
                  <button onClick={handleSearch}>
                    <img src="/images/search.svg" alt="Search" className="w-6 h-6 cursor-pointer"/>
                  </button>
                  <input
                    type="text"
                    placeholder="Wyszukaj zbiór zadań"
                    className="flex-1 bg-transparent border-none focus:outline-none px-3"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleDropdown}
                      className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                      Kategorie
                      <img
                        src="/images/arrow_down.svg"
                        alt="Arrow"
                        className={`w-3 h-3 ml-1 transition-transform ${
                          isDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isDropdownOpen && (
                      <ul className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-1 z-50">
                        {collectionTypes.length > 0 ? (
                          collectionTypes.map((type) => (
                            <li
                              key={type.id}
                              className="px-4 py-2 hover:bg-[#69DC9E]/70 cursor-pointer"
                            >
                              {type.name}
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-2 text-gray-500">Brak kategorii</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
                <Link to="/ranking" className="hover:bg-[#69DC9E]/20 p-2 rounded-full ml-5">
                  <ChartArea  alt="Ranking" className="w-6 h-6"/>
                </Link>
              </>
            )}
          </div>

          {/* Right section with user menu */}
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {windowWidth >= 920 && (
                <Link to="/notifications" className="hover:bg-[#69DC9E]/20 p-2 rounded-full">
                  <Bell size={24}/>
                </Link>
              )}
              <Link to="/library" className="hover:bg-[#69DC9E]/20 p-2 rounded-full">
                <LibraryBig size={24}/>
              </Link>
              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="rounded-full hover:bg-[#69DC9E]/20 p-2"
                >
                {user?.profile_picture ? (
                    <img
                        src={user?.avatar_id
                            ? `http://localhost:3000/api/uploads/${user.avatar_id}`
                            : (user?.profile_picture)}
                        alt="avatar"
                        className="w-6 y-6 rounded-full aspect-square object-cover my-auto"
                    />
                ) : (
                    <User size={24}/>
                )}
                </button>
                {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                      {windowWidth < 920 && (
                          <>
                            <Link to="/premium" className="flex items-center gap-2 px-4 py-2 hover:bg-[#69DC9E]/70">
                          <Gem size={18} strokeWidth={1} />
                          Premium
                        </Link>
                        <Link to="/notifications" className="flex items-center gap-2 px-4 py-2 hover:bg-[#69DC9E]/70">
                          <Bell size={18} />
                          Powiadomienia
                        </Link>
                      </>
                    )}
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-[#69DC9E]/70">
                      <User size={18} />
                      Profil
                    </Link>
                    <Link to="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-[#69DC9E]/70">
                      <Settings size={18} />
                      Ustawienia
                    </Link>
                    {(user?.role === 'admin' || user?.role === 'moderator') && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-[#69DC9E]/70"
                      >
                        <Shield min-size={18} />
                        Panel Administracyjny
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-[#69DC9E]/70 flex items-center gap-2"
                    >
                      <LogOut size={18}/>
                      Wyloguj się
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block text-lg font-customFont font-bold">
              Zaloguj się
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            {/* Mobile Search */}
            {user && (
              <div className="bg-[#F5F5F5] rounded-full px-4 py-2 mb-4">
                <div className="flex items-center">
                  <img src="/images/search.svg" alt="Search" className="w-6 h-6"/>
                  <input
                    type="text"
                    placeholder="Wyszukaj zbiór zadań"
                    className="flex-1 bg-transparent border-none focus:outline-none px-3"
                  />
                </div>
              </div>
            )}

            {/* Mobile Menu Items */}
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  {/* Quick access grid */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <Link to="/premium" className="flex flex-col items-center p-2 hover:bg-[#69DC9E]/20 rounded-lg">
                      <Gem size={24} />
                      <span className="text-xs mt-1 truncate w-full text-center">Premium</span>
                    </Link>
                    <Link to="/community" className="flex flex-col items-center p-2 hover:bg-[#69DC9E]/20 rounded-lg">
                      <Users size={24} />
                      <span className="text-xs mt-1 truncate w-full text-center">Społeczność</span>
                    </Link>
                    <Link to="/notifications" className="flex flex-col items-center p-2 hover:bg-[#69DC9E]/20 rounded-lg">
                      <Bell size={24} />
                      <span className="text-xs mt-1 truncate w-full text-center">Powiadomienia</span>
                    </Link>
                    <Link to="/library" className="flex flex-col items-center p-2 hover:bg-[#69DC9E]/20 rounded-lg">
                      <LibraryBig size={24} />
                      <span className="text-xs mt-1 truncate w-full text-center">Biblioteka</span>
                    </Link>
                  </div>

                  {/* Categories dropdown */}
                  {/*
                  <button
                    onClick={toggleDropdown}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#69DC9E]/20 rounded-lg"
                  >
                    <span>Kategorie</span>
                    <img
                      src="/images/arrow_down.svg"
                      alt="Arrow"
                      className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isDropdownOpen && (
                    <ul className="bg-white rounded-lg shadow-lg py-1 mt-2">
                      <li className="px-4 py-2 hover:bg-[#69DC9E]/70 cursor-pointer">Matematyka</li>
                      <li className="px-4 py-2 hover:bg-[#69DC9E]/70 cursor-pointer">Informatyka</li>
                      <li className="px-4 py-2 hover:bg-[#69DC9E]/70 cursor-pointer">Fizyka</li>
                      <li className="px-4 py-2 hover:bg-[#69DC9E]/70 cursor-pointer">Chemia</li>
                    </ul>
                  )}
              /*}
                  {/* Other menu items */}
                  <Link to="/add-task-collection" className="flex items-center px-4 py-2 hover:bg-[#69DC9E]/20 rounded-lg">
                    <Plus size={20} className="mr-2 flex-shrink-0" />
                    <span className="truncate">Dodaj zbiór zadań</span>
                  </Link>
                  <Link to="/ranking" className="flex items-center px-4 py-2 hover:bg-[#69DC9E]/20 rounded-lg">
                    <ChartArea  alt="Ranking" className="w-5 h-5 mr-2 flex-shrink-0"/>
                    <span className="truncate">Ranking</span>
                  </Link>
                  <Link to="/profile" className="flex items-center px-4 py-2 hover:bg-[#69DC9E]/20 rounded-lg">
                    <User size={20} className="mr-2 flex-shrink-0" />
                    <span className="truncate">Profil</span>
                  </Link>
                  <Link to="/settings" className="flex items-center px-4 py-2 hover:bg-[#69DC9E]/20 rounded-lg">
                    <Settings size={20} className="mr-2 flex-shrink-0" />
                    <span className="truncate">Ustawienia</span>
                  </Link>
                  {(user?.role === 'admin' || user?.role === 'moderator') && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-[#69DC9E]/70"
                      >
                        <Shield size={20} />
                        Panel Administracyjny
                      </Link>
                    )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 hover:bg-[#69DC9E]/20 rounded-lg text-left"
                  >
                    <LogOut size={20} className="mr-2 flex-shrink-0" />
                    <span className="truncate">Wyloguj się</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center justify-center px-4 py-2 bg-[#69DC9E]/20 rounded-lg font-customFont">
                  Zaloguj się
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;