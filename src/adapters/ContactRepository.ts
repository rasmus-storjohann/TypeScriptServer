"use strict";

import { IContactRepository } from "../businessInterfaces/IContactRepository";
import { Contact } from "../businessInterfaces/Contact";

export class ContactRepository implements IContactRepository {
  private _contact: Contact;

  constructor() {
    this._contact = new Contact("From", "Repository", false);
  }

  saveContact(contact: Contact) {
    console.log("Saving contact with first name = " +
                  contact._firstName + ", last name = " +
                  contact._lastName + " and star = " +
                  contact._star);

    this._contact = contact;
    return true;
  }

  loadContact() {
    return this._contact;
  }
}
