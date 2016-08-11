"use strict";

import * as chai from "chai";
import { Contact } from "../Contact";
import { ContactFixture } from "../test-helpers/ContactFixture";
var randomatic = require("randomatic");

describe("ContactFixture test helper", () => {
  var subject : ContactFixture;
  var theContact: Contact;
  var aString : string;

  beforeEach(() => {
    subject = new ContactFixture();
    theContact = subject.build();
    aString = randomatic(10);
  });

  it ("should have a non-empty first name", () => {
    chai.expect(theContact._firstName).to.not.be.empty;
  });

  it ("should have a non-empty last name", () => {
    chai.expect(theContact._lastName).to.not.be.empty;
  });

  it ("should create a contact with a positive integer as id", () => {
    var id = theContact._id;
    chai.expect(id).to.be.a("number");
    chai.expect(id % 1).to.equal(0, "Id should be a whole number");
    chai.expect(id).to.be.above(0);
  });

  it("should support setting the first name", () => {
    chai.expect(subject.withFirstName(aString).build()._firstName).to.equal(aString);
  });

  it("should support setting the last name", () => {
    chai.expect(subject.withLastName(aString).build()._lastName).to.equal(aString);
  });

  it("should support setting the id", () => {
    chai.expect(subject.withId(5).build()._id).to.equal(5);
  });

  it("should support setting the 'star' property", () => {
    chai.expect(subject.withStar(false).build()._star).to.equal(false);
  });

  it("shoud rerandomize values each time build is called", () => {
    var firstContact = subject.build();
    var secondContact = subject.build();
    chai.expect(firstContact._firstName).to.not.equal(secondContact._firstName);
  });

  it("can build many contacts", () => {
    chai.expect(subject.buildMany()).to.have.length.least(2);
  });
});
