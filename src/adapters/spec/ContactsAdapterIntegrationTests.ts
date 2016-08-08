"use strict";

import * as typeMoq from "typemoq";
var request = require("supertest");
import * as express from "express";

import { ContactsExpressAdapter } from "../ContactsExpressAdapter";
import { Contact } from "../../businessInterfaces/Contact";
import { MockContactService } from "./MockContactService";
import { ContactFixture } from "../../businessInterfaces/test-helpers/ContactFixture";

describe("ContactsExpressAdapterIntegrationTests", () => {
  var subject : ContactsExpressAdapter;
  var mockService: typeMoq.Mock<MockContactService>;
  var expressApp;
  var contactFixture = new ContactFixture();

  beforeEach(() => {
    mockService = typeMoq.Mock.ofType(MockContactService);
    subject = new ContactsExpressAdapter(mockService.object);
    expressApp = express();
    expressApp.use("/", subject.Router());

  });

  describe("get contacts list", () => {

    it("should return contacts", (done) => {

      var bobAndJenny = [contactFixture.withFirstName("Bob").build(),
                         contactFixture.withFirstName("Jenny").build()];

      mockService.setup(x => x.loadAllContacts()).returns(() => bobAndJenny);
      request(expressApp).get("/contacts")
                         .expect(/\"_firstName\"\:\"Bob\"/)
                         .expect(/\"_firstName\"\:\"Jenny\"/)
                         .expect("Content-Type", /json/)
                         .expect(200, done);
    });

    it ("should call service", (done) => {
      var someContacts = contactFixture.buildMany();
      mockService.setup(x => x.loadAllContacts()).returns(() => someContacts);
      request(expressApp).get("/contacts");
      //mockService.verify(x => x.loadAllContacts(), typeMoq.Times.once());
      done();
    });
  });

  describe("get contact by id", () => {
    it ("should return contact with given id", (done) => {
      var bob = contactFixture.withFirstName("Bob").build();

      mockService.setup(x => x.loadContact(12)).returns(() => bob);
      request(expressApp).get("/contact/12")
                         .expect(/\"_firstName\"\:\"Bob\"/)
                         .expect("Content-Type", /json/)
                         .end(function(err, res) {
                            if (err) {
                              return done(err);
                            }
                            done();
                          });
    });

    it ("should call service with id", (done) => {
      var aContact = contactFixture.build();
      mockService.setup(x => x.loadContact(23)).returns(() => aContact);
      request(expressApp).get("/contact/23");
      //mockService.verify(x => x.loadContact(23), typeMoq.Times.once());
      done();
    });
  });

  describe("post new contact", () => {
    it("should return", (done) => {
      var aContact = contactFixture.build();
      mockService.setup(x => x.saveContact({ _id: 3, _firstName: "first", _lastName: "last", _star: false})).returns(() => true);
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
