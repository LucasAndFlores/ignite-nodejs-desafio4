import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

const { InsufficientFunds, UserNotFound } = CreateStatementError;

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create statement use case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to create a new deposit", async () => {
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

    expect(deposit).toHaveProperty("id");
    expect(deposit).toHaveProperty("type");
    expect(deposit.type).toMatch("deposit");
    expect(deposit).toHaveProperty("amount");
  });

  it("Should be able to create a new withdrawal if the user have funds", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com.br",
      password: "test@123",
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "salary",
    });

    const withDrawal = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: "buy something new",
    });

    expect(withDrawal).toHaveProperty("id");
    expect(withDrawal).toHaveProperty("type");
    expect(withDrawal.type).toMatch("withdraw");
    expect(withDrawal).toHaveProperty("amount");
  });

  it("Should not be able to create a new deposit or withdrawal if the user doesn't exist", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "123",
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "salary",
      });
    }).rejects.toBeInstanceOf(UserNotFound);
  });

  it("Should not be able to create a withdrawal if the user doesn't have funds", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "test",
        email: "test@test.com.br",
        password: "test@123",
      });
      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "salary",
      });
      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 150,
        description: "buy something new",
      });
    }).rejects.toBeInstanceOf(InsufficientFunds);
  });
});
