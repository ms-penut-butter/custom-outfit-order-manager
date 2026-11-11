import type { Address } from "./address";
import type { BodyMeasurements } from "./body-measurements";
import type { Photo } from "./photo";

export class Customer {
  readonly id: string;
  name: string;
  phoneNumber: string;
  photo: Photo;
  address: Address;
  bodyMeasurements: BodyMeasurements;

  constructor(props: Customer.ConstructorArgs) {
    this.id = props.id;
    this.name = props.name;
    this.phoneNumber = props.phoneNumber;
    this.photo = props.photo;
    this.address = props.address;
    this.bodyMeasurements = props.bodyMeasurements;
  }

  update(props: Customer.UpdateArgs) {
    if (Object.keys(props).length === 0) {
      throw new Error("A customer update must include at least one changed field.");
    }

    if (props.name !== undefined) {
      this.name = props.name;
    }

    if (props.phoneNumber !== undefined) {
      this.phoneNumber = props.phoneNumber;
    }

    if (props.photo !== undefined) {
      this.photo = props.photo;
    }

    if (props.address !== undefined) {
      this.address = props.address;
    }

    if (props.bodyMeasurements !== undefined) {
      this.bodyMeasurements = props.bodyMeasurements;
    }
  }
}

export namespace Customer {
  export type ConstructorArgs = {
    id: string;
    name: string;
    phoneNumber: string;
    photo: Photo;
    address: Address;
    bodyMeasurements: BodyMeasurements;
  };

  export type UpdateArgs = {
    name?: string;
    phoneNumber?: string;
    photo?: Photo;
    address?: Address;
    bodyMeasurements?: BodyMeasurements;
  };
}
