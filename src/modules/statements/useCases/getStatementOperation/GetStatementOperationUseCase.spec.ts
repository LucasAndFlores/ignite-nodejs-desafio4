import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;

const { StatementNotFound, UserNotFound } = GetStatementOperationError;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Balance Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to get the balance", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com.br",
      password: "test@123",
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "salary",
    });

    const getStatement = await getStatementOperationUseCase.execute({
      statement_id: deposit.id as string,
      user_id: user.id as string,
    });

    expect(getStatement).toHaveProperty("id");
    expect(getStatement).toHaveProperty("user_id");
    expect(getStatement).toHaveProperty("type");
  });

  it("Should not be able to get the balance if the user doesn't exist", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com.br",
      password: "test@123",
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "salary",
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        statement_id: deposit.id as string,
        user_id: "123",
      });
    }).rejects.toBeInstanceOf(UserNotFound);
  });

  it("Should not be able to get the balance if the statement id doesn't exist", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com.br",
      password: "test@123",
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "salary",
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        statement_id: "123",
        user_id: user.id as string,
      });
    }).rejects.toBeInstanceOf(StatementNotFound);
  });
});
