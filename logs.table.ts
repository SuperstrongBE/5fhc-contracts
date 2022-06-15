import { Name, print, Table, TableStore } from "proton-tsc";

@table("logs")
class LogsTable extends Table {
    

    constructor(
        
        public index:u64,
        public log:string = ""
        
    ){
        super()
    }
    @primary
    get by_index():u64{

        return this.index;

    }
    
    set by_key(value: u64){

        
        this.index = value;

    }

    @secondary
    set_log(value:string):void{
        print(value);
        this.log = value
    }

    
    

    static GetTable (code:Name):TableStore<Log>{

        return new TableStore<Log>(code,code,Name.fromString('logs'))

    }

}

export class Log extends LogsTable {}