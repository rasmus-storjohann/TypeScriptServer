// can set a random number provider
// can use a function as spec for a field, which is passed in the autofixture
// nested object support
// objects with arrays as properties, hmmm
// create many integers and strings etc.

"use strict";

import * as chai from "chai";
import { Contact } from "../Contact";
import { ContactFixture } from "../test-helpers/ContactFixture";
var randomatic = require("randomatic");

interface ParsedSpec {
    isInteger: boolean;
    lowerBound?: number;
    upperBound?: number;
};

export class Autofixture {
    private options;

    constructor(options = undefined) {
        this.options = options;
    }

    public createMany<T extends Object>(t: T, count = 3) : T[] {
        var results = new Array<T>();
        for (var i = 0; i < count; i++) {
            results.push(this.create(t));
        }
        return results;
    }

    public create<T extends Object>(template: T) : T {

        this.throwIfOptionsContainsFieldsNotIn(template);

        var result = Object.assign({}, template);

        this.iterate(result, (name, value) => {
            var type = typeof result[name];

            if (this.optionsContain(name)) {
                result[name] = this.generateFromOption(name, type);
            } else if (this.isTypeSupported(type)) {
                result[name] = this.generateFromSpec(type);
            } else {
                this.throwUnsupportedTypeError(type);
            }
        });
        return result;
    }

    private throwIfOptionsContainsFieldsNotIn<T>(t: T) {
        this.iterate(this.options, (name, value) => {
            if (!t.hasOwnProperty(name)) {
                throw Error("Autofixture specifies field '" + name + "' that is not in the type");
            }
        });
    }

    // Object.keys is better
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
        var integerOk = type === "number" && /^integer/.test(spec);

        if (booleanOk || stringOk || numberOk || integerOk) {
            return;
        }

