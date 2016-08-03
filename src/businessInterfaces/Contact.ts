"use strict";

export class Contact {

  _firstName: string;
  _lastName: string;
  _star: boolean;

  constructor(firstName: string, lastName: string, star: boolean) {
    this._firstName = firstName;
    this._lastName = lastName;
    this._star = star;
  }
}
