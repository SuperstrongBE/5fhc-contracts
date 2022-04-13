import { Name, Table, TableStore } from "proton-tsc";


@table("items")
class ItemsTable extends Table {

    constructor(
        public item_name:Name = new Name(),
        public aa_assetid:u64 = 0,
        public curr_owner:Name = new Name(),
        public og_owner:Name = new Name(),
        public rl_multiplier:u32 = 0
    ){
        super();
    }

    @primary
    get primary():u64{

        return this.item_name.N;

    }
    
    @secondary
    get by_assetid():u64{

        return this.aa_assetid;

    }
    
    set by_assetid(value: u64){

        this.aa_assetid = value;

    }
    
    @secondary
    get by_curr_owner():u64{

        return this.curr_owner.N;

    }
    
    set by_curr_owner(value: u64){

        this.curr_owner = Name.fromU64(value);

    }
   
    @secondary
    get by_og_owner():u64{

        return this.curr_owner.N;

    }
    
    set by_og_owner(value: u64){

        this.og_owner = Name.fromU64(value);

    }

    static GetTable (code:Name):TableStore<Items>{

        return new TableStore<Items>(code,code,Name.fromString('items'))

    }



}

export class Items extends ItemsTable {}