"use strict";

import { Contact } from "./Contact";

interface IContactSaveFunction {
  (contact: Contact) : boolean;
}

interface IContactLoadFunction {
  (id: number) : Contact;
}

export interface IContactRepository {
  saveContact: IContactSaveFunction;
  loadContact: IContactLoadFunction;
}
