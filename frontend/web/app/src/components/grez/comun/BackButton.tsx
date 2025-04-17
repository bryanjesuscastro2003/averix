import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; // Puedes usar cualquier icono que prefieras

interface BackButtonProps {
  className?: string;
  text?: string;
}

export const BackButton = ({ className = '', text = 'Volver' }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Esto navegará a la página anterior en el historial
  };

  return (
    <button
      onClick={handleGoBack}
      className={`flex items-center gap-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors ${className}`}
    >
      <FaArrowLeft className="inline" />
      <span>{text}</span>
    </button>
  );
};

