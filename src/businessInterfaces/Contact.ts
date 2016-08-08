"use strict";

import { ValidationError } from "./ValidationError";

class ContactValidator {
  public static validate(contact: Contact) {
    if (contact._firstName === "") {
      throw new ValidationError("Empty first name");
    }
    if (contact._lastName === "") {
      throw new ValidationError("Empty last name");
    }
    if (contact._id % 1 !== 0) {
      throw new ValidationError("Non-integer id: " + contact._id);
    }
  }
}

export class Contact {

  _id: number;
  _firstName: string;
  _lastName: string;
  _star: boolean;

  constructor(id: number, firstName: string, lastName: string, star: boolean) {
    this._id = id;
    this._firstName = firstName;
    this._lastName = lastName;
    this._star = star;

    ContactValidator.validate(this);
  }
}
