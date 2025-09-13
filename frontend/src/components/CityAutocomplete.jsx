import React, { useState, useRef, useEffect } from 'react';
import { CIS_CITIES, getCountryFlag } from '../data/cisCities';

const CityAutocomplete = ({ value, onChange, placeholder, className = '' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length > 1) {
      const filteredSuggestions = CIS_CITIES.filter(city =>
        city.name.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 10);

      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city) => {
    onChange(city.name);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`city-autocomplete ${className}`} ref={inputRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className="city-autocomplete__input"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="city-autocomplete__suggestions">
          {suggestions.map(city => (
            <div
              key={`${city.name}-${city.country}`}
              className="city-autocomplete__suggestion"
              onClick={() => handleSuggestionClick(city)}
            >
              <span className="city-autocomplete__flag">
                {getCountryFlag(city.country)}
              </span>
              <span className="city-autocomplete__name">
                {city.name}
              </span>
              <span className="city-autocomplete__country">
                {city.country}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;