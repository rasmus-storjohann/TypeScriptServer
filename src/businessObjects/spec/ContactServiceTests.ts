"use strict";

import * as typeMoq from "typemoq";
import * as chai from "chai";

import { ContactService } from "../ContactService";
import { Contact } from "../../businessInterfaces/Contact";
import { MockContactRepository } from "./MockContactRepository";
import { ContactFixture } from "../../businessInterfaces/test-helpers/ContactFixture";

describe("ContactService", () => {
    var subject: ContactService;
    var mockRepository: typeMoq.Mock<MockContactRepository>;
    var aContact : Contact;
    var someContacts : Contact[];

    beforeEach(() => {
      mockRepository = typeMoq.Mock.ofType(MockContactRepository);
      subject = new ContactService(mockRepository.object);
      var builder = new ContactFixture();
      aContact = builder.build();
      someContacts = builder.buildMany();
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
