import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";

enum StatusType {
  LOAD = 'load',
  SUCCESS = 'success',
  ERROR = 'error',
}

interface IDataImport {
  id: string;
  createdAt: string;
  status: StatusType;
  message?: string;
}

interface ApiResponse {
  data: IDataImport[];
  count: number;
}

export const DataImport: React.FC = () => {
  const [dataImports, setDataImports] = useState<IDataImport[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataImportsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fetchDataImports = async () => {
    setDataImports([]);
    try {
      const response = await axios.get<ApiResponse>("http://localhost:3001/data-import", {
        params: {
          take: dataImportsPerPage,
          skip: (currentPage - 1) * dataImportsPerPage,
        },
      });

      const { data, count } = response.data;
      setDataImports(data);
      setTotalCount(count);
    } catch (error) {
      console.error("Error retrieving data imports:", error);
    }
  };
  useEffect(() => {
    

    fetchDataImports();
  }, [currentPage, dataImportsPerPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if(file)
    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://localhost:3001/transactions/import", formData);
      console.log("File upload successful:", response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }

    handleModalClose();
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get("http://localhost:3001/transactions/template", {
        responseType: "blob",
      });

      // Cria um URL temporário para o arquivo baixado
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Cria um elemento de link âncora
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "file.xlsx");
      document.body.appendChild(link);

      // Clique automático no link para iniciar o download
      link.click();

      // Remove o link após o download
      document.body.removeChild(link);

      // Revoga o URL para liberar recursos do navegador
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const updateTable = () => {
    fetchDataImports();
  }

  return (
    <div className="container-flex">
   
    <div className="container-data-import">
    <button className="add-button" onClick={handleModalOpen}>
        Importar dados
      </button>
    <button className="add-button" onClick={handleDownload}>
      Baixar template
    </button>
    <button className="add-button" onClick={updateTable }>
      Atualizar tabela
    </button>
      <div className="table-responsive">
        <table className="data-import-table">
          <thead>
            <tr>
              <th>id</th>
              <th>Criado em</th>
              <th>Status</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {dataImports.map((dataImport, index) => (
              <tr key={index}>
                <td>{dataImport.id}</td>
                <td>{dataImport.createdAt}</td>
                <td>{dataImport.status}</td>
                <td>{dataImport.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>Total data imports: {totalCount}</span>
        <ul>
          {Array.from({ length: Math.ceil(totalCount / dataImportsPerPage) }, (_, index) => (
            <li
              key={index}
              className={currentPage === index + 1 ? "active" : ""}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </li>
          ))}
        </ul>
      </div>

     

      {isModalOpen && (
        <div className="modal-container">
          <div className="modal-content">
            <input type="file" onChange={handleFileSelect} />
            <button onClick={handleFileUpload}>Upload</button>
            <button onClick={handleModalClose}>Cancel</button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};
