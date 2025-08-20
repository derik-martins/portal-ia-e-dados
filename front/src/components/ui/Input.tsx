import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="relative mb-6">
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-white border-2 rounded-lg transition-all duration-200 outline-none ${
          isFocused || value ? 'border-[#39FF14]' : 'border-gray-200'
        } ${isPassword ? 'pr-12' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
      />
      
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          isFocused || value
            ? 'top-1 text-xs text-[#39FF14] font-medium'
            : 'top-3 text-base text-gray-500'
        }`}
      >
        {label}
      </label>

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-500 hover:text-black transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
};

export default Input;