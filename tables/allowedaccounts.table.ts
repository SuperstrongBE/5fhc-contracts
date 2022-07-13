import { Name, Table, TableStore } from "proton-tsc";

@table("allowedaccs")
class AllowedAccountsTable extends Table {


    constructor(

        public key: Name = new Name(),
        public allowedmint: u32 = 0,
        public claimedAmnt: i64 = 0,
        public totalrlm: u32 = 0,

    ) {
        super()
    }
    @primary
    get by_key(): u64 {

        return this.key.N;

    }

    set by_key(value: u64) {

        this.key = Name.fromU64(value);

    }

    get by_allowedmint(): u32 {

        return this.allowedmint;

    }

}

export class AllowedAccounts extends AllowedAccountsTable { }