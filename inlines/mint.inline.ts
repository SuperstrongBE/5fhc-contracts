import { ActionData, Asset, Name } from "proton-tsc";

@packer
export class Mint extends ActionData {

    constructor(
        public from:Name = new Name(),
        
    ){

        super()

    }


}