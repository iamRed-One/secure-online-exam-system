import React, { FC } from "react";

interface InputProps {
  type?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string | number;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
}

const Input: FC<InputProps> = ({
  type = "text", id, name, placeholder, defaultValue, value, onChange,
  className = "", disabled = false, success = false, error = false, hint,
}) => {
  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-white/90 ${className}`;
  if (disabled) inputClasses += " text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800";
  else if (error) inputClasses += " text-red-800 border-red-500 focus:ring-red-500/10";
  else if (success) inputClasses += " text-green-500 border-green-400 focus:ring-green-500/10";
  else inputClasses += " bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90";

  return (
    <div className="relative">
      <input
        type={type} id={id} name={name} placeholder={placeholder}
        defaultValue={defaultValue} value={value} onChange={onChange}
        disabled={disabled} className={inputClasses}
      />
      {hint && <p className={`mt-1.5 text-xs ${error ? "text-red-500" : success ? "text-green-500" : "text-gray-500"}`}>{hint}</p>}
    </div>
  );
};

export default Input;
