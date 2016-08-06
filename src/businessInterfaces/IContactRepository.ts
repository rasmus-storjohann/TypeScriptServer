"use strict";

import { Contact } from "./Contact";

interface IContactSaveFunction {
  (contact: Contact) : boolean;
}

interface IContactUpdateFunction {
  (id: number, contact: Contact): boolean;
}

interface IContactLoadFunction {
  (id: number) : Contact;
}

interface IContactLoadAllFunction {
  () : Contact[];
}

export interface IContactRepository {
  saveContact: IContactSaveFunction;
  loadContact: IContactLoadFunction;
  loadAllContacts: IContactLoadAllFunction;
  updateContact: IContactUpdateFunction;
}
