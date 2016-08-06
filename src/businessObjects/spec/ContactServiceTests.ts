import * as TypeMoq from "typemoq";
import * as contactService from "../ContactService";
import { IContactRepository } from "../../businessInterfaces/IContactRepository";

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

    beforeEach(function () {
      subject = new contactService.ContactService(null);
    });

    describe("Dummy mock tests", () => {
      it("should...", () => {
        let mock = TypeMoq.Mock.ofType(Repository);
        mock.object.save(5);
        mock.verify(x => x.save(5), TypeMoq.Times.atLeastOnce());
      });
    });

    describe("#loadAllContacts", () => {
        it("should...", () => {

          var someFunc = function(){
            return "";
          };

          let mock: TypeMoq.Mock<() => string> = TypeMoq.Mock.ofInstance(someFunc);
          mock.object();
          mock.verify(x => x(), TypeMoq.Times.atLeastOnce());

        });
    });
});
