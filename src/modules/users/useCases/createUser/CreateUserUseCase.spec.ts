import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create user use case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com.br",
      password: "test@123",
    });

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("password");
  });

  it("Should not be able to create a new user if the user already exists", async () => {
    await createUserUseCase.execute({
      name: "test",
      email: "test@test.com.br",
      password: "test@123",
    });
    expect(async () => {
      await createUserUseCase.execute({
        name: "test",
        email: "test@test.com.br",
        password: "test@123",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
