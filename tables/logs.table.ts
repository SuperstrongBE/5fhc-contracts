import { Name, print, Table, TableStore } from "proton-tsc";

@table("logs")
class LogsTable extends Table {
    
    constructor(
        
        public key:Name = new Name() ,
        public log:string = ""
        
    ){
        super()
    }
    @primary
    get by_index():u64{

        return this.key.N;

    }
    
    set by_index(value: u64){

        
        this.key = Name.fromU64(value);

    }

}

export class Log extends LogsTable {}