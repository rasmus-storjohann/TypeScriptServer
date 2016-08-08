"use strict";

import { Contact } from "./Contact";

interface IContactSaveFunction {
  (contact: Contact) : Contact;
}

interface IContactUpdateFunction {
  (id: number, contact: Contact): Contact;
}

interface IContactLoadFunction {
  (id: number) : Contact;
}

interface IContactLoadAllFunction {
  () : Contact[];
}

interface IContactDeleteFunction {
  (id: number) : void;
}

export interface IContactRepository {
  saveContact: IContactSaveFunction;
  loadContact: IContactLoadFunction;
  loadAllContacts: IContactLoadAllFunction;
  updateContact: IContactUpdateFunction;
  deleteContact: IContactDeleteFunction;
}
