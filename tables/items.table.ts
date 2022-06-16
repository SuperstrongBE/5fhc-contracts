import { Name, Table } from "proton-tsc";

// Set according to order of @secondary
export const CURRENT_OWNER_SECONDARY_INDEX: u8 = 0
export const ORIGINAL_OWNER_SECONDARY_INDEX: u8 = 1

@table("items")
export class Item extends Table {
    constructor(
        public aa_assetid: u64 = 0,
        public curr_owner: Name = new Name(),
        public og_owner: Name = new Name(),
        public rl_multiplier: i32 = 0
    ){
        super()
    }

    @primary
    get by_assetid(): u64 {
        return this.aa_assetid;
    }

    @secondary
    get by_curr_owner(): u64 {
        return this.curr_owner.N;
    }
    
    set by_curr_owner(value: u64) {
        this.curr_owner = Name.fromU64(value);
    }
   
    @secondary
    get by_og_owner(): u64 {
        return this.curr_owner.N;
    }
    
    set by_og_owner(value: u64) {
        this.og_owner = Name.fromU64(value);
    }
}