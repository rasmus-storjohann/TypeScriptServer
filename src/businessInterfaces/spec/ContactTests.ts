"use strict";

import * as chai from "chai";
var randomatic = require("randomatic");
import { Contact } from "../Contact";
import { ValidationError } from "../ValidationError";

describe("Contact", () => {
  var firstName : string;
  var lastName : string;
  var id : number;
  var star: boolean;

  beforeEach(() => {
    firstName = randomatic(10);
    lastName = randomatic(10);
    id = Math.floor(1000 * Math.random());
    star = Math.random() < 0.5;
  });

  it("should throw on empty first name", () => {
    chai.expect(() => {
      new Contact(id, "", lastName, star);
    }).to.throw(ValidationError);
  });

  it("should throw on empty last name", () => {
    chai.expect(() => {
      new Contact(id, firstName, "", star);
    }).to.throw(ValidationError);
  });

  it("should throw on non-integer id", () => {
    chai.expect(() => {
      new Contact(1.5, firstName, lastName, star);
    }).to.throw(ValidationError);
  });

  it("should throw on negative id", () => {
    chai.expect(() => {
      new Contact(-1, firstName, lastName, star);
    }).to.throw(ValidationError);
  });
});
