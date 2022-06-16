import { Name, Table } from "proton-tsc";

@table("allowedmint")
export class AllowedMinter extends Table {
    constructor(
        public account: Name = new Name(),
        public allowedmint: f32 = 0,
    ){
        super()
    }

    @primary
    get by_key(): u64 {
        return this.account.N;
    }

    get by_allowedmint (): f32 {
        return this.allowedmint;
    }
}