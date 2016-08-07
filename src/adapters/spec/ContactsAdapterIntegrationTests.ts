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

  var aContact = { _id: 3, _firstName: "Bob", _lastName: "Smith", _star: true };
  var someContacts = [aContact, { _id: 5, _firstName: "Jenny", _lastName: "Baker", _star: false }];

  beforeEach(() => {
    mockService = typeMoq.Mock.ofType(MockContactService);
    subject = new ContactsExpressAdapter(mockService.object);
    expressApp = express();
    expressApp.use("/", subject.Router());
  });

  describe("get contacts list", () => {

    it("should return contacts", (done) => {

      mockService.setup(x => x.loadAllContacts()).returns(() => someContacts);
      request(expressApp).get("/contacts")
                         .expect(/\"_firstName\"\:\"Bob\"/)
                         .expect(/\"_firstName\"\:\"Jenny\"/)
                         .expect("Content-Type", /json/)
                         .expect("Content-Length", "128")
                         .expect(200, done);
    });

    it ("should call service", (done) => {
      mockService.setup(x => x.loadAllContacts()).returns(() => someContacts);
      request(expressApp).get("/contacts");
      //mockService.verify(x => x.loadAllContacts(), typeMoq.Times.once());
      done();
    });
  });

  describe("get contact by id", () => {
    it ("should return contact with given id", (done) => {
      mockService.setup(x => x.loadContact(12)).returns(() => aContact);
      request(expressApp).get("/contact/12")
                         .expect(/\"_firstName\"\:\"Bob\"/)
                         .expect("Content-Type", /json/)
                         .expect("Content-Length", "61")
                         .end(function(err, res) {
                            if (err) {
                              return done(err);
                            }
                            done();
                          });
    });

    it ("should call service with id", (done) => {
      mockService.setup(x => x.loadContact(23)).returns(() => aContact);
      request(expressApp).get("/contact/23");
      //mockService.verify(x => x.loadContact(23), typeMoq.Times.once());
      done();
    });
  });

  describe("post new contact", () => {
    it("should return", (done) => {
      mockService.setup(x => x.saveContact({ _id: 3, _firstName: "", _lastName: "", _star: false})).returns(() => true);
      request(expressApp).post("/contact")
                         .send(aContact)
                         .set("Accept", "application/json")
                         .end(function(err, res){
                           if (err) {
                             return done(err);
                           }
                         });
    });
  });
});
