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

export const TransactionsByShop: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [shopName, setShopName] = useState("");

  const fetchData = async () => {
    setTransactions([]);
    
    setTotalCount((old) => 0)
      try {
        const response = await axios.get("http://localhost:3001/transactions/byname/"+ shopName, {
  
        });

        const { data } = response;
        setTransactions((oldData) => data);

      
      } catch (error) {
        console.error("Erro ao obter as transações:", error);
      }

     
    };


  useEffect(() => {
    
    fetchData();
  }, [ shopName]);


  useEffect(() => {
    let total = 0

    transactions.forEach((transaction) => {
      const negative = ['ticket', 'financing', 'rent']
    
      if(negative.includes(transaction.type)){
        total =  total - transaction.value
      }else {
        total =  total + transaction.value
      }
    })

    setTotalCount(old => total)
  }, [transactions])

  const updateTable = () => {
    fetchData();
  }
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShopName(event.target.value);
  };
  return (
    
    <div className="container-transaction">
            <button className="add-button" onClick={updateTable }>
      Atualizar tabela
    </button>
    <div className="search-bar">
        <input type="text" value={shopName} onChange={handleSearch} placeholder="Buscar por nome da loja" />
      </div>
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
        <span>valor total das transações: {totalCount}</span>
      </div>


    </div>
  );
};

