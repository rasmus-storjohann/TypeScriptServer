/// <reference path="../../../typings/globals/mocha/index.d.ts" />

import * as contactService from "../ContactService";

describe("ContactService", () => {
    var subject: contactService.ContactService;

    beforeEach(function () {
      subject = new contactService.ContactService(null);
    });

    describe("#loadAllContacts", () => {
        it("should...", () => {
          throw 500;
        });
    });
});
