"use strict";

import { Contact } from "./Contact";

export interface IContactRepository {
    saveContact: (contact: Contact) => Contact;
    loadContact: (id: number) => Contact;
    loadAllContacts: () => Contact[];
    updateContact: (id: number, contact: Contact) => Contact;
    deleteContact: (id: number) => void;
}
