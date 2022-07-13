import { ActionData, Name } from "proton-tsc";

@packer
export class UpdateClaim extends ActionData {

    constructor(
        public actor:Name = new Name(),
        public claimedAmnt:i64 = 0
    ){

        super()

    }


}