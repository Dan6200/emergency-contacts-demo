"use client";
import { faker } from "@faker-js/faker";
import { atom } from "jotai";

faker.seed(10);

const { firstName, lastName } = faker.person,
  { phone } = faker,
  { location } = faker;

export default atom(
  Array(100)
    .fill(0)
    .map((value) => ({
      firstName: firstName(),
      lastName: lastName(),
      phone: phone.number(),
      address: location.streetAddress(true),
    }))
);
