import React, { useState } from "react";
import {
  FiAward,
  FiKey,
  FiShield,
  FiDownloadCloud,
  FiCopy,
} from "react-icons/fi";
import { IInstanceCertificate } from "../../../types/data/IInstance";
import { DashboardEndpoints } from "../../../endpoints/dashboard";
import { Loader } from "../Louder";

interface DroneCertificateCardProps {
  certificate: IInstanceCertificate;
}

export const DroneCertificateCard: React.FC<DroneCertificateCardProps> = ({
  certificate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentDownload, setCurrentDownload] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getShortCertId = (arn: string) => {
    const parts = arn.split("/");
    return parts[parts.length - 1];
  };

  const baseS3Folder = "s3://dronautica/";

  const downloadFromS3 = async (s3Path: string, label: string) => {
    const fullPath = baseS3Folder + s3Path;
    setCurrentDownload(label);
    setIsLoading(true);

    try {
      const response = await fetch(
        DashboardEndpoints.downloadInstanceCredentialsEndpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("idToken"),
          },
          body: JSON.stringify({
            s3Path: fullPath,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || "Failed to download file");
        } catch {
          throw new Error(errorText || "Failed to download file");
        }
      }

      let filename = "download";
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      } else {
        const pathParts = fullPath.split("/");
        filename = pathParts[pathParts.length - 1] || filename;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Download error:", error);
      alert(error || "An error occurred while downloading");
    } finally {
      setIsLoading(false);
      setCurrentDownload(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto sm:max-w-full sm:px-4 md:px-6 lg:px-8 mb-6 border border-gray-600 shadow-md p-4 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-10">
          <Loader />
          {currentDownload && (
            <span className="ml-2 text-white bg-black bg-opacity-70 px-2 py-1 rounded">
              Downloading {currentDownload}...
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <FiAward className="text-blue-500 text-xl" />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Certificados IoT
          </h2>
          <p className="text-sm text-gray-500">
            Instancia: {certificate.thing}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
          <FiShield className="text-green-500" />
          Certificado AWS IoT
        </div>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
          Activo
        </span>
      </div>

      <div className="text-sm text-gray-700 space-y-2 mb-4">
        <div className="group">
          <p className="text-xs text-gray-500">ARN</p>
          <div className="flex items-center">
            <span className="font-mono text-xs truncate">
              {certificate.certificateArn}
            </span>
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
            <p className="font-mono text-xs truncate">
              {getShortCertId(certificate.certificateArn)}
            </p>
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
            { label: "Certificado PEM", value: certificate.certificatePem },
            { label: "Clave Privada", value: certificate.privateKey },
            { label: "Clave Pública", value: certificate.publicKey },
          ].map(({ label, value }, i) => (
            <div
              key={i}
              className="flex justify-between items-start bg-gray-50 px-3 py-2 rounded"
            >
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-gray-500 truncate">{value}</p>
              </div>
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => downloadFromS3(value, label)}
                disabled={isLoading}
              >
                <FiDownloadCloud size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Ubicación en S3
        </h3>
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
