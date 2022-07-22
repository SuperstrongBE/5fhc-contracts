import { ActionData, Asset, Name } from "proton-tsc";

@packer
export class BuyPresale extends ActionData {

    constructor(
        public from:Name = new Name(),
        public amount:Asset = new Asset(),
    ){
        super();
    }


}