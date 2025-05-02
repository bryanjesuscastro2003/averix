import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  const images = [
    "https://wallpapercave.com/wp/wp1896575.jpg",
    "https://wallpapercave.com/wp/wp1896537.jpg",
    "https://pedroponcemarketing.com/wp-content/uploads/2023/09/imagend40b57e8337cda1f2a1706ebbf9ca1c8.jpg",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Slider a pantalla completa */}
      <div className="absolute inset-0 transition-opacity duration-1000">
        <img
          src={images[currentImageIndex]}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contenido del dashboard con fondo transparente */}
      <div className="relative z-10 flex items-center justify-center h-full p-6">
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-xl p-10 max-w-md w-full text-center border border-white border-opacity-20">
          <div className="mb-8">
            <div className="bg-[#072146] bg-opacity-90 text-white font-bold text-2xl px-4 py-2 rounded-sm inline-block">
              OLI<span className="text-[#00a0d2]">VIA</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#00a0d2] mb-4 drop-shadow-md">
            Panel de Control
          </h1>
          <p className="text-black text-opacity-90 mb-8 drop-shadow-md">
            Bienvenido a su panel de entregas con drones
          </p>

          <div className="space-y-4">
            <Link
              to="/dashboard/deliveries"
              className="block w-full py-3 px-4 bg-[#00a0d2] bg-opacity-90 text-white font-medium rounded-sm hover:bg-[#0088b8] transition-colors">
              Historial de Viajes
            </Link>
            <Link
              to="/nosotros"
              className="block w-full py-3 px-4 bg-[#00a0d2] bg-opacity-90 text-white font-medium rounded-sm hover:bg-[#0088b8] transition-colors">
              Sobre Nosotros
            </Link>
            <Link
              to="/colaboradores"
              className="block w-full py-3 px-4 bg-[#00a0d2] bg-opacity-90 text-white font-medium rounded-sm hover:bg-[#0088b8] transition-colors relative">
              Ver Colaboradores
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                6
              </span>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white border-opacity-20">
            <p className="text-sm text-black text-opacity-70 drop-shadow-md">
              SISTEMA DE GESTION DE ENTREGAS CON DRONES
            </p>
          </div>
        </div>
      </div>

      {/* Indicadores del slider */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full ${
              currentImageIndex === index
                ? "bg-white"
                : "bg-white bg-opacity-50"
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
