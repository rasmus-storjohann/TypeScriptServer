import * as TypeMoq from "typemoq";
import * as contactService from "../ContactService";
import * as contactRepository from "../../adapters/ContactRepository";

interface ISaveFunction {
  (contact: number) : boolean;
}

interface IRepository {
  save: ISaveFunction;
}

class Repository implements IRepository {
  public save(n: number) {
    return true;
  }
}

class Service {
  private _repo : IRepository;
  constructor(repo: IRepository) {
    this._repo = repo;
  }
  public save(n: number) {
    this._repo.save(n);
  }
}

describe("ContactService", () => {
    var subject: contactService.ContactService;
    var mock: TypeMoq.Mock<Repository>;
    var mockRepository: TypeMoq.Mock<contactRepository.ContactRepository>;

    beforeEach(function () {
      mock = TypeMoq.Mock.ofType(Repository);
      mockRepository = TypeMoq.Mock.ofType(contactRepository.ContactRepository);
      subject = new contactService.ContactService(mockRepository.object);
    });

    describe("Dummy mock tests", () => {
      it("should...", () => {
        mock.object.save(5);
        mock.verify(x => x.save(5), TypeMoq.Times.atLeastOnce());
      });
      it("should also...", () => {
        subject.loadAllContacts();
        mockRepository.verify(x => x.loadAllContacts(), TypeMoq.Times.atLeastOnce());
      });
    });
});
