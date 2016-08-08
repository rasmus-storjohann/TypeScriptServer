"use strict";

import * as chai from "chai";
import { Contact } from "../Contact";
import { ValidationError } from "../ValidationError";

describe("Contact", () => {
  it("should throw on empty first name", () => {
    chai.expect(() => {
      new Contact(1, "", "valid last name", false);
    }).to.throw(ValidationError);
  });

  it("should throw on empty last name", () => {
    chai.expect(() => {
      new Contact(1, "valid first name", "", false);
    }).to.throw(ValidationError);
  });

  it("should throw on non-integer id", () => {
    chai.expect(() => {
      new Contact(1.5, "valid first name", "valid last name", false);
    }).to.throw(ValidationError);
  });
});
