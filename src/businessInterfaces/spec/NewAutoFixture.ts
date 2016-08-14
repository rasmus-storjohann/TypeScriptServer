// can set a random number provider: https://www.npmjs.com/package/random-seed
// can use a function as spec for a field, which is passed in the autofixture
// nested array support
// objects with arrays as properties, hmmm
// create arrays of basic types, e.g. integers and strings etc.

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

    public static createBoolean() {
        return Math.random() > 0.5;
    }

    public static createString(length = 10) {
        return randomatic(length);
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

    private options;

    constructor(options = undefined) {
        this.options = options;
    }

    public create<T extends Object>(template: T) : T {
        return this.createObject(template, this.options);
    }

    public createMany<T extends Object>(template: T, count = 3) : T[] {
        return this.createManyObjects(template, count, this.options);
    }

    private createManyObjects<T extends Object>(template: T, count: number, options?: Object) : T[] {
        var results = new Array<T>();
        for (var i = 0; i < count; i++) {
            results.push(this.createObject(template, this.options));
        }
        return results;
    }

    private createObject<T extends Object>(template: T, options?: Object) : T {

        this.throwIfOptionsContainsFieldsNotIn(template, options); // typo, Contain

        var result = Object.assign({}, template);

        this.forEachProperty(result, (name, value) => {
            var type = this.actualTypeOfField(result, name);
            if (type === "actualObject") { // use TS2.0 to limit the set of values for this field
                var optionsForObject = options && options[name];
                result[name] = this.createObject(template[name], optionsForObject);
            } else if (type === "actualArray") {
                var optionsForObject = options && options[name];
                result[name] = this.createManyObjects(template[name][0], 3, optionsForObject);
            } else {
                result[name] = this.createSimpleProperty(name, type, options);
            }
        });

        return result;
    }

    private throwIfOptionsContainsFieldsNotIn<T>(template: T, options?: Object) {
        this.forEachProperty(options, (name, value) => {
            if (!template.hasOwnProperty(name)) {
                throw Error("Autofixture specifies field '" + name + "' that is not in the type");
            }
        });
    }

    // Object.keys is better, don't pass in value
    private forEachProperty(object, callback) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                callback(property, object[property]);
            }
        }
    }

    private actualTypeOfField<T extends Object>(t: T, name: string) {
        var field = t[name];
        var type = typeof field;

        if ( Object.prototype.toString.call(field) === "[object Array]") {
            return "actualArray";
        }
        if (type === "object") {
            return "actualObject";
        }
        return type;
    }

    private createSimpleProperty(name: string, type: string, options?: Object) {
        if (this.optionsContain(name, options)) {
            return this.createFromOptions(name, type, options);
        }

        this.throwOnUnsupportedType(type);
        return this.createFromSpec(type);
    }

    private optionsContain(name: string, options?: Object) {
        return options && options.hasOwnProperty(name);
    }

    private createFromOptions(name: string, type: string, options: Object) {
        var spec = options[name];
        this.throwOnIncompatibleSpec(type, spec);
        return this.createFromSpec(spec);
    }

    private throwOnIncompatibleSpec(type: string, spec: string) {
        var booleanOk = type === "boolean" && spec === "boolean";
        var stringOk = type === "string" && /^\s*string/.test(spec);
        var numberOk = type === "number" && /^\s*number/.test(spec);
        var integerOk = type === "number" && /^\s*integer/.test(spec);

        if (booleanOk || stringOk || numberOk || integerOk) {
            return;
        }

        throw Error("AutoFixture spec '" + spec + "' not compatible with type '" + type + "'");
    }

    private throwOnUnsupportedType(type: string) {
        if (type === "boolean" || type === "string" || type === "number" || type === "actualObject" || type === "actualArray") {
            return;
        }
        throw Error("Autofixture cannot generate values of type '" + type + "'");
    }

    private createFromSpec(spec: string) {
        if (spec === "boolean") {
            return Autofixture.createBoolean();
        }
        if (/^\s*string/.test(spec)) {
            return this.createStringFromSpec(spec);
        }
        if (/^\s*number/.test(spec) || /^\s*integer/.test(spec)) {
            return this.createNumberFromSpec(spec);
        }
        throw new Error("Invalid type in autofixture spec '" + spec + "'");
    }

    private createStringFromSpec(spec: string) {
        if (spec === "string") {
            return Autofixture.createString();
        }

        // string followed by length inside []
        var parsedString = /^\s*string\s*\[\s*(\d+)\s*\]\s*$/.exec(spec);
        if (parsedString) {
            var length = parseInt(parsedString[1], 10);
            return Autofixture.createString(length);
        }

        throw new Error("Invalid string autofixture spec: '" + spec + "'");
    }

    private createNumberFromSpec(spec: string) {
        var parsedSpec = this.parseNumberSpec(spec);
        return this.createNumberFromParsedSpec(parsedSpec);
    }

    private parseNumberSpec(spec: string) : ParsedSpec {
        if (spec === "number" || spec === "integer") {
            return {
                isInteger: spec === "integer"
            };
        }

        var parsedSpec = this.parseAsOnesidedSpec(spec) || this.parseAsTwosidedSpec(spec);

        if (parsedSpec) {
            return parsedSpec;
        }

        throw Error("Invalid number autofixture spec: '" + spec + "'");
    }

    private parseAsOnesidedSpec(spec: string) : ParsedSpec {
        // number or integer, followed by < or >, followed by a real value
        var match = /^\s*(number|integer)\s*(\>|\<)\s*(\d*\.?\d+)\s*$/.exec(spec);
        if (!match) {
            return undefined;
        }

        var isInteger = match[1] === "integer";
        var isUpperBound = match[2] === "<";
        var limit = parseFloat(match[3]);

        if (isInteger) {
            this.validateIntegerSpec(match[3]);
        }

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

    private validateIntegerSpec(spec: string) {
        var specContainsPeriod = spec.indexOf(".") >= 0;

        if (specContainsPeriod) {
            throw new Error("Invalid integer autofixture spec contains real value: " + spec);
        }
    }

    private parseAsTwosidedSpec(spec: string) : ParsedSpec {
        // number or integer, followed by 'in', followed by <a, b> with a and b real values
        var match = /^\s*(number|integer)\s+in\s*\<\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*\>\s*$/.exec(spec);
        if (!match) {
            return undefined;
        }

        var isInteger = match[1] === "integer";
        var lowerBound = parseFloat(match[2]);
        var upperBound = parseFloat(match[3]);

        if (isInteger) {
            this.validateIntegerSpec(match[2]);
            this.validateIntegerSpec(match[3]);
        }

        return { // return a closure here, then the next function is not needed
            isInteger: isInteger,
            lowerBound: lowerBound,
            upperBound: upperBound
        };
    };

    private createNumberFromParsedSpec(spec: ParsedSpec) {
        if (spec.isInteger) {
            if (spec.lowerBound && spec.upperBound) {
                return Autofixture.createIntegerBetween(spec.lowerBound, spec.upperBound);
            }
            if (spec.lowerBound) {
                return Autofixture.createIntegerAbove(spec.lowerBound);
            }
            if (spec.upperBound) {
                return Autofixture.createIntegerBelow(spec.upperBound);
            }
            return Autofixture.createInteger();
        }

        if (spec.lowerBound && spec.upperBound) {
            return Autofixture.createNumberBetween(spec.lowerBound, spec.upperBound);
        }
        if (spec.lowerBound) {
            return Autofixture.createNumberAbove(spec.lowerBound);
        }
        if (spec.upperBound) {
            return Autofixture.createNumberBelow(spec.upperBound);
        }
        return Autofixture.createNumber();
    }
};

