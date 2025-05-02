import React from "react";
import { useAuth } from "../../context/AuthContext";

interface Colaborador {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  departamento: string;
  fechaIngreso: string;
  telefono: string;
  direccion: string;
  skills: string[];
  proyectos: number;
  foto: string;
}

export const Colaboradores: React.FC = () => {
  // Datos completos de 6 colaboradores con fotos
  const listaColaboradores: Colaborador[] = [
    {
      id: 1,
      nombre: "jiovana de Castro Coello",
      email: "ajiovana@empresa.com",
      rol: "contador Publico",
      departamento: "Tecnología",
      fechaIngreso: "15/03/2020",
      telefono: "+1 555-123-4567",
      direccion: "Av. Principal 123, Ciudad",
      skills: ["React", "TypeScript", "UI/UX"],
      proyectos: 12,
      foto: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 2,
      nombre: "jesus bryan grezz garcia ",
      email: "carlos.rodriguez@empresa.com",
      rol: "Ingeniero de DevOps",
      departamento: "Operaciones",
      fechaIngreso: "22/07/2019",
      telefono: "+1 555-234-5678",
      direccion: "Calle Secundaria 456, Ciudad",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      proyectos: 8,
      foto: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 3,
      nombre: "christian campos cortes ",
      email: "060104.@empresa.com",
      rol: "desarrollador frontend",
      departamento: "Producto",
      fechaIngreso: "10/01/2021",
      telefono: "+1 555-345-6789",
      direccion: "Boulevard Norte 789, Ciudad",
      skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
      proyectos: 15,
      foto: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      id: 4,
      nombre: "jesus emanuel de mondragon",
      email: "jesusemanuel@empresa.com",
      rol: "Project Manager",
      departamento: "Gestión",
      fechaIngreso: "05/11/2018",
      telefono: "+1 555-456-7890",
      direccion: "Plaza Central 101, Ciudad",
      skills: ["Scrum", "Agile", "Jira", "Leadership"],
      proyectos: 22,
      foto: "https://randomuser.me/api/portraits/men/75.jpg",
    },
    {
      id: 5,
      nombre: "Sofía González",
      email: "sofia.gonzalez@empresa.com",
      rol: "Desarrolladora Backend",
      departamento: "Tecnología",
      fechaIngreso: "30/05/2022",
      telefono: "+1 555-567-8901",
      direccion: "Avenida Sur 202, Ciudad",
      skills: ["Node.js", "Python", "SQL", "APIs"],
      proyectos: 6,
      foto: "https://randomuser.me/api/portraits/women/90.jpg",
    },
    {
      id: 6,
      nombre: "David López",
      email: "david.lopez@empresa.com",
      rol: "Analista de Datos Senior",
      departamento: "Business Intelligence",
      fechaIngreso: "14/09/2021",
      telefono: "+1 555-678-9012",
      direccion: "Calle Este 303, Ciudad",
      skills: ["SQL", "Power BI", "Machine Learning", "Big Data"],
      proyectos: 9,
      foto: "https://randomuser.me/api/portraits/men/22.jpg",
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
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
                    Dirección:
                  </span>
                  <p>{colaborador.direccion}</p>
                </div>

                <div>
                  <span className="text-sm font-semibold text-gray-500">
                    Fecha de Ingreso:
                  </span>
                  <p>{colaborador.fechaIngreso}</p>
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
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
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

//export default Colaboradores;
