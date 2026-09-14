import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

interface SearchFormProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  buttonText?: string;
}

export const SearchForm: React.FC<SearchFormProps> = ({ 
  onSearch, 
  placeholder = 'Search...', 
  buttonText = 'Search' 
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      <div className="flex-grow">
        <Input 
          id="search-input"
          label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="mb-0"
        />
      </div>
      <div className="mt-[28px]">
        <Button type="submit">{buttonText}</Button>
      </div>
    </form>
  );
};
