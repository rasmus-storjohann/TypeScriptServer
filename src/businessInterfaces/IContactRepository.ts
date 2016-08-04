"use strict";

import { Contact } from "./Contact";

interface IContactSaveFunction {
  (contact: Contact) : boolean;
}

interface IContactLoadFunction {
  () : Contact;
}

export interface IContactRepository {
  saveContact: IContactSaveFunction;
  loadContact: IContactLoadFunction;
}
