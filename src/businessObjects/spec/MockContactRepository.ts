"use strict";

import { IContactRepository } from "../../businessInterfaces/IContactRepository";
import { Contact } from "../../businessInterfaces/Contact";

export class MockContactRepository implements IContactRepository {

  private _contact = new Contact(0, "first", "last", false);

  saveContact(contact: Contact) {
    return contact;
  }

  updateContact(id: number, contact: Contact) {
    return contact;
  }

  deleteContact(id: number) {
    delete this._contact[id];
  }

  loadAllContacts() {
    return [ this._contact ];
  }

  loadContact(id: number) {
    return this._contact;
  }
}
