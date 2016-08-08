"use strict";

import { Contact } from "../../businessInterfaces/Contact";
var randomatic = require("randomatic");

export class ContactBuilder {
  private id: number;
  private firstName: string;
  private lastName: string;
  private star: boolean;

  constructor() {
    this.randomize();
  }
  private randomize() {
    this.id = Math.random();
    this.firstName = randomatic(10);
    this.lastName = randomatic(10);
    this.star = Math.random() < 0.5;
  }
  public withId(id: number) {
    this.id = id;
    return this;
  }
  public withFirstName(firstName: string) {
    this.firstName = firstName;
    return this;
  }
  public withLastName(lastName: string) {
    this.lastName = lastName;
    return this;
  }
  public withStar(star: boolean) {
    this.star = star;
    return this;
  }
  public build() {
    var value = new Contact(this.id, this.firstName, this.lastName, this.star);
    this.randomize();
    return value;
  }
  public buildMany() {
    return [this.build(), this.build(), this.build()];
  }
}