        throw Error("AutoFixture spec '" + spec + "' not compatible with type '" + type + "'");
    }

    private isTypeSupported(type: string) {
        return type === "boolean" || type === "string" || type === "number";
    }

    private throwUnsupportedTypeError(type: string) {
        throw Error("Autofixture cannot generate values of type '" + name + "'");
    }

    private generateFromSpec(spec: string) {
        if (spec === "boolean") {
            return Autofixture.createBoolean();
        }
        if (/^string/.test(spec)) {
            return this.generateString(spec);
        }
        if (/^number/.test(spec) || /^integer/.test(spec)) {
            return this.generateNumber(spec);
        }
        throw new Error("invalid type in autofixture spec '" + spec + "'");
    }

    public static createBoolean() {
        return Math.random() > 0.5;
    }

    private generateString(spec: string) {
        var length: number;

        if (spec === "string") {

            return Autofixture.createString();

        } else {
            // string followed by length in []
            var parsedString = /^string\s*\[\s*(\d+)\s*\]$/.exec(spec);
            if (parsedString) {
                length = parseInt(parsedString[1]);
            } else {
                throw new Error("Invalid string autofixture spec: " + spec);
            }
            return Autofixture.createString(length);
        }
    }

    public static createString(length: number = 10) {
        return randomatic(length);
    }

    private generateNumber(spec: string) {
        var parsedSpec: ParsedSpec;
        if (spec === "number") {
            parsedSpec = {
                isInteger: false
            };
        } else if (spec === "integer") {
            parsedSpec = {
                isInteger: true
            };
        } else {
            parsedSpec = this.parseAsOnesidedSpec(spec) || this.parseAsTwosidesSpec(spec);
            if (!parsedSpec) {
                throw Error("Could not parse number spec: '" + spec + "'");
            }
        }
        return this.createNumberFromSpec(parsedSpec);
    }

    private parseAsOnesidedSpec(spec: string) : ParsedSpec {
        // number or integer, followed by < or >, followed by a real value
        var match = /^(number|integer)\s*(\>|\<)\s*(\d*\.?\d+)$/.exec(spec);
        if (!match) {
            return undefined;
        }

        var isInteger = match[1] === "integer";
        if (isInteger && /\./.exec(match[3])) {
            throw new Error("Integer spec cannot contain real value: " + spec);
        }
        var isUpperBound = match[2] === "<";
        var limit = parseFloat(match[3]);

        if (isUpperBound) {
            return {
                isInteger: isInteger,
                upperBound: limit
            };
        } else {
            return {
                isInteger: isInteger,
                lowerBound: limit
            };
        }
    };

    private parseAsTwosidesSpec(spec: string) : ParsedSpec {
        // number or integer, followed by 'in', followed by <a, b> with a and b real values
        var match = /^(number|integer)\s+in\s*\<\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*\>$/.exec(spec);
        if (!match) {
            return undefined;
        }

        var isInteger = match[1] === "integer";

        if (isInteger) {
            if (/\./.exec(match[2]) || /\./.exec(match[3])) {
                throw new Error("Integer spec cannot contain real value: " + spec);
            }
        }

        var lowerLimit = parseFloat(match[2]);
        var upperLimit = parseFloat(match[3]);

        return {
            isInteger: isInteger,
            lowerBound: lowerLimit,
            upperBound: upperLimit
        };
    };

    private createNumberFromSpec(spec: ParsedSpec) {

        if (spec.isInteger) {
            if (spec.lowerBound && spec.upperBound) {
                return Autofixture.createIntegerBetween(spec.lowerBound, spec.upperBound);
            } else if (spec.lowerBound) {
                return Autofixture.createIntegerAbove(spec.lowerBound);
            } else if (spec.upperBound) {
                return Autofixture.createIntegerBelow(spec.upperBound);
            } else {
                return Autofixture.createInteger();
            }

        } else {

            if (spec.lowerBound && spec.upperBound) {
                return Autofixture.createNumberBetween(spec.lowerBound, spec.upperBound);
            } else if (spec.lowerBound) {
                return Autofixture.createNumberAbove(spec.lowerBound);
            } else if (spec.upperBound) {
                return Autofixture.createNumberBelow(spec.upperBound);
            } else {
                return Autofixture.createNumber();
            }
        }
    }

    public static createNumber() {
        return 1000 * Math.random();
    }

    public static createNumberBelow(upperBound: number) {
        return upperBound - 1000 * Math.random();
    }

    public static createNumberAbove(lowerBound: number) {
        return lowerBound + 1000 * Math.random();
    }

    public static createNumberBetween(lowerBound: number, upperBound: number) {
        return lowerBound + (upperBound - lowerBound) * Math.random();
    }

    public static createInteger() {
        return Math.floor(Autofixture.createNumber());
    }

    public static createIntegerBelow(upperBound: number) {
        return Math.floor(Autofixture.createNumberBelow(upperBound));
    }

    public static createIntegerAbove(lowerBound: number) {
        return Math.floor(Autofixture.createNumberAbove(lowerBound));
    }

    public static createIntegerBetween(lowerBound: number, upperBound: number) {
        return Math.floor(Autofixture.createNumberBetween(lowerBound, upperBound));
    }
};

