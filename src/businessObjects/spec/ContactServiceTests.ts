"use strict";

import * as typeMoq from "typemoq";
import * as chai from "chai";

import { ContactService } from "../ContactService";
import { Contact } from "../../businessInterfaces/Contact";
import { MockContactRepository } from "./MockContactRepository";

describe("ContactService", () => {
    var subject: ContactService;
    var mockRepository: typeMoq.Mock<MockContactRepository>;
    var aContact = { _id: 5, _firstName: "foo", _lastName: "bar", _star: true };
    var someContacts = [aContact, { _id: 5, _firstName: "foo2", _lastName: "bar2", _star: false }];

    beforeEach(() => {
      mockRepository = typeMoq.Mock.ofType(MockContactRepository);
      subject = new ContactService(mockRepository.object);
    });

    describe("#loadAllContacts", () => {
      it("should call loadAllContacts on the repository", () => {
        subject.loadAllContacts();
        mockRepository.verify(x => x.loadAllContacts(), typeMoq.Times.once());
      });

      it("should return value received from the repository", () => {
        mockRepository.setup(x => x.loadAllContacts()).returns(() => someContacts);
        chai.expect(subject.loadAllContacts()).to.deep.eq(someContacts);
      });
    });

    describe("#loadContact", () => {
      it("should call loadContact on the repository", () => {
        subject.loadContact(123);
        mockRepository.verify(x => x.loadContact(123), typeMoq.Times.once());
      });
      it("should return value received from the repository", () => {
        mockRepository.setup(x => x.loadContact(234)).returns(() => aContact);
        chai.expect(subject.loadContact(234)).to.deep.eq(aContact);
      });
    });
});
