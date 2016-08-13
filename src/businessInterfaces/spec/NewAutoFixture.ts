"use strict";

import * as chai from "chai";
import { Contact } from "../Contact";
import { ContactFixture } from "../test-helpers/ContactFixture";
var randomatic = require("randomatic");

class Autofixture {
    private options;

    constructor(options = undefined) {
        this.options = options;
    }

    public create<T extends Object>(t: T) : T {

        this.throwIfOptionsContainsFieldsNotIn(t);

        this.iterate(t, (name, value) => {
            var type = typeof t[name];

            if (this.optionsContain(name)) {
                t[name] = this.generateFromOption(name, type);
            } else if (this.isTypeSupported(type)) {
                t[name] = this.generateFromSpec(type);
            } else {
                this.throwUnsupportedTypeError(type);
            }
        });
        return t;
    }

    private throwIfOptionsContainsFieldsNotIn<T>(t: T) {
        this.iterate(this.options, (name, value) => {
            if (!t.hasOwnProperty(name)) {
                throw Error("Autofixture specifies field '" + name + "' that is not in the type");
            }
        });
    }

    private iterate(object, callback) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                callback(property, object[property]);
            }
        }
    }

    private optionsContain(name: string) {
        return this.options && this.options.hasOwnProperty(name);
    }

    private generateFromOption(name: string, type: string) {
        this.throwOnIncompatibleSpec(type, this.options[name]);

        return this.generateFromSpec(this.options[name]);
    }

    private throwOnIncompatibleSpec(type: string, spec: string) {
        var booleanOk = type === "boolean" && spec === "boolean";
        var stringOk = type === "string" && /^string/.test(spec);
        var numberOk = type === "number" && /^number/.test(spec);

        if (!booleanOk && !stringOk && !numberOk) {
            throw Error("AutoFixture spec '" + spec + "' not compatible with type '" + type + "'");
        }
    }

    private isTypeSupported(type: string) {
        return type === "boolean" || type === "string" || type === "number";
    }

    private throwUnsupportedTypeError(type: string) {
        throw Error("Autofixture cannot generate values of type '" + name + "'");
    }

    private generateFromSpec(spec: string) {
        if (spec === "boolean") {
            return this.generateBoolean();
        }
        if (/^string.*/.test(spec)) {
            return this.generateString(spec);
        }
        if (/^number.*/.test(spec)) {
            return this.generateNumber(spec);
        }
        throw new Error("invalid type in autofixture spec");
    }

    private generateBoolean() {
        return this.random() > 0.5;
    }

    private generateString(spec: string) {
        if (spec === "string") {
            var defaultLength = 32;
            return randomatic(defaultLength);
        }

        var stringWithLength = /^string\[(\d+)\]$/.exec(spec);
        if (stringWithLength) {
            var length = parseInt(stringWithLength[1]);
            return randomatic(length);
        }
        throw new Error("Invalid string autofixture spec: " + spec);
    }

    private generateNumber(spec: string) {
        if (spec === "number") {
            return this.random();
        }

        var matchWithLowerLimit = /^number\s*\>\s*(\d*\.?\d+)$/.exec(spec);
        if (matchWithLowerLimit) {
            var limit = parseFloat(matchWithLowerLimit[1]);
            return limit + this.random();
        }

        var matchWithUpperLimit = /^number\s*\<\s*(\d*\.?\d+)$/.exec(spec);
        if (matchWithUpperLimit) {
            var limit = parseFloat(matchWithUpperLimit[1]);
            return limit - 1 + this.random();
        }

        throw new Error("invalid number autofixture spec");
    }

    private random() {
        return Math.random();
    }
};

