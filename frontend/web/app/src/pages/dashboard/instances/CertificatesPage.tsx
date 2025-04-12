import { CertificatesActionsTable } from "../../../components/grez/instances/CertificatesActionsTable";

export const CertificatesPage = () => {
  // Datos de ejemplo
  const certificatesData = [
    {
      id: "cert-001",
      timestamp: new Date().toISOString(),
      thing: "sensor-temperatura-01",
      certificateS3Psh: "s3://bucket/cert1.pem",
      certificateAm: "arn:aws:iot:us-east-1:123456789012:cert/xyz123",
      certificateId: "iot-cert-xyz123",
      publicKey: "-----BEGIN PUBLIC KEY-----...",
      privateKey: "-----BEGIN PRIVATE KEY-----...",
      certificatePem: "-----BEGIN CERTIFICATE-----...",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "cert-002",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // Ayer
      thing: "actuador-ventilador-02",
      certificateS3Psh: "s3://bucket/cert2.pem",
      certificateAm: "arn:aws:iot:us-east-1:123456789012:cert/abc456",
      certificateId: "iot-cert-abc456",
      publicKey: "-----BEGIN PUBLIC KEY-----...",
      privateKey: "-----BEGIN PRIVATE KEY-----...",
      certificatePem: "-----BEGIN CERTIFICATE-----...",
      createdAt: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  return <CertificatesActionsTable data={certificatesData} />;
};