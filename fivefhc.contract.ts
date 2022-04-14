
import { Asset, Contract,Contracts, Name, requireAuth, Symbol, TableStore,ExtendedSymbol, ExtendedAsset } from 'proton-tsc';
import { AtomicAttribute, AtomicValue, sendMintAsset } from "./node_modules/proton-tsc/assembly/atomicassets"
import { Items } from './items.table'

@contract
export class fivefhc extends Contracts.Allow.AllowContract {

  private itemTable:TableStore<Items> = Items.GetTable(this.receiver);
  private static FULL_PRICE:Asset = new Asset(10000000,new Symbol('FOOBAR',6))
  private static REDUCED_PRICE:Asset = new Asset(7000000,new Symbol('FOOBAR',6))
    

  @action("mintitem")
  mintitem(owner:Name, rl_multiplier:u32 ): void {
    
    this.checkContractIsNotPaused();
    requireAuth(this.receiver); 
    const name:Name = new Name()
    const authorizedMinter = Name.fromString('fivefhc')
    const exAsset = new ExtendedAsset(fivefhc.FULL_PRICE,this.receiver);
    const item:Items = new Items(name,978645123,owner,owner,rl_multiplier);
    this.itemTable.set(item,this.receiver);
    //Contracts.Token.sendTransferTokens(owner,this.receiver,[exAsset],'');
    sendMintAsset(this.contract,authorizedMinter,Name.fromString('524vigo'),Name.fromString('524vigo'),98766,owner,[],[],[]);

  }
}
