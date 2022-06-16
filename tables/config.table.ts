import { Name, Table } from "proton-tsc";

@table("config")
export class Config extends Table {
    constructor(
        public key: Name = new Name(),
        public value: f32 = 0,  
    ) {
        super()
    }

    @primary
    get by_key(): u64 {
        return this.key.N;
    }
}