"use strict";

import * as typeMoq from "typemoq";
import * as chai from "chai";

import { ContactsExpressAdapter } from "../ContactsExpressAdapter";
import { Contact } from "../../businessInterfaces/Contact";
import { MockContactService } from "./MockContactService";

describe("ContactsExpressAdapter", () => {
  var subject : ContactsExpressAdapter;
  var mockService: typeMoq.Mock<MockContactService>;

  beforeEach(() => {
    mockService = typeMoq.Mock.ofType(MockContactService);
    subject = new ContactsExpressAdapter(mockService.object);
  });

});
