"use strict";

import * as typeMoq from "typemoq";
import * as chai from "chai";

import { ContactRepository } from "../ContactRepository";
import { Contact } from "../../businessInterfaces/Contact";
import { ContactFixture } from "../../businessInterfaces/test-helpers/ContactFixture";
import { NoSuchModel } from "../../businessInterfaces/NoSuchModel";

describe("ContactRepository", () => {
    var subject: ContactRepository;
        beforeEach(() => {
        subject = new ContactRepository();
    });
    describe("loadContact", () => {
        it("should throw on non-existent model", () => {
            chai.expect(() => {
                subject.loadContact(999);
            }).to.throw(NoSuchModel);
        });
    });
});
