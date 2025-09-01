import React from 'react';

const Header = ({ name, setName, typeId, setTypeId, collectionTypes, isPublic, setIsPublic }) => (
    <div className="flex flex-wrap items-center justify-between mt-6 md:mt-8">
        <div className="flex items-center w-full md:w-2/3">
        <label htmlFor="name" className="font-medium mr-2">
            Nazwa zbioru:
        </label>
        <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-2 rounded-3xl bg-[#F5F5F5] px-4 shadow-lg"
        />
        </div>
        <div className="flex items-center w-1/2 md:w-1/5">
        <label htmlFor="typeId" className="font-medium mr-2">
            Typ:
        </label>
        <select
            id="typeId"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className="w-full border-2 rounded-3xl bg-[#F5F5F5] px-4 shadow-lg"
        >
            <option value="" disabled>
            Wybierz typ
            </option>
            {collectionTypes.map((type) => (
            <option key={type.id} value={type.id}>
                {type.name}
            </option>
            ))}
        </select>
        </div>
        <div className="flex items-center w-1/2 md:w-auto">
        <label htmlFor="isPublic" className="font-medium mr-2">
            Publiczny:
        </label>
        <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={() => setIsPublic(!isPublic)}
            className="w-5 h-5"
        />
        </div>
    </div>
);

export default Header;
