import { faker } from "@faker-js/faker";
import { PROJECT_MODES, SIGNAGE_TYPES, TIME_PURPOSES, SUPPLIED_BY, SUPPLY_TYPES, PROJECT_REQ_TYPES, EQUIPMENT_LIST, PERMISSIONS, CURRENCIES } from "../testData/salesEnquiryDataFactory";

type ProjectMode = typeof PROJECT_MODES[number];
type SignageType = typeof SIGNAGE_TYPES[number];
type TimePurpose = typeof TIME_PURPOSES[number];
type SuppliedBy = typeof SUPPLIED_BY[number];
type ProjectReqType = typeof PROJECT_REQ_TYPES[number];
type Equipment = typeof EQUIPMENT_LIST[number];
type Permission = typeof PERMISSIONS[number];
type Currency = typeof CURRENCIES[number];
type SupplyType = typeof SUPPLY_TYPES[number];


export class RandomDataGenerator {

    private static pickFrom<T>(arr: readonly T[]): T {
        return arr[faker.number.int({ min: 0, max: arr.length - 1 })];
    }

    static getFirstName(): string {
        return faker.person.firstName();
    }

    static getLastName(): string {
        return faker.person.lastName();
    }

    static getEmail(): string {
        return faker.internet.email();
    }

    static getUsername(): string {
        return faker.internet.username();
    }

    static getNumber(minValue: number, maxValue: number): number {
        return faker.number.int({ min: minValue, max: maxValue });
    }

    static getProjectMode(): ProjectMode {
        return this.pickFrom(PROJECT_MODES);
    }

    static getSignageType(): SignageType {
        return this.pickFrom(SIGNAGE_TYPES);
    }

    static getTimePurpose(): TimePurpose {
        return this.pickFrom(TIME_PURPOSES);
    }

    static getSuppliedBy(): SuppliedBy {
        return this.pickFrom(SUPPLIED_BY);
    }

    static getProjectReqType(): ProjectReqType {
        return this.pickFrom(PROJECT_REQ_TYPES);
    }

    static getPermission(): Permission {
        return this.pickFrom(PERMISSIONS);
    }

    static getCurrency(): Currency {
        return this.pickFrom(CURRENCIES);
    }

    static getSupplyType(): SupplyType {
        return this.pickFrom(SUPPLY_TYPES);
    }

    static getEquipment(): Equipment {
        return this.pickFrom(EQUIPMENT_LIST);
    }
    static getCurrentDay(): number {
        return new Date().getDate();
    }
    static getPhoneNumber(): string {
        return faker.string.numeric(10);
    }
    static generatePriority() {
        const levels = ["High", "Medium", "Low"];
        return levels[Math.floor(Math.random() * levels.length)];
    }
    static getRandomMaterialName(): string {
        return `${faker.commerce.productMaterial()} ${faker.number.int({ min: 1000, max: 9999 })}`;
    }
}