describe("Autofixture", () => {

    describe("static functions", () => {

        it("should return boolean", () => {
            chai.expect(Autofixture.createBoolean()).to.be.a("boolean");
        });
        it("should return string", () => {
            chai.expect(Autofixture.createString()).to.be.a("string");
        });
        it("should return string of given length", () => {
            chai.expect(Autofixture.createString(10)).to.be.a("string");
        });
        it("should return a number", () => {
            chai.expect(Autofixture.createNumber()).to.be.a("number");
        });
        it("should return a number above a limit", () => {
            chai.expect(Autofixture.createNumberAbove(0)).to.be.a("number");
        });
        it("should return a number below a limit", () => {
            chai.expect(Autofixture.createNumberBelow(0)).to.be.a("number");
        });
        it("should return an integer below in a range", () => {
            chai.expect(Autofixture.createNumberBetween(0, 1)).to.be.a("number");
        });
        it("should return an integer above a limit", () => {
            chai.expect(Autofixture.createIntegerAbove(0)).to.be.a("number");
        });
        it("should return an integer below a limit", () => {
            chai.expect(Autofixture.createIntegerBelow(0)).to.be.a("number");
        });
        it("should return an integer below in a range", () => {
            chai.expect(Autofixture.createIntegerBetween(0, 1)).to.be.a("number");
        });
    });

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

    it("can create from implicit spec", () => {
        var subject = new Autofixture();
        var value = subject.create(new ClassWithEverything());
        chai.expect(value.flag).to.be.a("boolean");
        chai.expect(value.value).to.be.a("number");
        chai.expect(value.name).to.be.a("string");
    });

    it("can create from partial spec", () => {
        var subject = new Autofixture({
            "value" : "number > 5"
        });
        var value = subject.create(new ClassWithEverything());
        chai.expect(value.value).to.be.a("number");
        chai.expect(value.value).to.be.at.least(5);
        chai.expect(value.name).to.be.a("string");
        chai.expect(value.name).to.have.length.of.at.least(1);
    });

    it("does not modify argument object", () => {
        var subject = new Autofixture();
        var argumentObject = new ClassWithString("name");

        subject.create(argumentObject);

        chai.expect(argumentObject.name).to.equal("name");
    });

    describe("creating many", () => {
        var values : ClassWithEverything[];

        beforeEach(() => {
            var subject = new Autofixture();
            values = subject.createMany(new ClassWithEverything());
        });

        it("returns an array of several elements", () => {
            chai.expect(values).to.be.instanceOf(Array);
            chai.expect(values).to.have.length.above(1);
        });

        it("returns an array of the expected type", () => {
            chai.expect(values[0]).to.be.instanceOf(Object);
            chai.expect(values[0].flag).to.be.a("boolean");
            chai.expect(values[0].value).to.be.a("number");
            chai.expect(values[0].name).to.be.a("string");
        });

        it("returns an array of unique values", () => {
            chai.expect(values[0].value).to.not.equal(values[1].value);
            chai.expect(values[0].name).to.not.equal(values[1].name);
        });
    });

    describe("creating booleans", () => {
        it("returns a boolean", () => {
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
                "value" : "number > 3.2"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value).to.be.at.least(3.2);
        });

        it("with a value below a limit", () => {
            var subject = new Autofixture({
                "value" : "number < 3.2"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value).to.be.at.most(3.2);
        });

        it("with a value in a range", () => {
            var subject = new Autofixture({
                "value" : "number in <1.222, 1.223>"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value).to.be.at.least(1.222);
            chai.expect(value.value).to.be.at.most(1.223);
        });

    });

    describe("creating integers", () => {

        it("with any value", () => {
            var subject = new Autofixture({
                "value" : "integer"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value % 1).to.equal(0);
        });

        it("with a value above a limit", () => {
            var subject = new Autofixture({
                "value" : "integer > 3"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value % 1).to.equal(0);
            chai.expect(value.value).to.be.at.least(4);
        });

        it("with a value below a limit", () => {
            var subject = new Autofixture({
                "value" : "integer < 8"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value % 1).to.equal(0);
            chai.expect(value.value).to.be.at.most(7);
        });

        it("with a value in a range", () => {
            var subject = new Autofixture({
                "value" : "integer in <4,8>"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value % 1).to.equal(0);
            chai.expect(value.value).to.be.at.least(5);
            chai.expect(value.value).to.be.at.most(7);
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
                "naem" : "string"
            });
            chai.expect(() => {
                subject.create(new ClassWithString(""));
            }).to.throw(Error, /field \'naem\' that is not in the type/);
        });

        it("on wrong type in spec", () => {
            var subject = new Autofixture({
                "name" : "number"
            });
            chai.expect(() => {
                subject.create(new ClassWithString(""));
            }).to.throw(Error, /\'number\' not compatible with type \'string\'/);
        });

        /*
        // valid: string [ 5 ], "number in < 5.1 , 6.1 >", "number < 2", "number < .2"
        // invalid: sting, string[5, string[], integer < 2.3, leading and trailing space
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
