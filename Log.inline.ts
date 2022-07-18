import { ActionData, Name } from "proton-tsc";

@packer
export class AddLog extends ActionData {

    constructor(
        public key:Name = new Name(),
        public log:string = ""
    ){

        super()

    }


}