"use strict";

import { IContactRepository } from "../businessInterfaces/IContactRepository";
import { Contact } from "../businessInterfaces/Contact";

export class ContactRepository implements IContactRepository {
  private _contact: Contact;

  constructor() {
    this._contact = new Contact("From", "Repository", false);
  }

  saveContact(contact: Contact) {
    this._contact = contact;
    return true;
  }

  loadContact() {
    return this._contact;
  }
}
