import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rocket, Leaf, ShieldCheck, Users, Globe, Radar } from "lucide-react";

const sliderImages = [
  "https://genuinocloud.com/wp-content/uploads/2021/11/Screenshot-from-2021-11-02-09-23-10.png",
  "https://transporte.mx/wp-content/uploads/2016/10/img_3650.jpg",
  "https://tse1.mm.bing.net/th?id=OIP.yfUcyEOfRmrjPl939JNsfgHaE8&pid=Api&P=0&h=180",
];

export const Nosotros = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white font-sans">
      {/* Slider principal */}
      <div className="relative w-full h-[80vh] overflow-hidden">
        <img
          src={sliderImages[currentIndex]}
          alt="Imagen de dron"
          className="w-full h-full object-cover transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            className="text-white text-6xl font-extrabold uppercase tracking-wide"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
          >
            Aviren
          </motion.h1>
          <motion.p
            className="text-gray-300 mt-4 text-lg max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Revolucionando las entregas con drones inteligentes, sustentables y
            autónomos.
          </motion.p>
        </div>

        {/* Indicadores */}
        <div className="absolute bottom-4 w-full flex justify-center gap-2">
          {sliderImages.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === currentIndex ? "bg-white" : "bg-gray-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-8 py-24 space-y-24">
        {/* ¿Por qué nace? */}
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-white">
            ¿Por qué nace Aviren?
          </h2>
          <p className="text-lg text-gray-300">
            Aviren surge como una solución frente a los problemas de lentitud,
            ineficiencia y contaminación presentes en los métodos de entrega
            tradicionales. Al emplear drones eléctricos con algoritmos de
            optimización, reducimos tiempos de entrega y disminuimos la huella
            de carbono. Nuestro objetivo es transformar la logística en ciudades
            modernas como Tehuacán.
          </p>
        </motion.section>

        {/* Beneficios visuales */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition">
            <Rocket className="mx-auto text-cyan-400" size={48} />
            <h3 className="text-xl font-semibold mt-4">Entrega Rápida</h3>
            <p className="text-gray-300 mt-2">
              Drones autónomos que entregan en minutos, sin tráfico ni demoras.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition">
            <Leaf className="mx-auto text-green-400" size={48} />
            <h3 className="text-xl font-semibold mt-4">100% Ecológico</h3>
            <p className="text-gray-300 mt-2">
              Energía eléctrica, sin emisiones, para un planeta más limpio.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition">
            <ShieldCheck className="mx-auto text-yellow-400" size={48} />
            <h3 className="text-xl font-semibold mt-4">Seguro y Confiable</h3>
            <p className="text-gray-300 mt-2">
              Monitoreo en tiempo real, rutas optimizadas y entregas aseguradas.
            </p>
          </div>
        </motion.section>

        {/* Público objetivo */}
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-white">
            ¿A quién va dirigido?
          </h2>
          <p className="text-lg text-gray-300">
            Nuestro servicio está pensado para negocios locales como
            restaurantes, farmacias y tiendas de abarrotes, así como plataformas
            de e-commerce y usuarios particulares. Nos enfocamos en la ciudad de
            Tehuacán y sus alrededores, llevando tecnología accesible a
            comunidades que desean modernizar sus entregas.
          </p>
        </motion.section>

        {/* Valores adicionales */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition">
            <Globe className="mx-auto text-blue-400" size={48} />
            <h3 className="text-xl font-semibold mt-4">Tecnología Global</h3>
            <p className="text-gray-300 mt-2">
              Usamos tecnología de punta con estándares internacionales.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition">
            <Users className="mx-auto text-pink-400" size={48} />
            <h3 className="text-xl font-semibold mt-4">Cercanía Humana</h3>
            <p className="text-gray-300 mt-2">
              Acompañamos a nuestros clientes con soporte amigable y rápido.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition">
            <Radar className="mx-auto text-orange-400" size={48} />
            <h3 className="text-xl font-semibold mt-4">Precisión GPS</h3>
            <p className="text-gray-300 mt-2">
              Navegación milimétrica gracias a sensores y posicionamiento
              avanzado.
            </p>
          </div>
        </motion.section>

        {/* Video tutorial */}
        <motion.section
          className="space-y-6 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-semibold text-white">
            ¿Te interesa saber cómo funciona?
          </h2>
          <p className="text-gray-400">
            Mira este breve tutorial para conocer cómo funciona nuestra
            aplicación de entregas.
          </p>
          <div className="flex justify-center mt-4">
            <div className="w-full max-w-3xl aspect-video rounded-lg overflow-hidden shadow-xl">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/52SZtIDrKgw"
                title="Tutorial Aviren"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};
