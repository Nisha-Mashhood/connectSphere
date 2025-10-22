interface ButtonProps {
  label: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
}

const Button: React.FC<ButtonProps> = ({ label, type = "button", disabled, onClick }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full block bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 text-white font-semibold rounded-lg px-4 py-3 mt-6 disabled:opacity-50"
    >
      {disabled ? "Loading..." : label}
    </button>
  );
};

export default Button;