# Task Todo - Backend

API backend para o aplicativo de gerenciamento de tarefas desenvolvido com NestJS e PostgreSQL.

## Executando com Docker

Este projeto está configurado para ser executado facilmente usando Docker e Docker Compose, incluindo o frontend, backend e banco de dados.

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Como Executar

1. **Clone os repositórios**

   Certifique-se de que os repositórios do frontend e backend estejam no mesmo diretório pai:

   ```
   /home/fabiolucas/Área de trabalho/
   ├── task-todo-back/ (este repositório)
   └── to-do-app-next/ (repositório do frontend)
   ```

2. **Construa e inicie os containers**

   No diretório do backend, execute:

   ```bash
   cd '/home/fabiolucas/Área de trabalho/task-todo-back'
   docker-compose up -d
   ```

   Isso vai construir e iniciar todos os serviços definidos no arquivo docker-compose.yml.

3. **Verifique se os containers estão rodando**

   ```bash
   docker ps
   ```

   Você deverá ver três containers em execução:
   - task-todo-back_frontend_1
   - task-todo-back_backend_1
   - task-todo-back_database_1

### Acesso às Aplicações

- **Frontend**: http://localhost:3500
- **Backend API**: http://localhost:3600/api
- **API de verificação de saúde**: http://localhost:3600/api/health
- **Banco de Dados PostgreSQL**:
  - Host: localhost
  - Porta: 5433
  - Usuário: postgres
  - Senha: postgres
  - Banco de dados: tododb

### Configuração de Portas

O projeto utiliza portas não convencionais para evitar conflitos com outras aplicações:

- Frontend: 3500 (mapeada para a porta 3000 do container)
- Backend: 3600 (mapeada para a porta 3000 do container)
- PostgreSQL: 5433 (mapeada para a porta 5432 do container)

### Logs dos Containers

Para verificar os logs de cada container:

```bash
# Frontend
docker logs task-todo-back_frontend_1

# Backend
docker logs task-todo-back_backend_1

# Banco de Dados
docker logs task-todo-back_database_1
```

### Parando os Containers

```bash
docker-compose down
```

Para remover também os volumes (dados do banco de dados):

```bash
docker-compose down -v
```

### Reconstruindo as Imagens

Se você fizer alterações no código e precisar reconstruir as imagens:

```bash
docker-compose up --build -d
```

### Solução de Problemas

1. **Erro de conexão com o banco de dados**
   - Verifique se o banco de dados está em execução: `docker ps`
   - Verifique os logs do container do banco de dados: `docker logs task-todo-back_database_1`
   - Certifique-se de que o arquivo .env tem os valores corretos para conectar ao banco de dados

2. **Frontend não consegue se conectar ao backend**
   - Verifique se a variável NEXT_PUBLIC_API_URL está configurada como http://localhost:3600/api
   - Verifique se o CORS está configurado corretamente no backend

3. **Portas já em uso**
   - Se alguma porta estiver em uso, você pode modificar o mapeamento no arquivo docker-compose.yml
