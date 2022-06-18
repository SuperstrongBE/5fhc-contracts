import { Name, Table, TableStore } from "proton-tsc";

@table("allowedaccs")
class AllowedAccountsTable extends Table {
    

    constructor(
        
        public account:Name = new Name(),
        public allowedmint:u32 = 0,
        public claimedAmnt:f32 = 0,
        public totalrlm:u32 = 0,
        
    ){
        super()
    }
    @primary
    get by_key():u64{

        return this.account.N;

    }
    
    set by_key(value: u64){

        this.account = Name.fromU64(value);

    }

    get by_allowedmint ():u32 {

        return this.allowedmint;

    }
    

    static GetTable (code:Name):TableStore<AllowedAccounts>{

        return new TableStore<AllowedAccounts>(code,code,Name.fromString('allowedaccs'))

    }

}

export class AllowedAccounts extends AllowedAccountsTable {}