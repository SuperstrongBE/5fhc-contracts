import { Config } from "./tables/config.table";
import { AllowedAccounts } from "./tables/allowedaccounts.table";
import { Asset, check, Contract, ExtendedAsset, InlineAction, Name, PermissionLevel, print, Symbol, TableStore } from "proton-tsc";
import { LoyaltyHWMKey, ShareIndexKey, SplitSharePercentKey } from "./fivefhc.constant";
import { sendTransferTokens } from "proton-tsc/token";
import { UpdateClaim } from "./fivefhc.inline";


@contract
export class fivefhcvault extends Contract {

    private accountTable: TableStore<AllowedAccounts> = new TableStore<AllowedAccounts>(Name.fromString('fivefhc'));
    private configTable: TableStore<Config> = new TableStore<Config>(Name.fromString('fivefhc'));

    @action('claimincome')
    claimincome(actor: Name): void {


        const totalShares = this.configTable.get(Name.fromString(ShareIndexKey).N);
        check(!!totalShares, "Config not found: ShareIndexKey")
        if (!totalShares) return
        const loyaltyHWM = this.configTable.get(Name.fromString(LoyaltyHWMKey).N);
        check(!!loyaltyHWM, "Config not found: loyaltyHWM")
        if (!loyaltyHWM) return;

        const amntPerShare = loyaltyHWM.value / totalShares.value
        const account = this.accountTable.get(actor.N);
        check(!!account, "Unknow account")
        if (!account) return;
        const widthdrawAmount: i64 = (amntPerShare * account.totalrlm) - account.claimedAmnt;
        check(widthdrawAmount > 0, 'Withdraw is 0')
        if (widthdrawAmount == 0) return;
        account.claimedAmnt += widthdrawAmount;

        const targetContract = Name.fromString('fivefhcshit');
        const updateclaim = new InlineAction<UpdateClaim>('updateclaim');
        const action = updateclaim.act(targetContract, new PermissionLevel(this.receiver))
        const actionParams = new UpdateClaim(actor, widthdrawAmount);
        action.send(actionParams);
        print('Ok actiion was sent!')
        //sendTransferTokens(Name.fromString('fivefhcvault'), account.key, [new ExtendedAsset(new Asset(widthdrawAmount, new Symbol('XPR', 4)), this.firstReceiver)], '')

    }


}