describe("Autofixture", () => {

    describe("static functions", () => {

        it("should create boolean", () => {
            chai.expect(Autofixture.createBoolean()).to.be.a("boolean");
        });
        it("should create string", () => {
            chai.expect(Autofixture.createString()).to.be.a("string");
        });
        it("should create string of given length", () => {
            chai.expect(Autofixture.createString(10)).to.be.a("string");
        });
        it("should create a number", () => {
            chai.expect(Autofixture.createNumber()).to.be.a("number");
        });
        it("should create a number above a limit", () => {
            chai.expect(Autofixture.createNumberAbove(0)).to.be.a("number");
        });
        it("should create a number below a limit", () => {
            chai.expect(Autofixture.createNumberBelow(0)).to.be.a("number");
        });
        it("should create an integer in a range", () => {
            chai.expect(Autofixture.createNumberBetween(0, 1)).to.be.a("number");
        });
        it("should create an integer above a limit", () => {
            chai.expect(Autofixture.createIntegerAbove(0)).to.be.a("number");
        });
        it("should create an integer below a limit", () => {
            chai.expect(Autofixture.createIntegerBelow(0)).to.be.a("number");
        });
        it("should create an integer in a range", () => {
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

    class ClassWithNestedClass {
        public label: string;
        public nested: ClassWithEverything;
        constructor() {
            this.label = "";
            this.nested = new ClassWithEverything;
        }
    }

    class ClassWithNestedArray {
        public label: string;
        public nestedArray: ClassWithEverything[];
        constructor() {
            this.label = "";
            this.nestedArray = [new ClassWithEverything];
        }
    }

    it("can create without spec", () => {
        var subject = new Autofixture();
        var value = subject.create(new ClassWithEverything()); // TODO use fixtures for this
        chai.expect(value.flag).to.be.a("boolean");
        chai.expect(value.value).to.be.a("number");
        chai.expect(value.name).to.be.a("string");
    });

    it("can create with partial spec", () => {
        var subject = new Autofixture({
            "value" : "number > 5"
        });
        var value = subject.create(new ClassWithEverything());
        chai.expect(value.value).to.be.a("number");
        chai.expect(value.value).to.be.at.least(5);
        chai.expect(value.name).to.be.a("string");
        chai.expect(value.name).to.not.be.empty;
    });

    it("does not modify argument object", () => {
        var subject = new Autofixture();
        var argumentObject = new ClassWithString("name");

        subject.create(argumentObject);

        chai.expect(argumentObject.name).to.equal("name");
    });

    describe("can create nested objects", () => {

        it("without spec", () => {
            var subject = new Autofixture();
            var value = subject.create(new ClassWithNestedClass());
            chai.expect(value.label).to.be.a("string");
            chai.expect(value.nested.flag).to.be.a("boolean");
            chai.expect(value.nested.value).to.be.a("number");
            chai.expect(value.nested.name).to.be.a("string");
        });

        it("with nested spec", () => {
            var subject = new Autofixture({
                "nested" : {
                    "name" : "string[5]"
                }
            });
            var value = subject.create(new ClassWithNestedClass());
            chai.expect(value.nested.name).to.be.a("string");
            chai.expect(value.nested.name).to.have.lengthOf(5);
        });

    });

    describe("can create object with nested array of objects", () => {

        it("creates several objects in nested array", () => {
            var subject = new Autofixture();
            var value = subject.create(new ClassWithNestedArray());
            chai.expect(value.nestedArray).to.be.an("Array");
            chai.expect(value.nestedArray).to.have.length.above(1);
        });

        it("create objects of the expected type", () => {
            var subject = new Autofixture();
            var value = subject.create(new ClassWithNestedArray());
            chai.expect(value.nestedArray[0].flag).to.be.a("boolean");
            chai.expect(value.nestedArray[0].value).to.be.a("number");
            chai.expect(value.nestedArray[0].name).to.be.a("string");
            chai.expect(value.nestedArray[0].name).to.not.be.empty;
        });
    });

    describe("creating many", () => {
        var values : ClassWithEverything[];

        beforeEach(() => {
            var subject = new Autofixture();
            values = subject.createMany(new ClassWithEverything());
        });

        it("returns an array of several elements", () => {
            chai.expect(values).to.be.instanceOf(Array);
            chai.expect(values).to.not.be.empty; // should technically be more than one
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
            chai.expect(value.value).to.be.within(1.222, 1.223);
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

        it("one sided spec with whitespace in spec", () => {
            var subject = new Autofixture({
                "value" : " integer < 8 "
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
        });

        it("with a value in a range", () => {
            var subject = new Autofixture({
                "value" : "integer in <4, 8>"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value % 1).to.equal(0);
            chai.expect(value.value).to.be.within(5, 7);
        });

        it("two sided range with white space in spec", () => {
            var subject = new Autofixture({
                "value" : " integer   in < 4 , 8 >"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
        });
    });

    describe("creating strings", () => {

        it("with default length", () => {
            var subject = new Autofixture({
                "name" : "string"
            });
            var value = subject.create(new ClassWithString(""));
            chai.expect(value.name).to.be.a("string");
            chai.expect(value.name).to.not.be.empty;
        });

        it("with a given length", () => {
            var subject = new Autofixture({
                "name" : "string[5]"
            });
            var value = subject.create(new ClassWithString(""));
            chai.expect(value.name).to.be.a("string");
            chai.expect(value.name).to.have.lengthOf(5);
        });

        it("with white space in spec", () => {
            var subject = new Autofixture({
                "name" : " string [ 5 ] "
            });
            var value = subject.create(new ClassWithString(""));
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
                "name" : "number" // also "number < 5" etc?
            });
            chai.expect(() => {
                subject.create(new ClassWithString(""));
            }).to.throw(Error, /\'number\' not compatible with type \'string\'/);
        });

        var expectToThrowOnInvalidStringSpec = function(invalidSpec: string, expected: string) {
            var subject = new Autofixture({
                "name" : invalidSpec
            });
            var expectedToThrow = () => {
                subject.create(new ClassWithString(""));
            };
            chai.expect(expectedToThrow).to.throw(Error, expected);
        };

        var expectToThrowOnInvalidNumberSpec = function(invalidSpec: string, expected: string) {
            var subject = new Autofixture({
                "value" : invalidSpec
            });
            var expectedToThrow = () => {
                subject.create(new ClassWithNumber(0));
            };
            chai.expect(expectedToThrow).to.throw(Error, expected);
        };

        it("on invalid specs", () => {
            // there are way too many of these
            expectToThrowOnInvalidStringSpec("string[]", "Invalid string autofixture spec: 'string[]'");
            expectToThrowOnInvalidStringSpec("string[5", "Invalid string autofixture spec: 'string[5'");
            expectToThrowOnInvalidStringSpec("string 5]", "Invalid string autofixture spec: 'string 5]'");
            expectToThrowOnInvalidStringSpec("string[5.3]", "Invalid string autofixture spec: 'string[5.3]'");
            expectToThrowOnInvalidStringSpec("sting", "AutoFixture spec 'sting' not compatible with type 'string'");

            expectToThrowOnInvalidNumberSpec("number 5", "Invalid number autofixture spec: 'number 5'");
            expectToThrowOnInvalidNumberSpec("number <= 5", "Invalid number autofixture spec: 'number <= 5'");
            expectToThrowOnInvalidNumberSpec("number >= 5", "Invalid number autofixture spec: 'number >= 5'");
            expectToThrowOnInvalidNumberSpec("3 > number > 4", "AutoFixture spec '3 > number > 4' not compatible with type 'number'");
            expectToThrowOnInvalidNumberSpec("3 < number < 4", "AutoFixture spec '3 < number < 4' not compatible with type 'number'");
            expectToThrowOnInvalidNumberSpec("number >", "Invalid number autofixture spec: 'number >'");
            expectToThrowOnInvalidNumberSpec("number <", "Invalid number autofixture spec: 'number <'");
            expectToThrowOnInvalidNumberSpec("number <1,2>", "Invalid number autofixture spec: 'number <1,2>'");
            expectToThrowOnInvalidNumberSpec("number in <1,2", "Invalid number autofixture spec: 'number in <1,2'");
            expectToThrowOnInvalidNumberSpec("number in 1,2>", "Invalid number autofixture spec: 'number in 1,2>'");
            expectToThrowOnInvalidNumberSpec("number in <1 2>", "Invalid number autofixture spec: 'number in <1 2>'");

            expectToThrowOnInvalidNumberSpec("integer < 5.5", "Invalid integer autofixture spec contains real value: 5.5");
            expectToThrowOnInvalidNumberSpec("integer > 5.5", "Invalid integer autofixture spec contains real value: 5.5");
            expectToThrowOnInvalidNumberSpec("integer in <1, 5.5>", "Invalid integer autofixture spec contains real value: 5.5");
            expectToThrowOnInvalidNumberSpec("integer in <1.1, 5>", "Invalid integer autofixture spec contains real value: 1.1");
            expectToThrowOnInvalidNumberSpec("integer 5", "Invalid number autofixture spec: 'integer 5'");
            expectToThrowOnInvalidNumberSpec("integer <= 5", "Invalid number autofixture spec: 'integer <= 5'");
            expectToThrowOnInvalidNumberSpec("integer >= 5", "Invalid number autofixture spec: 'integer >= 5'");
            expectToThrowOnInvalidNumberSpec("3 > integer > 4", "AutoFixture spec '3 > integer > 4' not compatible with type 'number'");
            expectToThrowOnInvalidNumberSpec("3 < integer < 4", "AutoFixture spec '3 < integer < 4' not compatible with type 'number'");
            expectToThrowOnInvalidNumberSpec("integer >", "Invalid number autofixture spec: 'integer >'");
            expectToThrowOnInvalidNumberSpec("integer <", "Invalid number autofixture spec: 'integer <'");
            expectToThrowOnInvalidNumberSpec("integer <1,2>", "Invalid number autofixture spec: 'integer <1,2>'");
            expectToThrowOnInvalidNumberSpec("integer in <1,2", "Invalid number autofixture spec: 'integer in <1,2'");
            expectToThrowOnInvalidNumberSpec("integer in 1,2>", "Invalid number autofixture spec: 'integer in 1,2>'");
            expectToThrowOnInvalidNumberSpec("integer in <1 2>", "Invalid number autofixture spec: 'integer in <1 2>'");
        });
    });
});
