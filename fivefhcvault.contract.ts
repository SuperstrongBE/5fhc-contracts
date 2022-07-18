import { Asset, Contract, ExtendedAsset, Name, requireAuth } from "proton-tsc";
import { sendTransferTokens } from "proton-tsc/token";

@contract
export class fivefhcvault extends Contract {


    @action('actwithdraw')
    actwithdraw(actor:Name,amount:Asset,tokenContract:Name):void{

        requireAuth(Name.fromString('fivefhcshit'));
        sendTransferTokens(this.receiver, actor, [new ExtendedAsset(amount, tokenContract)], '');

    }


}