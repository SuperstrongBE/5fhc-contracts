import { print, Table } from "proton-tsc";

@table("logs")
export class Log extends Table {
    constructor(
        public index: u64 = 0,
        public log: string = ""
    ){
        super()
    }

    @primary
    get by_index(): u64 {
        return this.index;
    }

    @secondary
    set_log(value: string): void {
        print(value);
        this.log = value
    }
}