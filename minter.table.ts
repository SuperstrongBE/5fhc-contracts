import { Name, Table, TableStore } from "proton-tsc";

@table("allowedmint")
class AllowedMinterTable extends Table {
    

    constructor(
        
        public account:Name = new Name(),
        public allowedmint:f32 = 0,
        
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

    get by_allowedmint ():f32 {

        return this.allowedmint;

    }
    

    static GetTable (code:Name):TableStore<AllowedMinter>{

        return new TableStore<AllowedMinter>(code,code,Name.fromString('allowedmint'))

    }

}

export class AllowedMinter extends AllowedMinterTable {}