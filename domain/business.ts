import {Address} from "./address";
import {PaymentStatus} from "@/domain/payment";
import {Order} from "@/domain/order";
import {Customer} from "./customer";

export class Business {
    id: string;
    name: string;
    description: string;
    address: Address;

    constructor({id, name, description, address}: Business.ConstructorArgs) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
    }

    createOrder(props: Business.OrderCreateArgs) {
        if (props.items.length === 0) {
            throw new Error("An order must have at least one order item.");
        }

        const paymentStatus = props.paymentStatus ?? PaymentStatus.Unpaid;
        const occurredAt = props.occurredAt ?? new Date();

        const order = new Order({
            customerId: props.customerId,
            notes: props.notes,
            items: props.items,
            expectedDueDate: props.expectedDueDate,
            paymentStatus,
            paymentMethod: props.paymentMethod,
            deliveryAddress: props.deliveryAddress,
            history: [],
        });

        order.history.push({
            type: "order_created",
            occurredAt,
            customerId: props.customerId,
            notes: props.notes,
            items: props.items,
            expectedDueDate: props.expectedDueDate,
            status: order.status,
            paymentStatus,
            paymentMethod: props.paymentMethod,
            deliveryAddress: props.deliveryAddress,
        });

        return order;
    }

    createCustomer(props: Business.CustomerCreateArgs) {
        return new Customer(props);
    }
}


export namespace Business {

    export type CustomerCreateArgs = Customer.ConstructorArgs;

    export type ConstructorArgs = {
        id: string
        name: string
        description: string
        address: Address;
    }

    export type OrderCreateArgs = Order.CreateArgs;
}
