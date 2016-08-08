"use strict";

import * as typeMoq from "typemoq";
import * as chai from "chai";
import { ContactBuilder } from "../test-helpers/ContactBuilder";

describe("ContactBuilder test helper", () => {
  var subject : ContactBuilder;
  beforeEach(() => {
    subject = new ContactBuilder();
  });
  it ("should have a non-empty first name", () => {
    chai.expect(subject.build()._firstName).to.have.lengthOf(10);
  });
  it ("should have a non-empty last name", () => {
    chai.expect(subject.build()._lastName).to.have.lengthOf(10);
  });
  it ("should create a contact with a number as id", () => {
    chai.expect(subject.build()._id).to.be.a("number");
  });
  it("should support setting the first name", () => {
    chai.expect(subject.withFirstName("x").build()._firstName).to.equal("x");
  });
  it("should support setting the last name", () => {
    chai.expect(subject.withLastName("x").build()._lastName).to.equal("x");
  });
  it("should support setting the id", () => {
    chai.expect(subject.withId(5).build()._id).to.equal(5);
  });
  it("should support setting the 'star' property", () => {
    chai.expect(subject.withStar(false).build()._star).to.equal(false);
  });
  it("shoud rerandomize values after build is called", () => {
    var firstContact = subject.build();
    var secondContact = subject.build();
    chai.expect(firstContact._firstName).to.not.equal(secondContact._firstName);
  });
  it("should build many", () => {
    chai.expect(subject.buildMany()).to.have.lengthOf(3);
  });
});
