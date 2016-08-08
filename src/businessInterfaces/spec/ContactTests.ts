"use strict";

import * as chai from "chai";
import { Contact } from "../Contact";
import { ValidationError } from "../ValidationError";

describe("Contact", () => {
  describe("validation", () => {
    it("should validate non-empty first name", () => {
      chai.expect(new Contact(1, "", "non-empty", false)).to.throw(ValidationError);
    });
  });
});