describe("Autofixture", () => {

    class ClassWithBoolean {
        public flag: boolean;
        constructor(flag: boolean) {
            this.flag = flag;
        }
    }

    class ClassWithString {
        public name: string;
        constructor(name: string) {
            this.name = name;
        }
    };

    class ClassWithNumber {
        public value: number;
        constructor(value: number) {
            this.value = value;
        }
    }

    class ClassWithEverything {
        public flag: boolean;
        public value: number;
        public name: string;
        constructor() {
            this.flag = true;
            this.name = "";
            this.value = 1;
        }
    };

    // can set a random number provider
    // can use a function as spec for a field, which is passed in the autofixture
    // exposes static functions for string, number and bool creation
    // nested object support
    // generate lists of values
    // don't modify argument object
    // objects with arrays as properties, hmmm

    it("with implicit spec", () => {
        var subject = new Autofixture();
        var value = subject.create(new ClassWithEverything());
        chai.expect(value.flag).to.be.a("boolean");
        chai.expect(value.value).to.be.a("number");
        chai.expect(value.name).to.be.a("string");
    });

    it("with partial spec", () => {
        var subject = new Autofixture({
            "value" : "number > 5"
        });
        var value = subject.create(new ClassWithEverything());
        chai.expect(value.value).to.be.a("number");
        chai.expect(value.value).to.be.at.least(5);
        chai.expect(value.name).to.be.a("string");
        chai.expect(value.name).to.have.length.of.at.least(1);
    });

    describe("creating booleans", () => {
        it("with any value", () => {
            var subject = new Autofixture({
                "flag" : "boolean"
            });
            var value = subject.create(new ClassWithBoolean(true));
            chai.expect(value.flag).to.be.a("boolean");
        });
    });

    describe("creating numbers", () => {

        it("with any value", () => {
            var subject = new Autofixture({
                "value" : "number"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
        });

        it("with a value above a limit", () => {
            var subject = new Autofixture({
                "value" : "number > 3.2" // TODO test "3" and ".2" too
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value).to.be.at.least(3.2);
        });

        it("with a value below a limit", () => {
            var subject = new Autofixture({
                "value" : "number < 3.2" // TODO test "3" and ".2" too
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value).to.be.at.most(3.2);
        });

        it("with a value below a limit", () => {
            var subject = new Autofixture({
                "value" : "number in [1.2, 2.3]" // TODO test "3" and ".2" too
            });
        });

        it("with an integer", () => {
            var subject = new Autofixture({
                "value" : "integer"
            });
        });

        it("with an integer above a limit", () => {
            var subject = new Autofixture({
                "value" : "integer > 3"
            });
        });

        it("with an integer below a limit", () => {
            var subject = new Autofixture({
                "value" : "integer < 3"
            });
        });

        it("with an integer below a limit", () => {
            var subject = new Autofixture({
                "value" : "integer in [4, 6]"
            });
        });
    });

    describe("creating strings", () => {

        it("with default length", () => {
            var subject = new Autofixture({
                "name" : "string"
            });
            var value = subject.create(new ClassWithString(""));
            chai.expect(value.name).to.be.a("string");
            chai.expect(value.name).to.have.length.of.at.least(1);
        });

        it("with a given length", () => {

            var subject = new Autofixture({
                "name" : "string[5]"
            });
            var value = subject.create(new ClassWithString(""));
            chai.expect(value.name).to.be.a("string");
            chai.expect(value.name).to.have.lengthOf(5);
        });
    });

    describe("handling errors", () => {
        it("of misspelled field", () => {
            var subject = new Autofixture({
                "mane" : "string"
            });
            chai.expect(() => {
                subject.create(new ClassWithString(""));
            }).to.throw(Error, /field \'mane\' that is not in the type/);
        });

        it("on wrong type", () => {
            var subject = new Autofixture({
                "name" : "number"
            });
            chai.expect(() => {
                subject.create(new ClassWithString(""));
            }).to.throw(Error, /\'number\' not compatible with type \'string\'/);
        });

        /*
        it("invalid specs", () => {
            chai.expect(() => {
                new Autofixture({
                    "name" : "string[5]"
                });
            }).to.throw(Error);
        });
        */
    });
});
