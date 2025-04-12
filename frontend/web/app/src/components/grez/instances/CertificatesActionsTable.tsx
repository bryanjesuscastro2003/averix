import { format } from 'date-fns';

interface CertificateAction {
  id: string;
  timestamp: string;
  thing: string;
  certificateS3Psh: string;
  certificateAm: string;
  certificateId: string;
  publicKey: string;
  privateKey: string;
  certificatePem: string;
  createdAt: string;
  updatedAt: string;
}

export const CertificatesActionsTable = ({ data }: { data: CertificateAction[] }) => {
  return (
    <div className="aviren-container" style={{ marginTop: '40px' }}>
      <div className="aviren-header" style={{ backgroundColor: '#2d3748' }}>
        <h1>AVIREN - Certificados</h1>
        <p>Registro de acciones con certificados</p>
      </div>

      <div className="table-wrapper">
        <table className="instance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Timestamp</th>
              <th>Dispositivo</th>
              <th>Certificado ID</th>
              <th>Clave Pública</th>
              <th>Certificado PEM</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={`${item.id}-${item.timestamp}`}>
                <td className="id-cell">{item.id}</td>
                <td>{format(new Date(item.timestamp), 'dd/MM/yy HH:mm')}</td>
                <td>{item.thing}</td>
                <td>{item.certificateId}</td>
                <td className="truncate" style={{ maxWidth: '120px' }}>
                  {item.publicKey}
                </td>
                <td className="truncate" style={{ maxWidth: '150px' }}>
                  {item.certificatePem}
                </td>
                <td>{format(new Date(item.createdAt), 'dd/MM/yy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};