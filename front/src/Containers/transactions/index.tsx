import React, { useEffect, useState } from "react";
import "./style.css";
import axios from "axios";

interface Transaction {
  type: string;
  value: number;
  cpf: string;
  timeOfOccurrence: string;
  card: string;
  shopOwner: string;
  shopName: string;
}

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    setTransactions([]);
      try {
        const response = await axios.get("http://localhost:3001/transactions", {
          params: {
            take: transactionsPerPage, // Número de registros a serem retornados
            skip: (currentPage -1) * 10, // Número de registros a serem ignorados
          },
        });
        
        const { data, count } = response.data;
        console.log(data)

        setTransactions((oldData) => data);
        setTotalCount(count);
      } catch (error) {
        console.error("Erro ao obter as transações:", error);
      }
    };


  useEffect(() => {
    
    fetchData();
  }, [currentPage, transactionsPerPage]);

  // Função para mudar a página atual
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const updateTable = () => {
    fetchData();
  }

  return (
    <div className="container-transaction">
            <button className="add-button" onClick={updateTable }>
      Atualizar tabela
    </button>
      <div className="table-responsive">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Valor</th>
              <th>CPF</th>
              <th>Data da ocorrencia</th>
              <th>Numero do cartão</th>
              <th>Dono da loja</th>
              <th>Nome da loja</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.type}</td>
                <td>{transaction.value}</td>
                <td>{transaction.cpf}</td>
                <td>{transaction.timeOfOccurrence}</td>
                <td>{transaction.card}</td>
                <td>{transaction.shopOwner}</td>
                <td>{transaction.shopName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>Total de transações: {totalCount}</span>
        <ul>
          {Array.from({ length: Math.ceil(totalCount / transactionsPerPage) }, (_, index) => (
            <li key={index} onClick={() => paginate(index + 1)} className={currentPage === index + 1 ? "active" : ""}>
              {index + 1}
            </li>
          ))}
        </ul>
      </div>


    </div>
  );
};

