import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should be able to return a user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com.br",
      password: "test@123",
    });

    const userProfile = await showUserProfileUseCase.execute(user.id as string);

    expect(userProfile).toHaveProperty("id");
    expect(userProfile).toHaveProperty("name");
    expect(userProfile).toHaveProperty("password");
  });

  it("Should not be able to return a user profile if it doesn't exist", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("123");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
