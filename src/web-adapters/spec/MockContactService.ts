"use strict";

import { IContactService } from "../../businessInterfaces/IContactService";
import { Contact } from "../../businessInterfaces/Contact";

export class MockContactService implements IContactService {

  private _contact = new Contact(0, "first", "last", false);

  saveContact(contact: Contact) {
    return true;
  }

  updateContact(id: number, contact: Contact) {
    return true;
  }

  deleteContact(id: number) {
    return true;
  }

  loadAllContacts() {
    return [ this._contact ];
  }

  loadContact(id: number) {
    return this._contact;
  }
};
