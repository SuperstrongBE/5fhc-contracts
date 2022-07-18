import { ActionData, Asset, Name } from "proton-tsc";

@packer
export class ActWithdraw extends ActionData {

    constructor(
        public actor:Name = new Name(),
        public amount:Asset = new Asset(),
        public tokenContract:Name = Name.fromString('eosio.token')
    ){

        super()

    }


}