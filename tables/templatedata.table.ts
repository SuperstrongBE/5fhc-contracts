
import { Name, Table, TableStore } from "proton-tsc";
import { AtomicAttribute } from "proton-tsc/atomicassets";


@table("templdata")
class TemplatesTable extends Table {
    

    constructor(
        public key:Name = new Name(),
        public collectionName:Name = new Name(),
        public immmutableData:AtomicAttribute[] = [],
        public mutableData:AtomicAttribute[] = []
    ){
        super()
    }
    @primary
    get by_key():u64{

        return this.key.N;

    }
    
    set by_key(value: u64){

        this.key.N = value

    }


    static GetTable (code:Name):TableStore<TemplatesData>{

        return new TableStore<TemplatesData>(code,code,Name.fromString('templdata'))

    }



}

export class TemplatesData extends TemplatesTable {}