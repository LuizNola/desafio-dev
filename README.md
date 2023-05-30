## Para Rodar o projeto

1. Primeiro, acesse a pasta "api" através do seguinte comando no terminal: `cd api/`

2. Em seguida, execute os seguintes comandos para construir e iniciar os contêineres do Docker:
 `docker-compose build` `docker-compose up`

 * Observação: É necessário ter o Docker instalado.

3. Também é possível rodar apenas a aplicação backend usando o comando:

`npm run dev:start`

4. Em outro terminal, acesse a pasta "front" com o seguinte comando:

`cd front/`

5. Inicie o projeto frontend com o comando:

`npm start`


6. Agora o seu projeto está rodando!

## Rotas do projeto
- **POST /transactions**: Cria um objeto do tipo transaction. Exemplo de corpo da requisição:
\`\`\`json
{
 "type": "debit",
 "value": 145,
 "cpf": "4854821",
 "card": "4515151",
 "timeOfOccurrence": "2023-05-31T10:00:00Z",
 "shopOwner": "luiz",
 "shopName": "luiz Shop"
}
\`\`\`
- **GET /transactions/template**: Gera um arquivo template para ser usado no projeto.
- **POST /transactions/import**: Aceita um arquivo XLSX para adicionar transações ao banco.
- **GET /transactions**: Lista todas as transações.
- **GET /transactions/:id**: Lista uma transação por ID.
- **GET /transactions/byname/:name**: Lista todas as transações por nome.
- **DELETE /transactions/:id**: Deleta uma transação.
- **POST /data-import**: Cria um data import. Exemplo de corpo da requisição:
\`\`\`json
{
  "status": "load"
}
\`\`\`
- **GET /data-import**: Lista todas as imports.
- **PATCH /data-import/:id**: Atualiza uma import. Exemplo de corpo da requisição:
\`\`\`json
{
  "status": "success",
  "message": "Sucesso"
}
\`\`\`