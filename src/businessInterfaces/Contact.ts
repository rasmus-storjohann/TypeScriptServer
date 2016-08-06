"use strict";

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
  }
}
