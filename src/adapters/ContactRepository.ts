"use strict";

import { IContactRepository } from "../businessInterfaces/IContactRepository";
import { Contact } from "../businessInterfaces/Contact";

export class ContactRepository implements IContactRepository {
  private _contact: Contact;

  constructor() {
    this._contact = new Contact("", "", false);
  }

  save(contact: Contact) {
    this._contact = contact;
  }

  load() {
    return this._contact;
  }
}
