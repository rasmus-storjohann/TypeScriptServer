"use strict";

import { NoSuchModel } from "../NoSuchModel";
var randomatic = require("randomatic");
import * as chai from "chai";

describe("NoSuchModel", () => {
    var message: string;
    var subject: NoSuchModel;

    beforeEach(() => {
        message = randomatic(10);
        subject = new NoSuchModel(message);
    });

    it ("should have name 'NoSuchModel'", () => {
        chai.expect(subject.name).to.equal("NoSuchModel");
    });

    it ("should have a message", () => {
        chai.expect(subject.message).to.equal(message);
    });

    // TODO should also have filename and line numbers,
    // may need to upgrade from TypeScript 1.8 to get that
});
