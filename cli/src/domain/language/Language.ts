import { english } from "../../resources/config/language.js";
import * as lodash from "lodash";
import BaseEntity from "../BaseEntity.js";

/**
 * Language
 */
export default class Language extends BaseEntity {

    private lang: unknown;

    constructor() {
        super();
        this.lang = english;
    }

    public getText(attribute: string): string {
        return lodash.get(this.lang, attribute);
    }

    public getArray(attribute: string): Array<string> {
        return lodash.get(this.lang, attribute);
    }
   
}