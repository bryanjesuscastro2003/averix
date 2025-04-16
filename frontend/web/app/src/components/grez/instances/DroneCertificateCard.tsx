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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getShortCertId = (arn: string) => {
    const parts = arn.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-md border border-gray-200 p-4 transition-transform hover:scale-[1.01]">
      <div className="flex items-center gap-3 mb-4">
        <FiAward className="text-blue-500 text-xl" />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Certificados IoT</h2>
          <p className="text-sm text-gray-500">Instancia: {certificate.thing}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
          <FiShield className="text-green-500" />
          Certificado AWS IoT
        </div>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Activo</span>
      </div>

      <div className="text-sm text-gray-700 space-y-2 mb-4">
        <div className="group">
          <p className="text-xs text-gray-500">ARN</p>
          <div className="flex items-center">
            <span className="font-mono text-xs truncate">{certificate.certificateArn}</span>
            <button 
              onClick={() => copyToClipboard(certificate.certificateArn)}
              className="ml-2 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiCopy size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">ID Certificado</p>
            <p className="font-mono text-xs truncate">{getShortCertId(certificate.certificateArn)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Creado</p>
            <p>{formatDate(certificate.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <FiKey /> Archivos de Seguridad
        </h3>
        <div className="space-y-2">
          {[
            { label: 'Certificado PEM', value: certificate.certificatePem },
            { label: 'Clave Privada', value: certificate.privateKey },
            { label: 'Clave Pública', value: certificate.publicKey },
          ].map(({ label, value }, i) => (
            <div key={i} className="flex justify-between items-start bg-gray-50 px-3 py-2 rounded">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-gray-500 truncate">{value}</p>
              </div>
              <button className="text-blue-500 hover:text-blue-700">
                <FiDownloadCloud size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Ubicación en S3</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded truncate flex-1">
            {certificate.certificateS3Path}
          </span>
          <button
            onClick={() => copyToClipboard(certificate.certificateS3Path)}
            className="text-gray-500 hover:text-blue-500"
          >
            <FiCopy size={14} />
          </button>
        </div>
      </div>

      <div className="border-t pt-3 text-xs text-gray-500 space-y-1">
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
  );
};
