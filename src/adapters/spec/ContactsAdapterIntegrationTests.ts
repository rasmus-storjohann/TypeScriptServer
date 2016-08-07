"use strict";

import * as typeMoq from "typemoq";
var request = require("supertest");
import * as express from "express";

import { ContactsExpressAdapter } from "../ContactsExpressAdapter";
import { Contact } from "../../businessInterfaces/Contact";
import { MockContactService } from "./MockContactService";

describe("ContactsExpressAdapterIntegrationTests", () => {
  var subject : ContactsExpressAdapter;
  var mockService: typeMoq.Mock<MockContactService>;
  var expressApp;

  var aContact = { _id: 3, _firstName: "FirstName", _lastName: "LastName", _star: true };
  var someContacts = [{ _id: 3, _firstName: "FirstName", _lastName: "LastName", _star: true },
                      { _id: 5, _firstName: "FirstName2", _lastName: "LastName2", _star: false }];

  // TODO this should be in the beforeEach too
  mockService = typeMoq.Mock.ofType(MockContactService);

  beforeEach(() => {
    subject = new ContactsExpressAdapter(mockService.object);
    expressApp = express();
    expressApp.use("/", subject.Router());
  });

  describe("get contacts list", () => {

    it("should return contacts", (done) => {

      mockService.setup(x => x.loadAllContacts()).returns(() => someContacts);
      request(expressApp).get("/contacts")
                         .expect(/\"_firstName\"\:\"FirstName\"/)
                         .expect("Content-Type", /json/)
                         .expect("Content-Length", "146")
                         .expect(200, done);
    });
  });

  describe("get contact by id", () => {
    it ("should return contact with given id", (done) => {
      mockService.setup(x => x.loadContact(12)).returns(() => aContact);

      request(expressApp).get("/contact/12")
                         .expect(/\"_firstName\"\:\"FirstName\"/)
                         .expect("Content-Type", /json/)
                         .expect("Content-Length", "70")
                         .expect(200, done);
    });

    it ("should call service with id", () => {
      mockService.setup(x => x.loadContact(12)).returns(() => aContact);
      request(expressApp).get("/contact/12");
      mockService.verify(x => x.loadContact(12), typeMoq.Times.once());
    });
  });
});
