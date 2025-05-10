import React from "react";
import { Facebook, Twitter, Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-8 flex flex-col items-center">
        {/* Información de contacto y derechos */}
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold">Aviren</h3>
          <p className="mt-2 text-lg text-gray-400">
            Revolucionando las entregas con drones. <br />
            Tehuacán, Puebla, México.
          </p>
        </div>

        {/* Enlaces */}
        <div className="mb-6 space-x-8 text-center">
          <a
            href="#"
            className="text-gray-400 hover:text-white transition duration-300"
          >
            Política de Privacidad
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-white transition duration-300"
          >
            Términos y Condiciones
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-white transition duration-300"
          >
            Soporte
          </a>
        </div>

        {/* Redes sociales */}
        <div className="flex space-x-6 mb-6">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition duration-300"
          >
            <Facebook size={32} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition duration-300"
          >
            <Twitter size={32} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition duration-300"
          >
            <Instagram size={32} />
          </a>
        </div>

        {/* Derechos */}
        <p className="text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Aviren. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
};
