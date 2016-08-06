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

interface IContactDeleteFunction {
  (id: number) : boolean;
}

export interface IContactService {
  saveContact: IContactSaveFunction;
  loadContact: IContactLoadFunction;
  loadAllContacts: IContactLoadAllFunction;
  updateContact: IContactUpdateFunction;
  deleteContact: IContactDeleteFunction;
}
