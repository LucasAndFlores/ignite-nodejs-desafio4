import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should be able to authenticate an user", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com.br",
      password: "test@123",
    });

    const auth = await authenticateUserUseCase.execute({
      email: user.email,
      password: "test@123",
    });

    expect(auth).toHaveProperty("token");
    expect(auth).toHaveProperty("user");
  });

  it("Should not be able to authenticate a user if his email is incorrect", async () => {
    await createUserUseCase.execute({
      name: "test",
      email: "test@test.com.br",
      password: "test@123",
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "teste123@test.com.br",
        password: "test@123",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate a user if his password is incorrect", async () => {
    await createUserUseCase.execute({
      name: "test",
      email: "test@test.com.br",
      password: "test@123",
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "test@test.com.br",
        password: "test@12345",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
