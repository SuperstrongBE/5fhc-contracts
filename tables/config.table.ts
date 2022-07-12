import { Name, Table, TableStore } from "proton-tsc";

@table("config")
class ConfigTable extends Table {
    

    constructor(
        
        public key:Name = new Name(),
        public value:i64 = 0,
        
    ){
        super()
    }
    @primary
    get by_key():u64{

        return this.key.N;

    }
    
    set by_key(value: u64){

        this.key = Name.fromU64(value);

    }

    get by_value ():i64 {

        return this.value;

    }
    

    static GetTable (code:Name):TableStore<Config>{

        return new TableStore<Config>(code,code,Name.fromString('config'))

    }

}

export class Config extends ConfigTable {}