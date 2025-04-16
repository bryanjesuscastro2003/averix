import React from 'react';
import { FiAward, FiKey, FiShield, FiDownloadCloud, FiCopy } from 'react-icons/fi';

interface CertificateData {
  certificateArn: string;
  certificateId: string;
  certificatePem: string;
  certificateS3Path: string;
  createdAt: string;
  id: string;
  privateKey: string;
  publicKey: string;
  thing: string;
  timestamp: string;
  updatedAt: string;
}

interface DroneCertificateCardProps {
  certificate: CertificateData;
}

export const DroneCertificateCard: React.FC<DroneCertificateCardProps> = ({ certificate }) => {
  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Función para copiar al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías añadir un toast notification
  };

  // Función para extraer el nombre corto del certificado
  const getShortCertId = (arn: string) => {
    const parts = arn.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div className="max-w-md rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200">
      {/* Encabezado */}
      <div className="px-6 py-4 bg-blue-50 border-b flex items-center">
        <FiAward className="text-blue-600 text-xl mr-3" />
        <div>
          <h2 className="text-xl font-bold text-gray-800">Certificados IoT</h2>
          <p className="text-sm text-gray-600">Instancia: {certificate.thing}</p>
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Información principal */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <FiShield className="text-green-500 mr-2" />
              <span className="font-medium">Certificado AWS IoT</span>
            </div>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Activo
            </span>
          </div>

          <div className="pl-8 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">ARN</p>
              <div className="flex items-center group">
                <p className="text-sm font-mono truncate">{certificate.certificateArn}</p>
                <button 
                  onClick={() => copyToClipboard(certificate.certificateArn)}
                  className="ml-2 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiCopy size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">ID Certificado</p>
                <p className="text-sm font-mono truncate">{getShortCertId(certificate.certificateArn)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Creado</p>
                <p className="text-sm">{formatDate(certificate.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Archivos de certificados */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <FiKey className="mr-2" /> Archivos de Seguridad
          </h3>

          <div className="space-y-2 pl-8">
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium">Certificado PEM</p>
                <p className="text-xs text-gray-500 truncate">{certificate.certificatePem}</p>
              </div>
              <button className="text-blue-500 hover:text-blue-700">
                <FiDownloadCloud size={16} />
              </button>
            </div>

            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium">Clave Privada</p>
                <p className="text-xs text-gray-500 truncate">{certificate.privateKey}</p>
              </div>
              <button className="text-blue-500 hover:text-blue-700">
                <FiDownloadCloud size={16} />
              </button>
            </div>

            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium">Clave Pública</p>
                <p className="text-xs text-gray-500 truncate">{certificate.publicKey}</p>
              </div>
              <button className="text-blue-500 hover:text-blue-700">
                <FiDownloadCloud size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Ubicación en S3 */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Ubicación en S3</h3>
          <div className="flex items-center">
            <span className="text-xs font-mono bg-gray-100 p-2 rounded truncate flex-1">
              {certificate.certificateS3Path}
            </span>
            <button
             
              onClick={() => copyToClipboard(certificate.certificateS3Path)}
              className="ml-2 text-gray-500 hover:text-blue-500 p-1"
            >
              <FiCopy size={14} />
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>ID de Credencial:</span>
            <span className="font-mono">{certificate.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Última actualización:</span>
            <span>{formatDate(certificate.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

