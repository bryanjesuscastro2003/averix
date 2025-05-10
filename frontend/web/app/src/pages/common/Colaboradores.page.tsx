import React from "react";

interface Colaborador {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  departamento: string;
  telefono: string;
  skills: string[];
  proyectos: number;
  foto: string;
}

export const Colaboradores: React.FC = () => {
  // Datos completos de 6 colaboradores con fotos
  const listaColaboradores: Colaborador[] = [
    {
      id: 1,
      nombre: "Jiovana",
      email: "ajiovana@empresa.com",
      rol: "Contador Publico",
      departamento: "Gestion",

      telefono: "+1 555-123-4567",

      skills: ["Administracion"],
      proyectos: 1,
      foto: "/images/conta.jpeg",
    },
    {
      id: 2,
      nombre: "Bryan Jesus Castro Coello ",
      email: "Bryanjesuss@gmail.com.com",
      rol: " DevOps",
      departamento: "Tecnologia",

      telefono: "+1 555-234-5678",

      skills: ["DEVOPS"],
      proyectos: 8,
      foto: "/images/bryan3.jpeg",
    },
    {
      id: 3,
      nombre: "Christian Campos Cortes ",
      email: "060104.@empresa.com",
      rol: "Desarrollador Frontend",
      departamento: "Tecnologia",

      telefono: "+1 555-345-6789",

      skills: ["Desarrollador Frontend"],
      proyectos: 15,
      foto: "/images/chris.jpeg",
    },
    {
      id: 4,
      nombre: "Jesus Emanuel Grez Garcia ",
      email: "jesusemanuel@empresa.com",
      rol: "Desarrollador Frontend",
      departamento: "Tecnologia",

      telefono: "+1 555-456-7890",

      skills: ["Desarrollador Frontend"],
      proyectos: 22,
      foto: "/images/grezz.jpeg",
    },
    {
      id: 5,
      nombre: "Diego Mondragon Montes ",
      email: "diego.lopez@empresa.com",
      rol: "Desarrollador Backend",
      departamento: "Tecnología",

      telefono: "+1 555-567-8901",

      skills: ["Electronica"],
      proyectos: 6,
      foto: "/images/diego.jpeg",
    },
    {
      id: 6,
      nombre: "Adrian Abraham Sánchez",
      email: "Adrian.zanchez@empresa.com",
      rol: "DevOps",
      departamento: "Tecnologia",

      telefono: "+1 555-678-9012",

      skills: ["OPS"],
      proyectos: 9,
      foto: "/images/adrian.jpeg ",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Directorio de Colaboradores
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listaColaboradores.map((colaborador) => (
          <div
            key={colaborador.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <img
                  src={colaborador.foto}
                  alt={colaborador.nombre}
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-200 mr-4"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {colaborador.nombre}
                  </h2>
                  <p className="text-blue-600 font-medium">{colaborador.rol}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-gray-500">
                    Departamento:
                  </span>
                  <p>{colaborador.departamento}</p>
                </div>

                <div>
                  <span className="text-sm font-semibold text-gray-500">
                    Contacto:
                  </span>
                  <p className="text-blue-600">{colaborador.email}</p>
                  <p>{colaborador.telefono}</p>
                </div>

                <div>
                  <span className="text-sm font-semibold text-gray-500">
                    Proyectos:
                  </span>
                  <p>{colaborador.proyectos} completados</p>
                </div>

                <div>
                  <span className="text-sm font-semibold text-gray-500">
                    Habilidades:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {colaborador.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
